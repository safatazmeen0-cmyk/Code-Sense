import ast
import re
from flask import Blueprint, jsonify, request

from ml.predict import predict_error_category
from recommendation.concept_mapping import get_recommendation
from routes.history import save_history_entry
from utils.code_parser import build_prediction_text, parse_python_code
from utils.error_extractor import confidence_from_prediction, error_type_for

analyze_bp = Blueprint("analyze", __name__)


def analyze_ast_details(code):
    """Extracts structural metadata, complexity estimates, and improvements from Python code."""
    details = {
        "functions": [],
        "variables": [],
        "has_loops": False,
        "loop_depth": 0,
        "time_complexity": "O(1)",
        "space_complexity": "O(1)",
        "summary": "Executes sequential instructions.",
        "improvements": [],
        "learn_next": [],
    }

    try:
        tree = ast.parse(code)
    except Exception:
        return details

    assigned_vars = set()
    func_names = []
    max_depth = 0

    class ComplexityVisitor(ast.NodeVisitor):
        def __init__(self):
            self.current_loop_depth = 0
            self.max_loop_depth = 0
            self.uses_dynamic_memory = False

        def visit_For(self, node):
            self.current_loop_depth += 1
            if self.current_loop_depth > self.max_loop_depth:
                self.max_loop_depth = self.current_loop_depth
            self.generic_visit(node)
            self.current_loop_depth -= 1

        def visit_While(self, node):
            self.current_loop_depth += 1
            if self.current_loop_depth > self.max_loop_depth:
                self.max_loop_depth = self.current_loop_depth
            self.generic_visit(node)
            self.current_loop_depth -= 1

        def visit_ListComp(self, node):
            self.uses_dynamic_memory = True
            self.generic_visit(node)

        def visit_DictComp(self, node):
            self.uses_dynamic_memory = True
            self.generic_visit(node)

        def visit_FunctionDef(self, node):
            func_names.append(node.name)
            # Check for docstring
            if not (node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant)):
                details["improvements"].append({
                    "type": "documentation",
                    "message": f"Function '{node.name}' has no docstring. Adding comments or docstrings improves readability."
                })
            self.generic_visit(node)

        def visit_Name(self, node):
            if isinstance(node.ctx, ast.Store):
                assigned_vars.add(node.id)
            self.generic_visit(node)

        def visit_Compare(self, node):
            # Check for redundant '== True' or '== False'
            for comparator in node.comparators:
                if isinstance(comparator, ast.Constant) and isinstance(comparator.value, bool):
                    details["improvements"].append({
                        "type": "style",
                        "message": "Comparison with boolean literal ('== True/False') can be simplified to 'if condition:'."
                    })
            self.generic_visit(node)

    visitor = ComplexityVisitor()
    visitor.visit(tree)

    details["functions"] = func_names
    details["variables"] = sorted(list(assigned_vars))
    details["has_loops"] = visitor.max_loop_depth > 0
    details["loop_depth"] = visitor.max_loop_depth

    # Time complexity heuristic
    if visitor.max_loop_depth == 0:
        details["time_complexity"] = "O(1)"
        details["summary"] = "Runs in constant time O(1) with sequential statement execution."
    elif visitor.max_loop_depth == 1:
        details["time_complexity"] = "O(n)"
        details["summary"] = "Iterates through data in linear time O(n) proportional to input size."
    elif visitor.max_loop_depth == 2:
        details["time_complexity"] = "O(n²)"
        details["summary"] = "Contains nested iteration running in quadratic time O(n²). Consider optimizing if dataset is large."
    else:
        details["time_complexity"] = f"O(n^{visitor.max_loop_depth})"
        details["summary"] = f"High loop depth detected ({visitor.max_loop_depth} levels). May scale exponentially."

    # Space complexity heuristic
    if visitor.uses_dynamic_memory or any(kw in code for kw in [".append", ".extend", "list("]):
        details["space_complexity"] = "O(n)"
    else:
        details["space_complexity"] = "O(1)"

    # Improvement tips on short single-letter variables (excluding standard loop counters like i, j, k, n)
    standard_counters = {"i", "j", "k", "n", "x", "y", "_"}
    obscure_short_vars = [v for v in assigned_vars if len(v) == 1 and v not in standard_counters]
    if obscure_short_vars:
        details["improvements"].append({
            "type": "naming",
            "message": f"Consider using descriptive names instead of single-letter identifiers ({', '.join(obscure_short_vars)})."
        })

    # What to learn next recommendations
    if visitor.max_loop_depth > 0 and "ListComp" not in code:
        details["learn_next"].append({
            "topic": "List Comprehensions",
            "explanation": "Write concise, expressive loops to create lists in a single Pythonic line.",
            "difficulty": "Intermediate",
            "reference": "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions"
        })

    if func_names:
        details["learn_next"].append({
            "topic": "Type Hints & Docstrings",
            "explanation": "Document expected argument and return types using Python PEP 484 annotations.",
            "difficulty": "Intermediate",
            "reference": "https://docs.python.org/3/library/typing.html"
        })
    else:
        details["learn_next"].append({
            "topic": "Functions & Modular Code",
            "explanation": "Encapsulate logic into reusable functions with parameters and return statements.",
            "difficulty": "Beginner",
            "reference": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
        })

    return details


@analyze_bp.post("/analyze")
def analyze_code():
    payload = request.get_json(silent=True) or {}
    code = (payload.get("code") or "").strip()
    filename = payload.get("filename", "main.py")
    language = payload.get("language", "python").lower()

    if not code:
        return jsonify({"success": False, "message": "Please enter some code first."}), 400

    # For non-python languages in the first release, perform basic brace matching & syntax check
    if language != "python":
        unmatched_stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for idx, ch in enumerate(code):
            if ch in "({[":
                unmatched_stack.append((ch, idx))
            elif ch in ")}]":
                if not unmatched_stack or unmatched_stack[-1][0] != pairs[ch]:
                    line_num = code[:idx].count("\n") + 1
                    error_res = {
                        "success": True,
                        "has_error": True,
                        "error_category": "Syntax Error",
                        "error_type": "Unmatched Bracket",
                        "error_message": f"Unmatched closing bracket '{ch}'",
                        "line": line_num,
                        "column": idx - code.rfind("\n", 0, idx),
                        "concept": f"{language.title()} Syntax and Blocks",
                        "status": "Needs Revision",
                        "status_type": "error",
                        "filename": filename,
                    }
                    save_history_entry(code, error_res, filename=filename, status="Needs Revision")
                    return jsonify(error_res)
                unmatched_stack.pop()

        clean_non_py = {
            "success": True,
            "has_error": False,
            "message": "No syntax errors detected.",
            "status": "Correct",
            "status_type": "correct",
            "confidence": 0.95,
            "filename": filename,
            "complexity": {"time": "O(1)", "space": "O(1)"},
            "improvements": [],
            "learn_next": [
                {
                    "topic": f"{language.title()} Language Fundamentals",
                    "explanation": f"Explore idioms and standard libraries for {language.title()}.",
                    "difficulty": "Beginner",
                }
            ],
        }
        save_history_entry(code, clean_non_py, filename=filename, status="Correct")
        return jsonify(clean_non_py)

    # Standard Python analysis pipeline
    issue = parse_python_code(code)
    code_details = analyze_ast_details(code)

    if not issue.has_error:
        has_improvements = len(code_details["improvements"]) > 0
        status_type = "improvement" if has_improvements else "correct"
        result = {
            "success": True,
            "has_error": False,
            "message": "No errors detected." if not has_improvements else "Code works, but could be improved.",
            "status": "Correct" if not has_improvements else "Needs Improvement",
            "status_type": status_type,
            "confidence": 0.98,
            "filename": filename,
            "complexity": {
                "time": code_details["time_complexity"],
                "space": code_details["space_complexity"],
            },
            "summary": code_details["summary"],
            "functions": code_details["functions"],
            "variables": code_details["variables"],
            "improvements": code_details["improvements"],
            "learn_next": code_details["learn_next"],
        }
        save_history_entry(code, result, filename=filename, status=result["status"], action_type="analysis")
        return jsonify(result)

    # Error detected - ML classification
    try:
        prediction_text = build_prediction_text(code, issue)
        predicted_category, model_confidence = predict_error_category(prediction_text)
    except Exception as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "The ML model is unavailable. Run training and try again.",
                    "details": str(exc),
                }
            ),
            503,
        )

    category = issue.category or predicted_category
    if not category or (category == "Runtime Error" and predicted_category != "Runtime Error"):
        category = predicted_category or issue.category or "Runtime Error"

    recommendation = get_recommendation(category)
    result = {
        "success": True,
        "has_error": True,
        "error_category": category,
        "error_type": error_type_for(category, issue.message),
        "error_message": issue.message,
        "line": issue.line,
        "column": issue.column,
        "concept": recommendation.get("concept", "Python Programming"),
        "difficulty": recommendation.get("difficulty", "Beginner"),
        "explanation": make_explanation(category, issue.message, recommendation),
        "suggested_fix": make_fix(category, issue.message),
        "confidence": confidence_from_prediction(model_confidence),
        "recommendation": recommendation,
        "status": "Needs Revision",
        "status_type": "error",
        "filename": filename,
        "complexity": {
            "time": code_details["time_complexity"],
            "space": code_details["space_complexity"],
        },
        "summary": code_details["summary"],
        "improvements": code_details["improvements"],
        "learn_next": code_details["learn_next"],
    }
    save_history_entry(code, result, filename=filename, status="Needs Revision", action_type="analysis")
    return jsonify(result)


def make_explanation(category, message, recommendation):
    msg = (message or "").strip()
    if category == "Syntax Error":
        return f"Python could not understand the statement syntax. Details: {msg or 'Invalid syntax structure'}."
    if category == "Indentation Error":
        return f"Python uses indentation to group code blocks. Details: {msg or 'Unexpected or missing indentation'}."
    if category == "Name Error":
        return f"A variable, function, or name is used before it was defined. Details: {msg}."
    if category == "Type Error":
        return f"An operation or function was applied to an incompatible data type. Details: {msg}."
    if category == "Index Error":
        return f"An attempt was made to access a list or sequence element outside its valid index range. Details: {msg}."
    if category == "Import Error":
        return f"Python was unable to import the requested module or object. Details: {msg}."
    if category == "Logical Error":
        return "The code ran, but the condition or expression produces an unexpected outcome."
    if category == "Runtime Error":
        return f"An error occurred while executing the program. Details: {msg}."
    return recommendation.get("why", "The program encountered an error during execution.")


def make_fix(category, message):
    fixes = {
        "Syntax Error": "Check the highlighted line for missing colons, brackets, quotes, or keywords.",
        "Indentation Error": "Ensure all statements within the same block are indented with four spaces consistently.",
        "Name Error": "Verify the spelling of the variable or function name, and make sure it is assigned before use.",
        "Type Error": "Convert values to compatible types before combining them (e.g. str(value) or int(value)).",
        "Import Error": "Check the module name spelling and ensure the required library is installed in your Python environment.",
        "Index Error": "Check the list length with len() and ensure the index is between 0 and len(list) - 1.",
        "Logical Error": "Trace variable values step by step and verify your comparison operators and boundary conditions.",
        "Runtime Error": "Validate inputs before running operations, or use try/except to gracefully handle exceptions.",
    }
    return fixes.get(category, "Read the error message, validate inputs, and handle edge cases explicitly.")
import ast
import builtins
import re
import subprocess
import sys
from dataclasses import dataclass


@dataclass
class CodeIssue:
    has_error: bool
    category: str | None = None
    message: str | None = None
    line: int | None = None
    column: int | None = None
    exception_name: str | None = None
    raw_traceback: str | None = None


PYTHON_BUILTINS = set(dir(builtins))

EXCEPTION_TO_CATEGORY = {
    "SyntaxError": "Syntax Error",
    "IndentationError": "Indentation Error",
    "TabError": "Indentation Error",
    "NameError": "Name Error",
    "UnboundLocalError": "Name Error",
    "TypeError": "Type Error",
    "IndexError": "Index Error",
    "ImportError": "Import Error",
    "ModuleNotFoundError": "Import Error",
    "ZeroDivisionError": "Runtime Error",
    "KeyError": "Runtime Error",
    "ValueError": "Runtime Error",
    "AttributeError": "Runtime Error",
    "RecursionError": "Runtime Error",
    "OverflowError": "Runtime Error",
    "MemoryError": "Runtime Error",
    "FileNotFoundError": "Runtime Error",
    "StopIteration": "Runtime Error",
    "RuntimeError": "Runtime Error",
    "AssertionError": "Logical Error",
}


class NameUseVisitor(ast.NodeVisitor):
    def __init__(self):
        self.assigned = set()
        self.imported = set()
        self.used = []

    def visit_Import(self, node):
        for alias in node.names:
            self.imported.add(alias.asname or alias.name.split(".")[0])

    def visit_ImportFrom(self, node):
        for alias in node.names:
            self.imported.add(alias.asname or alias.name)

    def visit_FunctionDef(self, node):
        self.assigned.add(node.name)
        local = NameUseVisitor()
        local.assigned = self.assigned | self.imported | {arg.arg for arg in node.args.args}
        for child in node.body:
            local.visit(child)
        self.used.extend(local.used)

    def visit_AsyncFunctionDef(self, node):
        self.visit_FunctionDef(node)

    def visit_Assign(self, node):
        self.visit(node.value)
        for target in node.targets:
            self._collect_target(target)

    def visit_AnnAssign(self, node):
        if node.value:
            self.visit(node.value)
        self._collect_target(node.target)

    def visit_For(self, node):
        self.visit(node.iter)
        self._collect_target(node.target)
        for child in node.body + node.orelse:
            self.visit(child)

    def visit_Name(self, node):
        if isinstance(node.ctx, ast.Load):
            self.used.append((node.id, getattr(node, "lineno", None), getattr(node, "col_offset", None)))
        elif isinstance(node.ctx, (ast.Store, ast.Param)):
            self.assigned.add(node.id)

    def _collect_target(self, target):
        if isinstance(target, ast.Name):
            self.assigned.add(target.id)
        elif isinstance(target, (ast.Tuple, ast.List)):
            for elt in target.elts:
                self._collect_target(elt)
        else:
            self.visit(target)


def detect_undefined_names(tree):
    visitor = NameUseVisitor()
    visitor.visit(tree)
    known = visitor.assigned | visitor.imported | PYTHON_BUILTINS
    for name, line, col in visitor.used:
        if name not in known:
            return CodeIssue(
                has_error=True,
                category="Name Error",
                message=f"name '{name}' is not defined",
                line=line,
                column=col,
                exception_name="NameError",
            )
    return None


def run_isolated_check(code, timeout_seconds=3.5):
    """Safely runs the code in an isolated child process to intercept runtime exceptions."""
    try:
        proc = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except subprocess.TimeoutExpired:
        return CodeIssue(
            has_error=True,
            category="Runtime Error",
            message="Execution timed out. The program took too long to run (possible infinite loop).",
            exception_name="TimeoutError",
        )
    except Exception as exc:
        return CodeIssue(
            has_error=True,
            category="Runtime Error",
            message=f"Process execution error: {str(exc)}",
            exception_name="RuntimeError",
        )

    if proc.returncode != 0 and proc.stderr:
        stderr = proc.stderr.strip()
        lines = stderr.splitlines()

        # Extract line number from traceback (most recent frame)
        line_num = None
        for line in reversed(lines):
            match = re.search(r'File "(?:<string>|.*?)", line (\d+)', line)
            if match:
                line_num = int(match.group(1))
                break

        # Extract exception type and message from last non-empty line
        last_line = lines[-1] if lines else "Error"
        exc_name = "RuntimeError"
        exc_msg = last_line

        exc_match = re.match(r"^([A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception)(?::\s*(.*))?$", last_line)
        if exc_match:
            exc_name = exc_match.group(1)
            exc_msg = (exc_match.group(2) or "").strip()

        category = EXCEPTION_TO_CATEGORY.get(exc_name, "Runtime Error")

        return CodeIssue(
            has_error=True,
            category=category,
            message=exc_msg or last_line,
            line=line_num,
            exception_name=exc_name,
            raw_traceback=stderr,
        )

    return CodeIssue(has_error=False)


def parse_python_code(code):
    """
    Multi-stage inspection:
    1. Static AST parsing for syntax and indentation errors
    2. Static name analysis for undefined identifiers
    3. Isolated dry-run for runtime errors (IndexError, TypeError, ZeroDivision, etc.)
    """
    # 1. Static AST syntax check
    try:
        tree = ast.parse(code)
    except IndentationError as exc:
        return CodeIssue(
            has_error=True,
            category="Indentation Error",
            message=exc.msg,
            line=exc.lineno,
            column=exc.offset,
            exception_name="IndentationError",
        )
    except SyntaxError as exc:
        return CodeIssue(
            has_error=True,
            category="Syntax Error",
            message=exc.msg,
            line=exc.lineno,
            column=exc.offset,
            exception_name="SyntaxError",
        )

    # 2. Static name definition check
    name_issue = detect_undefined_names(tree)
    if name_issue:
        return name_issue

    # 3. Isolated runtime execution check
    runtime_issue = run_isolated_check(code)
    if runtime_issue.has_error:
        return runtime_issue

    return CodeIssue(has_error=False)


def build_prediction_text(code, issue):
    parts = [code or ""]
    if issue:
        if issue.exception_name:
            parts.append(issue.exception_name)
        if issue.message:
            parts.append(issue.message)
        if issue.category:
            parts.append(issue.category)
    return " ".join(parts)
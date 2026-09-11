ERROR_TYPES = {
    "Syntax Error": "Invalid Syntax",
    "Indentation Error": "Incorrect Indentation",
    "Name Error": "Undefined Name",
    "Type Error": "Invalid Type Operation",
    "Runtime Error": "Runtime Failure",
    "Import Error": "Missing Import",
    "Index Error": "Index Out of Range",
    "Logical Error": "Incorrect Logic",
}


def normalize_error_category(category):
    if not category:
        return "Runtime Error"
    cleaned = str(category).replace("_", " ").strip().title()
    aliases = {
        "Syntaxerror": "Syntax Error",
        "Nameerror": "Name Error",
        "Typeerror": "Type Error",
        "Runtimeerror": "Runtime Error",
        "Indentationerror": "Indentation Error",
        "Importerror": "Import Error",
        "Indexerror": "Index Error",
        "Logicalerror": "Logical Error",
    }
    return aliases.get(cleaned.replace(" ", ""), cleaned)


def error_type_for(category, message=""):
    lowered = (message or "").lower()
    if "expected an indented block" in lowered:
        return "Expected Indented Block"
    if "was never closed" in lowered:
        return "Unclosed Bracket or String"
    if "not defined" in lowered:
        return "Undefined Name"
    if "no module named" in lowered:
        return "Module Not Found"
    return ERROR_TYPES.get(category, "Programming Error")


def confidence_from_prediction(probability, default=0.86):
    try:
        value = float(probability)
    except (TypeError, ValueError):
        value = default
    return round(max(0.55, min(value, 0.99)), 2)
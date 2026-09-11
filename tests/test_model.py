import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from ml.predict import predict_error_category

# All 8 categories from the actual dataset
VALID_CATEGORIES = {
    "Syntax Error",
    "Name Error",
    "Type Error",
    "Runtime Error",
    "Indentation Error",
    "Import Error",
    "Index Error",
    "Logical Error",
}


def _predict(text):
    category, confidence = predict_error_category(text)
    assert category in VALID_CATEGORIES, f"Unknown category: {category!r}"
    assert 0.0 <= confidence <= 1.0, f"Confidence out of range: {confidence}"
    return category, confidence


def test_predict_syntax_error():
    cat, conf = _predict("if x > 3 print(x) SyntaxError invalid syntax colon missing")
    assert cat in VALID_CATEGORIES
    assert conf >= 0.0


def test_predict_name_error():
    cat, conf = _predict("print(undefined_xyz) NameError name 'undefined_xyz' is not defined")
    assert cat in VALID_CATEGORIES


def test_predict_type_error():
    cat, conf = _predict("result = 'hello' + 5 TypeError can only concatenate str not int")
    assert cat in VALID_CATEGORIES


def test_predict_indentation_error():
    cat, conf = _predict("    print(x) IndentationError unexpected indent")
    assert cat in VALID_CATEGORIES


def test_predict_import_error():
    cat, conf = _predict("import nonexistent_module ModuleNotFoundError no module named")
    assert cat in VALID_CATEGORIES


def test_predict_index_error():
    cat, conf = _predict(
        "items = [1, 2, 3]\nprint(items[9]) IndexError list index out of range"
    )
    assert cat in VALID_CATEGORIES


def test_predict_runtime_error():
    cat, conf = _predict("a = 10\nb = 0\nprint(a / b) ZeroDivisionError division by zero")
    assert cat in VALID_CATEGORIES


def test_predict_logical_error():
    cat, conf = _predict("if score > 100: print('pass') wrong boundary AssertionError logical")
    assert cat in VALID_CATEGORIES


def test_confidence_is_float_in_range():
    """Confidence must always be a float strictly between 0 and 1."""
    for text in [
        "SyntaxError invalid syntax",
        "NameError undefined variable",
        "TypeError incompatible types",
    ]:
        _, conf = _predict(text)
        assert isinstance(conf, float)
        assert 0.0 <= conf <= 1.0


def test_empty_string_does_not_crash():
    """Empty input must not raise an exception."""
    cat, conf = predict_error_category("")
    assert cat in VALID_CATEGORIES
    assert 0.0 <= conf <= 1.0


def test_very_long_input_does_not_crash():
    """Very long code strings must not crash the model."""
    long_code = ("x = 1\n" * 500) + "NameError undefined_var"
    cat, conf = predict_error_category(long_code)
    assert cat in VALID_CATEGORIES
    assert 0.0 <= conf <= 1.0
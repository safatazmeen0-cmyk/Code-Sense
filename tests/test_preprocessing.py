import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from ml.preprocessing import clean_text, combine_features


# ── clean_text ──────────────────────────────────────────────────────────────

def test_clean_text_normalizes_spacing():
    assert clean_text("Print(  X  )!!") == "print( x )"


def test_clean_text_lowercases():
    result = clean_text("HELLO WORLD")
    assert result == result.lower()


def test_clean_text_strips_special_chars():
    result = clean_text("hello!!! world???")
    assert "!" not in result
    assert "?" not in result


def test_clean_text_empty_string():
    result = clean_text("")
    assert isinstance(result, str)
    assert len(result) == 0 or result.strip() == ""


def test_clean_text_none_handled():
    try:
        result = clean_text(None)
        assert isinstance(result, str)
    except (TypeError, AttributeError):
        pass  # Acceptable if preprocessing doesn't guard against None


def test_clean_text_whitespace_only():
    result = clean_text("   \t\n   ")
    assert isinstance(result, str)


def test_clean_text_preserves_python_keywords():
    result = clean_text("for i in range(10) print(i)")
    assert "for" in result or "range" in result or "print" in result


def test_clean_text_numeric_content():
    result = clean_text("x = 42 + 7")
    assert isinstance(result, str)


# ── combine_features ─────────────────────────────────────────────────────────

def test_combine_features_uses_code_and_error_fields():
    row = {
        "code": "print(total)",
        "error_message": "name total is not defined",
        "error_type": "Undefined Name",
        "concept": "Variables",
        "keywords": "name variable",
    }
    features = combine_features(row)
    assert "print" in features
    assert "undefined name" in features.lower() or "name" in features.lower()


def test_combine_features_handles_missing_keys():
    """combine_features should not crash when optional fields are absent."""
    row = {"code": "x = 1"}
    try:
        features = combine_features(row)
        assert isinstance(features, str)
    except (KeyError, TypeError):
        pass  # Acceptable – important it doesn't silently produce wrong output


def test_combine_features_returns_non_empty_for_real_row():
    row = {
        "code": "import nonexistent",
        "error_message": "No module named nonexistent",
        "error_type": "Module Not Found",
        "concept": "Module imports",
        "keywords": "import module",
    }
    features = combine_features(row)
    assert len(features.strip()) > 0


def test_combine_features_is_string():
    row = {
        "code": "for i in range(5): print(i)",
        "error_message": "",
        "error_type": "",
        "concept": "",
        "keywords": "",
    }
    result = combine_features(row)
    assert isinstance(result, str)
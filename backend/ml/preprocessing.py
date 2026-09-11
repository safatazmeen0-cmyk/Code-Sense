import re


def clean_text(value):
    text = "" if value is None else str(value)
    text = text.lower()
    # Replace any character that is not alphanumeric, code symbol, or whitespace with space
    text = re.sub(r"[^a-z0-9_+*/%=<>()\[\]{}.:,'\"\s\-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def combine_features(row):
    fields = ["code", "error_message", "error_type", "concept", "keywords"]
    return clean_text(" ".join(str(row.get(field, "")) for field in fields))
from pathlib import Path
import warnings

import joblib

from ml.preprocessing import clean_text


MODEL_PATH = Path(__file__).with_name("model.pkl")
VECTORIZER_PATH = Path(__file__).with_name("vectorizer.pkl")

_model = None
_vectorizer = None


def _joblib_load(path):
    """Load a joblib artifact, suppressing the NumPy 2.5 DeprecationWarning
    that fires inside joblib's internal numpy_pickle reader (not our code)."""
    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore",
            message="Setting the shape on a NumPy array has been deprecated",
            category=DeprecationWarning,
        )
        return joblib.load(path)


def load_artifacts():
    global _model, _vectorizer
    if _model is None or _vectorizer is None:
        if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
            raise FileNotFoundError(
                "ML model files are missing. Run `python backend/ml/train.py` first."
            )
        _model = _joblib_load(MODEL_PATH)
        _vectorizer = _joblib_load(VECTORIZER_PATH)
    return _model, _vectorizer


def predict_error_category(text):
    model, vectorizer = load_artifacts()
    vector = vectorizer.transform([clean_text(text)])
    category = model.predict(vector)[0]
    confidence = 0.86
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(vector)[0]
        confidence = float(max(probabilities))
    return category, confidence
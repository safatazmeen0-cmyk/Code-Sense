from pathlib import Path
import sys

# Ensure backend directory is in path when run directly
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

try:
    from ml.preprocessing import combine_features
except ImportError:
    from preprocessing import combine_features


ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT / "dataset" / "error_dataset.csv"
MODEL_PATH = Path(__file__).with_name("model.pkl")
VECTORIZER_PATH = Path(__file__).with_name("vectorizer.pkl")


def train_model():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    data = pd.read_csv(DATASET_PATH).fillna("")
    required = {"code", "error_category"}
    missing = required - set(data.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")

    data["features"] = data.apply(combine_features, axis=1)
    x_train, x_test, y_train, y_test = train_test_split(
        data["features"],
        data["error_category"],
        test_size=0.25,
        random_state=42,
        stratify=data["error_category"],
    )

    pipeline = Pipeline(
        [
            ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("model", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
    pipeline.fit(x_train, y_train)

    predictions = pipeline.predict(x_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Accuracy: {accuracy:.2f}")
    print(classification_report(y_test, predictions, zero_division=0))

    joblib.dump(pipeline.named_steps["model"], MODEL_PATH)
    joblib.dump(pipeline.named_steps["vectorizer"], VECTORIZER_PATH)
    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved vectorizer to {VECTORIZER_PATH}")
    return accuracy


if __name__ == "__main__":
    train_model()
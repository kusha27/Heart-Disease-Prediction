import json
from pathlib import Path

import joblib
import pandas as pd
from scipy import sparse
from sklearn.datasets import fetch_openml
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
DATA_DIR.mkdir(exist_ok=True)
MODEL_DIR.mkdir(exist_ok=True)

FEATURE_COLUMNS = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]


def load_dataset():
    dataset = fetch_openml("heart", version=1, as_frame=False, parser="auto")
    values = dataset.data
    if sparse.issparse(values):
        values = values.toarray()
    df = pd.DataFrame(values, columns=FEATURE_COLUMNS)
    target = pd.Series(dataset.target).astype(int)
    if set(target.unique()) == {-1, 1}:
        target = (target == 1).astype(int)
    return df, target


def evaluate_model(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    return {
        "model": name,
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "confusion_matrix": [int(tn), int(fp), int(fn), int(tp)],
    }


def main():
    df, y = load_dataset()
    X = df.copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=500, random_state=42)),
        ]),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42),
        "SVM": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(probability=True, random_state=42)),
        ]),
        "KNN": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=5)),
        ]),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    }

    results = []
    best_name = "Logistic Regression"
    best = None

    for name, model in models.items():
        model.fit(X_train, y_train)
        score = evaluate_model(name, model, X_test, y_test)
        results.append(score)
        if best is None or score["f1"] > best["f1"]:
            best = score
            best_name = name

    pipeline = models[best_name]
    joblib.dump(pipeline, MODEL_DIR / "heartcare_pipeline.joblib")

    payload = {
        "model_version": "heartcare-v1.0",
        "selected_model_name": best_name,
        "selected_model": best_name,
        "dataset": "UCI Heart Disease dataset",
        "evaluation_dataset": "20% hold-out test split",
        "results": results,
    }
    with open(MODEL_DIR / "model_metrics.json", "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)

    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()

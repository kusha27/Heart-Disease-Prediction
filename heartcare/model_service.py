import json
import runpy
from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "heartcare_pipeline.joblib"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"

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


def ensure_model_ready():
    if MODEL_PATH.exists() and METRICS_PATH.exists():
        return
    script_path = BASE_DIR / "scripts" / "train_model.py"
    if script_path.exists():
        runpy.run_path(str(script_path))


def load_model_bundle():
    ensure_model_ready()
    model = joblib.load(MODEL_PATH)
    with open(METRICS_PATH, "r", encoding="utf-8") as fh:
        metrics = json.load(fh)
    return model, metrics


def summarize_inputs(form_data):
    field_labels = {
        "age": "Age",
        "sex": "Sex",
        "cp": "Chest pain type",
        "trestbps": "Resting blood pressure",
        "chol": "Serum cholesterol",
        "fbs": "Fasting blood sugar status",
        "restecg": "Resting ECG",
        "thalach": "Maximum heart rate",
        "exang": "Exercise angina",
        "oldpeak": "ST depression",
        "slope": "Peak slope",
        "ca": "Major vessels",
        "thal": "Thalassemia",
    }
    summary = []
    for key in FEATURE_COLUMNS:
        if key in form_data:
            value = form_data[key]
            summary.append(f"{field_labels.get(key, key)}: {value}")
    return ", ".join(summary)


def predict_from_form(form_data):
    model, metrics = load_model_bundle()
    record = {}
    for col in FEATURE_COLUMNS:
        value = form_data[col]
        if col in {"age", "trestbps", "chol", "thalach", "oldpeak"}:
            record[col] = float(value)
        else:
            record[col] = int(value)
    df = pd.DataFrame([record], columns=FEATURE_COLUMNS)
    probability = float(model.predict_proba(df)[0][1])
    prediction = int(model.predict(df)[0])
    label = "High likelihood of heart disease" if prediction == 1 else "Lower likelihood of heart disease"
    if probability >= 0.5:
        message = "The model estimates a higher likelihood of heart disease."
    else:
        message = "The model estimates a lower likelihood of heart disease."
    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "label": label,
        "message": message,
        "model_version": metrics.get("model_version", "v1.0"),
        "selected_model": metrics.get("selected_model_name", "Logistic Regression"),
        "metrics": metrics,
    }

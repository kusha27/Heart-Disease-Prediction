# HeartCare

HeartCare is a Flask web application for exploring heart disease prediction using clinical indicators. It provides user accounts, prediction history, model evaluation visualizations, and follow-up reminders.

> **Medical disclaimer:** Predictions are educational estimates only. They are not a diagnosis and do not replace advice from a qualified healthcare professional.

## Features

- Register, log in, and manage account details.
- Submit clinical measurements to receive a model estimate.
- View prediction history, compare two saved predictions, and export your history as CSV.
- Review model metrics, outcome distribution, and six-month prediction trends on the dashboard.
- Create in-app follow-up reminders, mark them complete, or delete them. Reminders do not send email or phone notifications.
- Read general heart-health education.

## Requirements

- Python 3.10 or newer
- Internet access if you need to train/regenerate the model using OpenML

## Run on Windows

Open PowerShell in the project directory:

```powershell
Set-Location "C:\Users\Acer\OneDrive\Documents\heart"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install Flask joblib pandas scikit-learn scipy
$env:SECRET_KEY = "replace-with-a-long-random-secret"
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) and create an account to use predictions, history, dashboard, profile settings, and reminders.

The app initializes its SQLite database (`heartcare.db`) automatically. Keep the `models` directory alongside the application; it contains the trained model and evaluation metrics used by the app.

## Train the model

The existing model files are used when available. To retrain the model:

```powershell
python scripts\train_model.py
```

Training downloads the heart disease dataset through scikit-learn's OpenML integration, evaluates several classifiers, and writes the selected model and metrics under `models`.

## Security and deployment

`python app.py` starts Flask's development server with debug mode enabled. Use it for local development only, not for production. For deployment, configure a strong, private `SECRET_KEY` and use a production WSGI server with debug mode disabled. The SQLite database contains account and prediction data; protect it as sensitive information.

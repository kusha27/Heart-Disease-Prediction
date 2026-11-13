import json
import os
import secrets
from pathlib import Path

from flask import Flask, abort, flash, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from .db import (count_user_predictions, create_user, delete_prediction,
                 get_prediction, get_user_by_email, get_user_by_username,
                 get_user_predictions, latest_prediction_for_user,
                 risk_distribution_for_user, save_prediction)
from .model_service import FEATURE_COLUMNS, predict_from_form, summarize_inputs


def create_app():
    base_dir = Path(__file__).resolve().parent.parent
    app = Flask(__name__, template_folder=str(base_dir / "templates"), static_folder=str(base_dir / "static"))
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "heartcare-secret-change-me")
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    def csrf_token():
        if "csrf_token" not in session:
            session["csrf_token"] = secrets.token_urlsafe(32)
        return session["csrf_token"]

    @app.context_processor
    def inject_context():
        return {"csrf_token": csrf_token}

    def login_required(view_func):
        def wrapped(*args, **kwargs):
            if "user_id" not in session:
                flash("Please log in to continue.", "warning")
                return redirect(url_for("login"))
            return view_func(*args, **kwargs)

        wrapped.__name__ = view_func.__name__
        return wrapped

    def validate_csrf():
        token = request.form.get("csrf_token")
        expected = session.get("csrf_token")
        if not token or not expected or token != expected:
            abort(400)

    @app.route("/")
    def home():
        return render_template("home.html")

    @app.route("/register", methods=["GET", "POST"])
    def register():
        if request.method == "POST":
            validate_csrf()
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")
            if not username or not email or not password:
                flash("Please complete all required fields.", "danger")
                return render_template("register.html")
            if len(password) < 8:
                flash("Password must be at least 8 characters long.", "danger")
                return render_template("register.html")
            if get_user_by_username(username):
                flash("That username is already in use.", "danger")
                return render_template("register.html")
            if get_user_by_email(email):
                flash("That email is already registered.", "danger")
                return render_template("register.html")
            user_id = create_user(username, email, generate_password_hash(password))
            session["user_id"] = user_id
            session["username"] = username
            flash("Registration successful.", "success")
            return redirect(url_for("dashboard"))
        return render_template("register.html")

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            validate_csrf()
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            user = get_user_by_username(username)
            if user and check_password_hash(user["password_hash"], password):
                session["user_id"] = user["id"]
                session["username"] = user["username"]
                flash("Welcome back!", "success")
                return redirect(url_for("dashboard"))
            flash("Invalid username or password.", "danger")
            return render_template("login.html")
        return render_template("login.html")

    @app.route("/logout")
    def logout():
        session.clear()
        flash("You have been logged out.", "info")
        return redirect(url_for("home"))

    @app.route("/dashboard")
    @login_required
    def dashboard():
        user_id = session["user_id"]
        try:
            with open("models/model_metrics.json", "r", encoding="utf-8") as fh:
                metrics = json.load(fh)
        except FileNotFoundError:
            metrics = {"selected_model_name": "Logistic Regression", "results": []}
        latest = latest_prediction_for_user(user_id)
        history = get_user_predictions(user_id, limit=5, offset=0)
        distribution = risk_distribution_for_user(user_id)
        return render_template(
            "dashboard.html",
            latest_prediction=latest,
            history=history,
            metrics=metrics,
            risk_distribution=distribution,
        )

    @app.route("/predict", methods=["GET", "POST"])
    @login_required
    def predict():
        if request.method == "POST":
            validate_csrf()
            form_data = {field: request.form.get(field, "") for field in FEATURE_COLUMNS}
            missing = [field for field in FEATURE_COLUMNS if form_data[field] in (None, "")]
            if missing:
                flash("Please complete all required fields before predicting.", "danger")
                return render_template("predict.html", form_data=form_data)
            parsed = {}
            try:
                for field in FEATURE_COLUMNS:
                    value = form_data[field]
                    if field in {"age", "trestbps", "chol", "thalach", "oldpeak"}:
                        parsed[field] = float(value)
                    else:
                        parsed[field] = int(value)
            except ValueError:
                flash("Only valid numeric values are allowed for clinical measurements.", "danger")
                return render_template("predict.html", form_data=form_data)
            if not 0 <= parsed["sex"] <= 1:
                flash("Sex must be 0 or 1.", "danger")
                return render_template("predict.html", form_data=form_data)
            result = predict_from_form(parsed)
            summary = summarize_inputs(parsed)
            user_id = session["user_id"]
            save_prediction(user_id, parsed, result["message"], result["model_version"])
            return render_template(
                "result.html",
                result=result,
                summary=summary,
                form_data=parsed,
                model_version=result["model_version"],
            )
        return render_template("predict.html", form_data={field: "" for field in FEATURE_COLUMNS})

    @app.route("/history")
    @login_required
    def history():
        user_id = session["user_id"]
        search = request.args.get("search", "").strip()
        page = max(int(request.args.get("page", 1)), 1)
        limit = 6
        offset = (page - 1) * limit
        predictions = get_user_predictions(user_id, search=search, limit=limit, offset=offset)
        total = count_user_predictions(user_id, search=search)
        pages = max((total + limit - 1) // limit, 1)
        return render_template(
            "history.html",
            predictions=predictions,
            search=search,
            page=page,
            pages=pages,
            total=total,
        )

    @app.route("/history/<int:prediction_id>")
    @login_required
    def prediction_detail(prediction_id):
        user_id = session["user_id"]
        item = get_prediction(user_id, prediction_id)
        if not item:
            flash("Prediction record not found.", "warning")
            return redirect(url_for("history"))
        payload = json.loads(item["input_data"])
        return render_template("detail.html", prediction=item, payload=payload)

    @app.route("/history/<int:prediction_id>/delete", methods=["POST"])
    @login_required
    def delete_prediction_route(prediction_id):
        validate_csrf()
        user_id = session["user_id"]
        delete_prediction(user_id, prediction_id)
        flash("Prediction record deleted.", "success")
        return redirect(url_for("history"))

    @app.route("/education")
    def education():
        return render_template("education.html")

    @app.route("/health-education")
    def health_education():
        return redirect(url_for("education"))

    @app.errorhandler(400)
    def bad_request(_):
        flash("Your request could not be processed. Please try again.", "danger")
        return redirect(request.referrer or url_for("home"))

    return app

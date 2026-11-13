import csv
import io
import json
import os
import secrets
from datetime import date, datetime
from pathlib import Path

from flask import (Flask, abort, flash, make_response, redirect, render_template,
                   request, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

from .db import (count_user_predictions, create_user, delete_prediction,
                 complete_reminder, create_reminder, delete_reminder,
                 get_all_user_predictions, get_prediction,
                 get_user_by_email, get_user_by_id, get_user_by_username,
                 get_user_predictions, get_user_reminders,
                 latest_prediction_for_user, prediction_trends_for_user,
                 risk_distribution_for_user, save_prediction, update_user)
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
            with open(base_dir / "models" / "model_metrics.json", "r", encoding="utf-8") as fh:
                metrics = json.load(fh)
        except FileNotFoundError:
            metrics = {"selected_model_name": "Logistic Regression", "results": []}
        latest = latest_prediction_for_user(user_id)
        history = get_user_predictions(user_id, limit=5, offset=0)
        distribution = risk_distribution_for_user(user_id)
        reminders = get_user_reminders(user_id)
        active_reminders = [reminder for reminder in reminders if not reminder["completed"]]
        trends = prediction_trends_for_user(user_id)
        month_keys = []
        month_labels = []
        current_month = date.today().year * 12 + date.today().month - 1
        for offset in range(5, -1, -1):
            year, month_index = divmod(current_month - offset, 12)
            month = month_index + 1
            month_keys.append(f"{year:04d}-{month:02d}")
            month_labels.append(date(year, month, 1).strftime("%b %Y"))
        outcomes = sorted({row["prediction_output"] for row in trends})
        trend_totals = {
            outcome: {month: 0 for month in month_keys}
            for outcome in outcomes
        }
        for row in trends:
            if row["month"] in month_keys:
                trend_totals[row["prediction_output"]][row["month"]] = row["total"]
        trend_chart = {
            "labels": month_labels,
            "datasets": [
                {
                    "label": outcome,
                    "data": [trend_totals[outcome][month] for month in month_keys],
                }
                for outcome in outcomes
            ],
        }
        return render_template(
            "dashboard.html",
            latest_prediction=latest,
            history=history,
            metrics=metrics,
            risk_distribution=distribution,
            trend_chart=trend_chart,
            active_reminders=active_reminders[:3],
            active_reminder_count=len(active_reminders),
        )

    @app.route("/reminders", methods=["GET", "POST"])
    @login_required
    def reminders():
        if request.method == "POST":
            validate_csrf()
            due_date_value = request.form.get("due_date", "")
            note = request.form.get("note", "").strip()
            try:
                due_date = datetime.strptime(due_date_value, "%Y-%m-%d").date()
            except ValueError:
                flash("Enter a valid reminder date.", "danger")
                return redirect(url_for("reminders"))
            if due_date < date.today():
                flash("A reminder date cannot be in the past.", "danger")
                return redirect(url_for("reminders"))
            if len(note) > 200:
                flash("Reminder notes must be 200 characters or fewer.", "danger")
                return redirect(url_for("reminders"))
            create_reminder(session["user_id"], due_date.isoformat(), note)
            flash("Reminder created.", "success")
            return redirect(url_for("reminders"))
        return render_template(
            "reminders.html",
            reminders=get_user_reminders(session["user_id"]),
            today=date.today().isoformat(),
        )

    @app.route("/reminders/<int:reminder_id>/complete", methods=["POST"])
    @login_required
    def complete_reminder_route(reminder_id):
        validate_csrf()
        if complete_reminder(session["user_id"], reminder_id):
            flash("Reminder marked as complete.", "success")
        else:
            flash("Reminder not found or already completed.", "warning")
        return redirect(url_for("reminders"))

    @app.route("/reminders/<int:reminder_id>/delete", methods=["POST"])
    @login_required
    def delete_reminder_route(reminder_id):
        validate_csrf()
        if delete_reminder(session["user_id"], reminder_id):
            flash("Reminder deleted.", "success")
        else:
            flash("Reminder not found.", "warning")
        return redirect(url_for("reminders"))

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

    @app.route("/history/export")
    @login_required
    def export_history():
        predictions = get_all_user_predictions(session["user_id"])
        output = io.StringIO(newline="")
        writer = csv.writer(output)
        writer.writerow(["Date and time", "Model output", "Model version", *FEATURE_COLUMNS])
        for item in predictions:
            values = json.loads(item["input_data"])
            writer.writerow([
                item["prediction_timestamp"],
                item["prediction_output"],
                item["model_version"],
                *(values.get(field, "") for field in FEATURE_COLUMNS),
            ])
        response = make_response(output.getvalue())
        response.headers["Content-Type"] = "text/csv; charset=utf-8"
        response.headers["Content-Disposition"] = "attachment; filename=heartcare-predictions.csv"
        return response

    @app.route("/history/compare")
    @login_required
    def compare_predictions():
        selected_ids = request.args.getlist("prediction_ids")
        try:
            prediction_ids = [int(value) for value in selected_ids]
        except ValueError:
            prediction_ids = []
        if len(prediction_ids) != 2 or len(set(prediction_ids)) != 2:
            flash("Select exactly two different predictions to compare.", "warning")
            return redirect(url_for("history"))
        predictions = [
            get_prediction(session["user_id"], prediction_id)
            for prediction_id in prediction_ids
        ]
        if any(prediction is None for prediction in predictions):
            flash("One or more selected prediction records could not be found.", "warning")
            return redirect(url_for("history"))
        comparison = [
            {
                "record": prediction,
                "inputs": json.loads(prediction["input_data"]),
            }
            for prediction in predictions
        ]
        return render_template(
            "comparison.html",
            comparison=comparison,
            feature_columns=FEATURE_COLUMNS,
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

    @app.route("/profile", methods=["GET", "POST"])
    @login_required
    def profile():
        user = get_user_by_id(session["user_id"])
        if request.method == "POST":
            validate_csrf()
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip()
            current_password = request.form.get("current_password", "")
            new_password = request.form.get("new_password", "")
            if not username or not email or not current_password:
                flash("Username, email, and current password are required.", "danger")
                return render_template("profile.html", user=user)
            if not check_password_hash(user["password_hash"], current_password):
                flash("The current password is incorrect.", "danger")
                return render_template("profile.html", user=user)
            if len(new_password) > 0 and len(new_password) < 8:
                flash("The new password must be at least 8 characters long.", "danger")
                return render_template("profile.html", user=user)
            existing_username = get_user_by_username(username)
            if existing_username and existing_username["id"] != user["id"]:
                flash("That username is already in use.", "danger")
                return render_template("profile.html", user=user)
            existing_email = get_user_by_email(email)
            if existing_email and existing_email["id"] != user["id"]:
                flash("That email is already registered.", "danger")
                return render_template("profile.html", user=user)
            password_hash = generate_password_hash(new_password) if new_password else None
            update_user(user["id"], username, email, password_hash)
            session["username"] = username
            flash("Your profile has been updated.", "success")
            return redirect(url_for("profile"))
        return render_template("profile.html", user=user)

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

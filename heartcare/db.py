import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "heartcare.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prediction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                input_data TEXT NOT NULL,
                prediction_output TEXT NOT NULL,
                model_version TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )


def create_user(username, email, password_hash):
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash),
        )
        return cursor.lastrowid


def get_user_by_username(username):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,),
        ).fetchone()


def get_user_by_email(email):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()


def get_user_by_id(user_id):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()


def save_prediction(user_id, input_data, prediction_output, model_version):
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO predictions (user_id, input_data, prediction_output, model_version)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, json.dumps(input_data), prediction_output, model_version),
        )


def get_user_predictions(user_id, search=None, limit=5, offset=0):
    query = "SELECT * FROM predictions WHERE user_id = ?"
    params = [user_id]
    if search:
        query += " AND prediction_output LIKE ?"
        params.append(f"%{search}%")
    query += " ORDER BY prediction_timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    with get_connection() as conn:
        return conn.execute(query, params).fetchall()


def count_user_predictions(user_id, search=None):
    query = "SELECT COUNT(*) as total FROM predictions WHERE user_id = ?"
    params = [user_id]
    if search:
        query += " AND prediction_output LIKE ?"
        params.append(f"%{search}%")
    with get_connection() as conn:
        row = conn.execute(query, params).fetchone()
        return row["total"] if row else 0


def get_prediction(user_id, prediction_id):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM predictions WHERE id = ? AND user_id = ?",
            (prediction_id, user_id),
        ).fetchone()


def delete_prediction(user_id, prediction_id):
    with get_connection() as conn:
        conn.execute(
            "DELETE FROM predictions WHERE id = ? AND user_id = ?",
            (prediction_id, user_id),
        )


def latest_prediction_for_user(user_id):
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM predictions WHERE user_id = ? ORDER BY prediction_timestamp DESC LIMIT 1",
            (user_id,),
        ).fetchone()


def risk_distribution_for_user(user_id):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT prediction_output, COUNT(*) AS total FROM predictions WHERE user_id = ? GROUP BY prediction_output",
            (user_id,),
        ).fetchall()
        return [dict(row) for row in rows]


init_db()

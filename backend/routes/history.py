import json
import sqlite3
from pathlib import Path
from flask import Blueprint, jsonify, request

history_bp = Blueprint("history", __name__)
DB_PATH = Path(__file__).resolve().parents[1] / "codesense.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_history_db():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL,
                has_error INTEGER NOT NULL,
                error_category TEXT,
                concept TEXT,
                result_json TEXT NOT NULL,
                filename TEXT DEFAULT 'main.py',
                error_type TEXT,
                explanation TEXT,
                status TEXT DEFAULT 'Needs Revision',
                execution_result TEXT,
                action_type TEXT DEFAULT 'analysis',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Ensure missing columns exist in case the table was created before
        cursor = connection.execute("PRAGMA table_info(analysis_history)")
        existing_cols = {col["name"] for col in cursor.fetchall()}

        new_columns = {
            "filename": "TEXT DEFAULT 'main.py'",
            "error_type": "TEXT",
            "explanation": "TEXT",
            "status": "TEXT DEFAULT 'Needs Revision'",
            "execution_result": "TEXT",
            "action_type": "TEXT DEFAULT 'analysis'",
        }

        for col_name, col_def in new_columns.items():
            if col_name not in existing_cols:
                try:
                    connection.execute(f"ALTER TABLE analysis_history ADD COLUMN {col_name} {col_def}")
                except Exception:
                    pass


def save_history_entry(code, result, filename="main.py", status=None, action_type="analysis", execution_result=None):
    has_error = bool(result.get("has_error"))
    error_cat = result.get("error_category")
    error_type = result.get("error_type")
    concept = result.get("concept")
    explanation = result.get("explanation")
    
    resolved_status = status or ("Needs Revision" if has_error else "Correct")
    exec_res = execution_result or result.get("output") or result.get("message") or ""

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO analysis_history
                (code, has_error, error_category, concept, result_json,
                 filename, error_type, explanation, status, execution_result, action_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                code,
                int(has_error),
                error_cat,
                concept,
                json.dumps(result),
                filename or "main.py",
                error_type,
                explanation,
                resolved_status,
                str(exec_res),
                action_type,
            ),
        )


@history_bp.get("/history")
def get_history():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, code, has_error, error_category, concept, result_json,
                   filename, error_type, explanation, status, execution_result, action_type, created_at
            FROM analysis_history
            ORDER BY created_at DESC, id DESC
            LIMIT 100
            """
        ).fetchall()

    history = []
    for row in rows:
        try:
            result = json.loads(row["result_json"])
        except Exception:
            result = {}

        history.append(
            {
                "id": row["id"],
                "code": row["code"],
                "has_error": bool(row["has_error"]),
                "error_category": row["error_category"],
                "concept": row["concept"],
                "filename": row["filename"] or "main.py",
                "error_type": row["error_type"] or result.get("error_type", "—"),
                "explanation": row["explanation"] or result.get("explanation", ""),
                "status": row["status"] or ("Needs Revision" if row["has_error"] else "Correct"),
                "execution_result": row["execution_result"] or "",
                "action_type": row["action_type"] or "analysis",
                "created_at": row["created_at"],
                "result": result,
            }
        )
    return jsonify({"success": True, "history": history})


@history_bp.post("/history")
def add_history():
    payload = request.get_json(silent=True) or {}
    code = payload.get("code", "")
    result = payload.get("result", {})
    filename = payload.get("filename", "main.py")
    status = payload.get("status")
    action_type = payload.get("action_type", "analysis")

    if not code or not result:
        return jsonify({"success": False, "message": "Code and result are required."}), 400
    
    save_history_entry(code, result, filename=filename, status=status, action_type=action_type)
    return jsonify({"success": True, "message": "History entry saved."}), 201


@history_bp.delete("/history/<int:entry_id>")
def delete_history_entry(entry_id):
    """Delete a single history entry by ID."""
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM analysis_history WHERE id = ?", (entry_id,)
        )
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": f"Entry {entry_id} not found."}), 404
    return jsonify({"success": True, "message": f"Entry {entry_id} deleted."})


@history_bp.delete("/history")
def clear_all_history():
    """Delete all history entries."""
    with get_connection() as connection:
        connection.execute("DELETE FROM analysis_history")
    return jsonify({"success": True, "message": "All history entries cleared."})
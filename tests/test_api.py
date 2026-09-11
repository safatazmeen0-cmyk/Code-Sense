import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

# pyrefly: ignore [missing-import]
from app import create_app


# ── Health ───────────────────────────────────────────────────────────────────

def test_health_endpoint():
    client = create_app().test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["success"] is True


# ── Analyze – error detection ────────────────────────────────────────────────

def test_analyze_detects_syntax_error():
    client = create_app().test_client()
    response = client.post("/api/analyze", json={"code": "if True\n    print('yes')"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["has_error"] is True
    assert data["error_category"] == "Syntax Error"
    assert data["line"] == 1


def test_analyze_detects_index_error():
    client = create_app().test_client()
    response = client.post(
        "/api/analyze",
        json={"code": "numbers = [10, 20, 30]\nprint(numbers[5])"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["has_error"] is True
    assert data["error_category"] == "Index Error"
    assert data["line"] == 2


def test_analyze_detects_type_error():
    client = create_app().test_client()
    response = client.post(
        "/api/analyze",
        json={"code": "x = 'hello' + 5\nprint(x)"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["has_error"] is True
    assert data["error_category"] == "Type Error"


def test_analyze_detects_name_error():
    client = create_app().test_client()
    response = client.post(
        "/api/analyze",
        json={"code": "print(undefined_variable_xyz)"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["has_error"] is True
    assert data["error_category"] == "Name Error"


def test_analyze_detects_correct_code():
    client = create_app().test_client()
    response = client.post("/api/analyze", json={"code": "total = 2 + 3\nprint(total)"})
    assert response.status_code == 200
    assert response.get_json()["has_error"] is False


def test_analyze_returns_recommendation_on_error():
    """Analyze response must include a recommendation dict when an error is found."""
    client = create_app().test_client()
    response = client.post("/api/analyze", json={"code": "print(undefined_abc)"})
    data = response.get_json()
    assert data["has_error"] is True
    assert "recommendation" in data
    rec = data["recommendation"]
    assert "concept" in rec
    assert "why" in rec
    assert "topics" in rec
    assert isinstance(rec["topics"], list)


def test_analyze_returns_complexity_for_clean_code():
    """Clean code response must include complexity metadata."""
    client = create_app().test_client()
    response = client.post(
        "/api/analyze",
        json={"code": "for i in range(10):\n    print(i)"},
    )
    data = response.get_json()
    assert data["has_error"] is False
    assert "complexity" in data
    assert "time" in data["complexity"]
    assert "space" in data["complexity"]


def test_analyze_empty_code_returns_400():
    client = create_app().test_client()
    response = client.post("/api/analyze", json={"code": "   "})
    assert response.status_code == 400


def test_analyze_missing_code_returns_400():
    client = create_app().test_client()
    response = client.post("/api/analyze", json={})
    assert response.status_code == 400


# ── Recommendation endpoint ──────────────────────────────────────────────────

def test_recommendation_syntax_error():
    client = create_app().test_client()
    response = client.get("/api/recommendation/Syntax Error")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    rec = data["recommendation"]
    assert "concept" in rec
    assert "why" in rec
    assert "topics" in rec
    assert "example" in rec
    assert "practice" in rec


def test_recommendation_all_categories():
    """Every category in the dataset must return a valid recommendation."""
    client = create_app().test_client()
    categories = [
        "Syntax Error", "Name Error", "Type Error", "Runtime Error",
        "Indentation Error", "Import Error", "Index Error", "Logical Error",
    ]
    for cat in categories:
        response = client.get(f"/api/recommendation/{cat}")
        assert response.status_code == 200, f"Failed for category: {cat}"
        data = response.get_json()
        assert data["success"] is True
        assert "recommendation" in data


def test_recommendation_unknown_falls_back():
    """Unknown categories must fall back gracefully (not 500)."""
    client = create_app().test_client()
    response = client.get("/api/recommendation/CompletelyUnknownError")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "recommendation" in data


# ── History endpoint ─────────────────────────────────────────────────────────

def test_history_endpoint():
    client = create_app().test_client()
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert isinstance(data["history"], list)


def test_history_post_saves_entry():
    client = create_app().test_client()
    payload = {
        "code": "x = 1\nprint(x)",
        "result": {"has_error": False, "status": "Correct"},
        "filename": "test_entry.py",
        "action_type": "analysis",
    }
    response = client.post("/api/history", json=payload)
    assert response.status_code == 201
    assert response.get_json()["success"] is True


def test_history_delete_single_entry():
    """Saving then deleting a specific entry should succeed."""
    client = create_app().test_client()
    # Save first
    client.post(
        "/api/history",
        json={
            "code": "x = delete_me",
            "result": {"has_error": True, "error_category": "Name Error"},
            "filename": "delete_test.py",
        },
    )
    # Get list – find the newest entry
    history = client.get("/api/history").get_json()["history"]
    if history:
        entry_id = history[0]["id"]
        del_response = client.delete(f"/api/history/{entry_id}")
        assert del_response.status_code == 200
        assert del_response.get_json()["success"] is True


def test_history_delete_nonexistent_returns_404():
    client = create_app().test_client()
    response = client.delete("/api/history/999999")
    assert response.status_code == 404


# ── Run endpoint ─────────────────────────────────────────────────────────────

def test_run_success():
    client = create_app().test_client()
    response = client.post(
        "/api/run",
        json={"code": "name = 'CodeSense'\nprint('Hello', name)", "filename": "main.py"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "Hello CodeSense" in data["output"]
    assert data["has_error"] is False
    assert data["status"] == "Correct"


def test_run_runtime_error():
    client = create_app().test_client()
    response = client.post(
        "/api/run",
        json={"code": "a = 10\nb = 0\nprint(a / b)", "filename": "calc.py"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is False
    assert data["has_error"] is True
    assert data["error_category"] == "Runtime Error"
    assert "ZeroDivisionError" in data["error"]
    assert data["status"] == "Needs Revision"


def test_run_timeout():
    client = create_app().test_client()
    response = client.post(
        "/api/run",
        json={"code": "while True:\n    pass", "filename": "loop.py"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is False
    assert "time limit exceeded" in data["error"]


def test_run_empty_code():
    client = create_app().test_client()
    response = client.post("/api/run", json={"code": "   "})
    assert response.status_code == 400


def test_run_multiline_output():
    """Programs that print multiple lines should return all output."""
    client = create_app().test_client()
    response = client.post(
        "/api/run",
        json={"code": "for i in range(3):\n    print(i)", "filename": "loop.py"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "0" in data["output"]
    assert "1" in data["output"]
    assert "2" in data["output"]
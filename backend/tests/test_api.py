import pytest

from app import create_app


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("FLASK_ALLOWED_ORIGINS", raising=False)
    app = create_app()
    app.config.update(TESTING=True)
    return app.test_client()


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["Cross-Origin-Resource-Policy"] == "cross-origin"


def test_problems(client):
    response = client.get("/api/problems")
    assert response.status_code == 200
    body = response.get_json()
    problems = body["problems"]
    assert len(problems) == 5
    ids = [problem["id"] for problem in problems]
    assert len(ids) == len(set(ids))
    assert {problem["severity"] for problem in problems} <= {"critical", "major"}
    assert problems[0]["id"] == "INC-1042"


def test_cors_omits_header_without_origin(client):
    response = client.get("/api/health")
    assert "Access-Control-Allow-Origin" not in response.headers


def test_cors_allows_vite_dev_origin(client):
    response = client.get(
        "/api/problems",
        headers={"Origin": "http://127.0.0.1:5173"},
    )
    assert response.headers["Access-Control-Allow-Origin"] == "http://127.0.0.1:5173"
    assert "Access-Control-Allow-Credentials" not in response.headers


def test_cors_rejects_unknown_origin(client):
    response = client.get(
        "/api/problems",
        headers={"Origin": "https://evil.example"},
    )
    assert "Access-Control-Allow-Origin" not in response.headers


def test_post_is_rejected(client):
    response = client.post("/api/problems")
    assert response.status_code == 405
    assert response.get_json() == {"error": "method_not_allowed"}


def test_unknown_route(client):
    response = client.get("/api/missing")
    assert response.status_code == 404
    assert response.get_json() == {"error": "not_found"}


def test_allowed_origins_reject_credentials():
    from app import parse_allowed_origins

    with pytest.raises(ValueError, match="credentials"):
        parse_allowed_origins("http://user:secret@127.0.0.1:5173")


def test_allowed_origins_reject_path():
    from app import parse_allowed_origins

    with pytest.raises(ValueError, match="without a path"):
        parse_allowed_origins("http://127.0.0.1:5173/api")


def test_custom_allowed_origin(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("FLASK_ALLOWED_ORIGINS", "https://app.example.com")
    app = create_app()
    client = app.test_client()
    allowed = client.get("/api/health", headers={"Origin": "https://app.example.com"})
    blocked = client.get("/api/health", headers={"Origin": "http://127.0.0.1:5173"})
    assert allowed.headers["Access-Control-Allow-Origin"] == "https://app.example.com"
    assert "Access-Control-Allow-Origin" not in blocked.headers

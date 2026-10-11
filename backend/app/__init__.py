import os
from urllib.parse import urlsplit

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from app.problems import PROBLEMS

# Vite dev (5173) and preview (4173). Override with FLASK_ALLOWED_ORIGINS.
DEFAULT_ORIGINS = (
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://localhost:5173",
    "http://localhost:4173",
)


def parse_allowed_origins(raw: str | None) -> tuple[str, ...]:
    if raw is None or raw.strip() == "":
        return DEFAULT_ORIGINS

    origins: list[str] = []
    for part in raw.split(","):
        value = part.strip()
        if value == "":
            continue
        parsed = urlsplit(value)
        if parsed.scheme not in {"http", "https"} or parsed.hostname in {None, ""}:
            raise ValueError("FLASK_ALLOWED_ORIGINS entries must be http(s) origins")
        if parsed.username is not None or parsed.password is not None:
            raise ValueError("FLASK_ALLOWED_ORIGINS entries must not include credentials")
        if parsed.path not in {"", "/"} or parsed.query != "" or parsed.fragment != "":
            raise ValueError("FLASK_ALLOWED_ORIGINS entries must be origins, without a path")
        port = f":{parsed.port}" if parsed.port is not None else ""
        origins.append(f"{parsed.scheme}://{parsed.hostname}{port}")

    if len(origins) == 0:
        raise ValueError("FLASK_ALLOWED_ORIGINS did not contain an origin")
    return tuple(origins)


def create_app(allowed_origins: tuple[str, ...] | None = None) -> Flask:
    origins = (
        allowed_origins
        if allowed_origins is not None
        else parse_allowed_origins(os.environ.get("FLASK_ALLOWED_ORIGINS"))
    )
    app = Flask(__name__, static_folder=None)
    app.json.sort_keys = False

    CORS(
        app,
        resources={r"/api/.*": {"origins": list(origins)}},
        methods=["GET", "HEAD", "OPTIONS"],
        allow_headers=["Accept", "Content-Type"],
        supports_credentials=False,
        send_wildcard=False,
        always_send=False,
        allow_private_network=False,
        max_age=600,
    )

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/api/problems")
    def problems():
        return jsonify({"problems": list(PROBLEMS)})

    @app.errorhandler(HTTPException)
    def http_error(error: HTTPException):
        name = error.name.lower().replace(" ", "_")
        return jsonify({"error": name}), error.code or 500

    return app

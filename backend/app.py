from flask import Flask, jsonify
from flask_cors import CORS

from routes.analyze import analyze_bp
from routes.history import history_bp, init_history_db
from routes.recommendation import recommendation_bp
from routes.run import run_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    init_history_db()

    app.register_blueprint(analyze_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(recommendation_bp, url_prefix="/api")
    app.register_blueprint(run_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "message": "CodeSense backend is running."})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
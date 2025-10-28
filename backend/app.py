from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Tuple

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


def _default_db_uri() -> str:
    """Return the default SQLite URI in the backend directory."""
    db_path = Path(__file__).resolve().parent / "app.db"
    return f"sqlite:///{db_path}"


class User(db.Model):  # type: ignore[name-defined]
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)  # type: ignore[attr-defined]
    name = db.Column(db.String(120), nullable=False)  # type: ignore[attr-defined]
    email = db.Column(db.String(255), unique=True, nullable=False)  # type: ignore[attr-defined]
    password_hash = db.Column(db.String(255), nullable=False)  # type: ignore[attr-defined]

    def to_dict(self) -> Dict[str, str]:
        return {"id": self.id, "name": self.name, "email": self.email}


def create_app() -> Flask:
    app = Flask(__name__)

    database_uri = os.getenv("DATABASE_URL", _default_db_uri())
    if database_uri.startswith("postgres://"):
        database_uri = database_uri.replace("postgres://", "postgresql://", 1)

    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_uri,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_AS_ASCII=False,
    )

    db.init_app(app)

    with app.app_context():
        if database_uri.startswith("sqlite:///"):
            Path(database_uri.replace("sqlite:///", "")).parent.mkdir(parents=True, exist_ok=True)
        db.create_all()

    register_routes(app)
    return app


def _validate_auth_payload(data: Dict[str, str], *, signup: bool) -> Tuple[bool, str]:
    required_fields = ["email", "password"] + (["name"] if signup else [])
    for field in required_fields:
        value = data.get(field, "")
        if not isinstance(value, str):
            value = str(value or "")
        if not value.strip():
            return False, f"{field} 필드를 입력해주세요."
        data[field] = value

    if "@" not in data["email"]:
        return False, "올바른 이메일 형식을 입력해주세요."

    if len(data["password"]) < 8:
        return False, "비밀번호는 최소 8자 이상이어야 합니다."

    return True, ""


def register_routes(app: Flask) -> None:
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/zones")
    def zones():
        data = [
            {"id": "wooman1", "name": "우만1구역", "units": 2800},
            {"id": "wooman2", "name": "우만2구역", "units": 2700},
            {"id": "worldcup1", "name": "월드컵1구역", "units": 1500},
        ]
        return jsonify(data)

    @app.post("/api/auth/signup")
    def signup():
        payload = request.get_json(silent=True) or {}
        is_valid, message = _validate_auth_payload(payload, signup=True)
        if not is_valid:
            return jsonify({"message": message}), 400

        hashed_password = generate_password_hash(payload["password"])
        user = User(name=payload["name"].strip(), email=payload["email"].lower().strip(), password_hash=hashed_password)

        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"message": "이미 가입된 이메일입니다."}), 409

        return jsonify({"message": "회원가입이 완료되었습니다.", "user": user.to_dict()}), 201

    @app.post("/api/auth/login")
    def login():
        payload = request.get_json(silent=True) or {}
        is_valid, message = _validate_auth_payload(payload, signup=False)
        if not is_valid:
            return jsonify({"message": message}), 400

        email = payload["email"].lower().strip()
        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password_hash, payload["password"]):
            return jsonify({"message": "이메일 또는 비밀번호가 올바르지 않습니다."}), 401

        return jsonify({"message": "로그인 성공", "user": user.to_dict()}), 200


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

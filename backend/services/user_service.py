from typing import Any
import json

from fastapi import HTTPException

from backend.app.security import create_access_token, hash_password, verify_password
from backend.database.session import get_connection
from backend.models.schemas import LoginRequest, SignupRequest, UserProfileRequest


def _row_to_user(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "email": row["email"],
        "nickname": row["nickname"],
        "gender": row["gender"],
        "created_at": row["created_at"],
    }


def signup_user(payload: SignupRequest) -> dict[str, Any]:
    with get_connection() as conn:
        exists = conn.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")
        password_hash = hash_password(payload.password)
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, nickname, gender) VALUES (?, ?, ?, ?)",
            (payload.email, password_hash, payload.nickname, payload.gender),
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return _row_to_user(user)


def is_email_available(email: str) -> bool:
    normalized = email.strip().lower()
    if "@" not in normalized or "." not in normalized.split("@")[-1]:
        raise HTTPException(status_code=422, detail="올바른 이메일 형식이 아닙니다.")
    with get_connection() as conn:
        exists = conn.execute("SELECT id FROM users WHERE email = ?", (normalized,)).fetchone()
    return exists is None


def login_user(payload: LoginRequest) -> dict[str, Any]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    user = _row_to_user(row)
    return {"access_token": create_access_token(str(user["id"])), "user": user}


def update_user_profile(user_id: int, payload: UserProfileRequest) -> dict[str, Any]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        nickname = payload.nickname if payload.nickname is not None else row["nickname"]
        gender = payload.gender if payload.gender is not None else row["gender"]
        conn.execute("UPDATE users SET nickname = ?, gender = ? WHERE id = ?", (nickname, gender, user_id))
        conn.commit()
        updated = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _row_to_user(updated)


def get_user_dashboard(user_id: int) -> dict[str, Any]:
    with get_connection() as conn:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        personal = conn.execute(
            """
            SELECT id, season, tone, confidence, created_at
            FROM personal_color_results
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()
        legacy_body_results = conn.execute(
            """
            SELECT id, body_type, confidence, created_at
            FROM body_type_results
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 5
            """,
            (user_id,),
        ).fetchall()
        skeleton = conn.execute(
            """
            SELECT id, skeleton_type, confidence, created_at
            FROM skeleton_type_results
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()
        body_shape = conn.execute(
            """
            SELECT id, body_shape, confidence, created_at
            FROM body_shape_results
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()
        recommendations = conn.execute(
            """
            SELECT id, recommended_items, recommended_style, created_at
            FROM recommendations
            WHERE user_id = ?
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            (user_id,),
        ).fetchall()
        recommendations_total = conn.execute(
            "SELECT COUNT(*) AS count FROM recommendations WHERE user_id = ?",
            (user_id,),
        ).fetchone()["count"]

    def parse_items(value: str) -> list[dict[str, Any]]:
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    return {
        "user": _row_to_user(user),
        "latest_personal_color": dict(personal) if personal else None,
        "latest_skeleton_type": dict(skeleton) if skeleton else None,
        "latest_body_shape": dict(body_shape) if body_shape else None,
        "body_type_results": [dict(row) for row in legacy_body_results],
        "recommendations_total": recommendations_total,
        "recommendations": [
            {
                "id": row["id"],
                "recommended_style": row["recommended_style"],
                "recommended_items": parse_items(row["recommended_items"])[:8],
                "created_at": row["created_at"],
            }
            for row in recommendations
        ],
    }

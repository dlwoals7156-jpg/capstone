from typing import Any

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

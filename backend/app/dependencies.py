from typing import Any

from fastapi import Header, HTTPException

from backend.app.security import decode_access_token
from backend.database.session import get_connection


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Bearer 토큰 형식이 올바르지 않습니다.")
    return token


def _load_user_from_token(token: str) -> dict[str, Any]:
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=401, detail="로그인이 필요하거나 토큰이 만료되었습니다.") from exc

    with get_connection() as conn:
        row = conn.execute("SELECT id, email, nickname, gender, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")
    return dict(row)


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = _extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return _load_user_from_token(token)


def get_optional_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any] | None:
    token = _extract_bearer_token(authorization)
    if not token:
        return None
    return _load_user_from_token(token)

import json

from fastapi import HTTPException

from backend.database.session import get_connection
from backend.models.schemas import AnalysisSaveRequest


def save_personal_color_result(payload: AnalysisSaveRequest) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO personal_color_results (user_id, season, tone, confidence) VALUES (?, ?, ?, ?)",
            (payload.user_id, payload.season or payload.result_name, payload.tone or "", payload.confidence),
        )
        conn.commit()
    return {"id": cursor.lastrowid, "message": "퍼스널컬러 결과가 저장되었습니다."}


def save_body_type_result(payload: AnalysisSaveRequest) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO body_type_results (user_id, body_type, confidence) VALUES (?, ?, ?)",
            (payload.user_id, payload.result_name, payload.confidence),
        )
        conn.commit()
    return {"id": cursor.lastrowid, "message": "골격체형 결과가 저장되었습니다."}


def save_face_shape_result(payload: AnalysisSaveRequest) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO face_shape_results (user_id, face_shape, confidence) VALUES (?, ?, ?)",
            (payload.user_id, payload.result_name, payload.confidence),
        )
        conn.commit()
    return {"id": cursor.lastrowid, "message": "얼굴형 결과가 저장되었습니다."}


def save_recommendation(user_id: int, recommended_items: list[dict], recommended_style: str) -> dict:
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id가 필요합니다.")
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO recommendations (user_id, recommended_items, recommended_style) VALUES (?, ?, ?)",
            (user_id, json.dumps(recommended_items, ensure_ascii=False), recommended_style),
        )
        conn.commit()
    return {"id": cursor.lastrowid, "message": "추천 결과가 저장되었습니다."}

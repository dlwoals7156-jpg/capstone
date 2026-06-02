import json

from fastapi import HTTPException

from backend.database.session import get_connection
from backend.models.schemas import AnalysisSaveRequest


def _save_analysis_summary(conn, user_id: int, result_type: str, result_name: str, confidence: float, metadata: dict) -> None:
    conn.execute(
        "INSERT INTO analysis_results (user_id, result_type, result_name, confidence, metadata) VALUES (?, ?, ?, ?, ?)",
        (user_id, result_type, result_name, confidence, json.dumps(metadata, ensure_ascii=False)),
    )


def save_personal_color_result(payload: AnalysisSaveRequest, user_id: int) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO personal_color_results (user_id, season, tone, confidence) VALUES (?, ?, ?, ?)",
            (user_id, payload.season or payload.result_name, payload.tone or "", payload.confidence),
        )
        _save_analysis_summary(
            conn,
            user_id,
            "personal_color",
            payload.result_name,
            payload.confidence,
            {"season": payload.season or payload.result_name, "tone": payload.tone or ""},
        )
        conn.commit()
    return {"id": cursor.lastrowid, "message": "퍼스널컬러 결과가 저장되었습니다."}


def save_body_type_result(payload: AnalysisSaveRequest, user_id: int) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO body_type_results (user_id, body_type, confidence) VALUES (?, ?, ?)",
            (user_id, payload.result_name, payload.confidence),
        )
        _save_analysis_summary(conn, user_id, "body_type", payload.result_name, payload.confidence, {})
        conn.commit()
    return {"id": cursor.lastrowid, "message": "골격체형 결과가 저장되었습니다."}


def save_skeleton_type_result(payload: AnalysisSaveRequest, user_id: int) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO skeleton_type_results (user_id, skeleton_type, confidence) VALUES (?, ?, ?)",
            (user_id, payload.result_name, payload.confidence),
        )
        _save_analysis_summary(conn, user_id, "skeleton_type", payload.result_name, payload.confidence, {})
        conn.commit()
    return {"id": cursor.lastrowid, "message": "골격 분석 결과가 저장되었습니다."}


def save_body_shape_result(payload: AnalysisSaveRequest, user_id: int) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO body_shape_results (user_id, body_shape, confidence) VALUES (?, ?, ?)",
            (user_id, payload.result_name, payload.confidence),
        )
        _save_analysis_summary(conn, user_id, "body_shape", payload.result_name, payload.confidence, {})
        conn.commit()
    return {"id": cursor.lastrowid, "message": "체형 분석 결과가 저장되었습니다."}


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


def delete_recommendation(recommendation_id: int, user_id: int) -> dict:
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id가 필요합니다.")
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM recommendations WHERE id = ? AND user_id = ?",
            (recommendation_id, user_id),
        )
        conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="삭제할 추천 결과를 찾을 수 없습니다.")
    return {"id": recommendation_id, "message": "추천 결과가 삭제되었습니다."}


def delete_all_recommendations(user_id: int) -> dict:
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id가 필요합니다.")
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM recommendations WHERE user_id = ?", (user_id,))
        conn.commit()
    return {"deleted_count": cursor.rowcount, "message": "추천 결과 전체가 삭제되었습니다."}

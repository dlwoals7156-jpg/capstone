from fastapi import APIRouter, Depends

from backend.app.dependencies import get_current_user
from backend.models.schemas import AnalysisSaveRequest
from backend.services.analysis_service import (
    save_body_shape_result,
    save_body_type_result,
    save_personal_color_result,
    save_skeleton_type_result,
)

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/personal-color")
def save_personal_color(payload: AnalysisSaveRequest, current_user: dict = Depends(get_current_user)):
    return save_personal_color_result(payload, current_user["id"])


@router.post("/body-type")
def save_body_type(payload: AnalysisSaveRequest, current_user: dict = Depends(get_current_user)):
    return save_body_type_result(payload, current_user["id"])


@router.post("/skeleton-type")
def save_skeleton_type(payload: AnalysisSaveRequest, current_user: dict = Depends(get_current_user)):
    return save_skeleton_type_result(payload, current_user["id"])


@router.post("/body-shape")
def save_body_shape(payload: AnalysisSaveRequest, current_user: dict = Depends(get_current_user)):
    return save_body_shape_result(payload, current_user["id"])

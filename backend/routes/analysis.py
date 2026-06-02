from fastapi import APIRouter

from backend.models.schemas import AnalysisSaveRequest
from backend.services.analysis_service import save_body_type_result, save_face_shape_result, save_personal_color_result

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/personal-color")
def save_personal_color(payload: AnalysisSaveRequest):
    return save_personal_color_result(payload)


@router.post("/body-type")
def save_body_type(payload: AnalysisSaveRequest):
    return save_body_type_result(payload)


@router.post("/face-shape")
def save_face_shape(payload: AnalysisSaveRequest):
    return save_face_shape_result(payload)

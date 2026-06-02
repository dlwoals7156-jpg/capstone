from fastapi import APIRouter

from ai_model.body_type.analyzer import analyze_body_type
from ai_model.face_shape.analyzer import analyze_face_shape
from ai_model.personal_color.analyzer import analyze_personal_color

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/personal-color")
def run_personal_color_model(payload: dict):
    return analyze_personal_color(payload.get("image"))


@router.post("/body-type")
def run_body_type_model(payload: dict):
    return analyze_body_type(payload.get("measurements"))


@router.post("/face-shape")
def run_face_shape_model(payload: dict):
    return analyze_face_shape(payload.get("image"))

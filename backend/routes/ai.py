from fastapi import APIRouter

from ai_model.body_type.analyzer import analyze_body_type
from ai_model.personal_color.analyzer import analyze_personal_color

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/personal-color")
def run_personal_color_model(payload: dict):
    return analyze_personal_color(
        image_payload=payload.get("image"),
        zones=payload.get("zones") or payload.get("skin_zones"),
        client_metrics=payload.get("metrics"),
        client_rgb=payload.get("rgb"),
        camera_frame=payload.get("camera_frame") or payload.get("cameraQuality"),
    )


@router.post("/body-type")
def run_body_type_model(payload: dict):
    return analyze_body_type(payload)

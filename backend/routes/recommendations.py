from fastapi import APIRouter

from backend.models.schemas import RecommendRequest
from backend.services.recommendation_service import build_recommendation_response

router = APIRouter(tags=["recommendations"])


@router.post("/recommend")
def legacy_recommend(payload: RecommendRequest):
    return build_recommendation_response(payload)


@router.post("/recommendations")
def recommend(payload: RecommendRequest):
    return build_recommendation_response(payload)

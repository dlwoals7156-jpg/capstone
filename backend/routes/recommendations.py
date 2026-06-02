from fastapi import APIRouter, Depends, Query, Response

from backend.app.dependencies import get_current_user
from backend.models.schemas import RecommendationSaveRequest, RecommendRequest
from backend.services.analysis_service import delete_all_recommendations, delete_recommendation, save_recommendation
from backend.services.recommendation_service import build_recommendation_response, generate_product_detail_html, generate_product_svg, get_search_suggestions

router = APIRouter(tags=["recommendations"])


@router.post("/recommend")
def legacy_recommend(payload: RecommendRequest):
    return build_recommendation_response(payload)


@router.post("/recommendations")
def recommend(payload: RecommendRequest):
    return build_recommendation_response(payload)


@router.post("/recommendations/saved")
def save_recommendation_result(payload: RecommendationSaveRequest, current_user: dict = Depends(get_current_user)):
    return save_recommendation(
        current_user["id"],
        payload.recommended_items,
        payload.recommended_style,
    )


@router.delete("/recommendations/{recommendation_id}")
def remove_saved_recommendation(recommendation_id: int, current_user: dict = Depends(get_current_user)):
    return delete_recommendation(recommendation_id, current_user["id"])


@router.delete("/recommendations")
def remove_all_saved_recommendations(current_user: dict = Depends(get_current_user)):
    return delete_all_recommendations(current_user["id"])


@router.get("/search/suggestions")
def search_suggestions(q: str = Query(default="", max_length=80), limit: int = Query(default=8, ge=1, le=12)):
    return get_search_suggestions(q, limit)


@router.get("/product-images/{product_id}.svg")
def product_image(product_id: str):
    return Response(content=generate_product_svg(product_id), media_type="image/svg+xml")


@router.get("/products/{product_id}")
def product_detail(product_id: str):
    return Response(content=generate_product_detail_html(product_id), media_type="text/html; charset=utf-8")

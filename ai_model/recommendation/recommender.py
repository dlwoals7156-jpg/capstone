from backend.models.schemas import RecommendRequest
from backend.services.recommendation_service import search_products


def recommend_items(request: RecommendRequest) -> list[dict]:
    """AI recommendation adapter kept outside the backend route layer."""
    return search_products(request)

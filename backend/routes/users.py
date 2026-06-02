from fastapi import APIRouter

from backend.models.schemas import UserProfileRequest
from backend.services.user_service import update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.put("/{user_id}")
def update_profile(user_id: int, payload: UserProfileRequest):
    return update_user_profile(user_id, payload)

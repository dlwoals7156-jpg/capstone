from fastapi import APIRouter, Depends, HTTPException

from backend.app.dependencies import get_current_user
from backend.models.schemas import UserProfileRequest
from backend.services.user_service import get_user_dashboard, update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/me/dashboard")
def get_my_dashboard(current_user: dict = Depends(get_current_user)):
    return get_user_dashboard(current_user["id"])


@router.put("/{user_id}")
def update_profile(user_id: int, payload: UserProfileRequest, current_user: dict = Depends(get_current_user)):
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="본인 정보만 수정할 수 있습니다.")
    return update_user_profile(user_id, payload)

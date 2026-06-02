from fastapi import APIRouter

from backend.models.schemas import LoginRequest, SignupRequest
from backend.services.user_service import login_user, signup_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: SignupRequest):
    user = signup_user(payload)
    return {"message": "회원가입이 완료되었습니다.", "user": user}


@router.post("/login")
def login(payload: LoginRequest):
    return login_user(payload)

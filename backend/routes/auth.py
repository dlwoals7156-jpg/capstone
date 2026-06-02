from fastapi import APIRouter, Query

from backend.models.schemas import LoginRequest, SignupRequest
from backend.services.user_service import is_email_available, login_user, signup_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: SignupRequest):
    user = signup_user(payload)
    return {"message": "회원가입이 완료되었습니다.", "user": user}


@router.get("/check-email")
def check_email(email: str = Query(min_length=5)):
    return {"email": email.strip().lower(), "available": is_email_available(email)}


@router.post("/login")
def login(payload: LoginRequest):
    return login_user(payload)

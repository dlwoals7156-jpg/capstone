from typing import Any, Optional

from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    nickname: str
    gender: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class RecommendRequest(BaseModel):
    personal_color: str
    personal_color_detail: Optional[str] = None
    user_prompt: str
    skeleton_type: Optional[str] = "스트레이트"
    body_shape: Optional[str] = "모래시계"
    gender: Optional[str] = "female"
    height: Optional[float] = None
    weight: Optional[float] = None
    body_features: dict[str, Any] = Field(default_factory=dict)
    style_preferences: list[str] = Field(default_factory=list)
    wearing_purposes: list[str] = Field(default_factory=list)


class AnalysisSaveRequest(BaseModel):
    user_id: int
    result_name: str
    confidence: float
    season: Optional[str] = None
    tone: Optional[str] = None


class UserProfileRequest(BaseModel):
    nickname: Optional[str] = None
    gender: Optional[str] = None

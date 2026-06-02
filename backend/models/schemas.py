from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    password_confirm: Optional[str] = None
    nickname: str = Field(min_length=2, max_length=30)
    gender: Optional[str] = None

    @model_validator(mode="after")
    def validate_password_confirm(self) -> "SignupRequest":
        if self.password_confirm is not None and self.password != self.password_confirm:
            raise ValueError("비밀번호 확인이 일치하지 않습니다.")
        return self

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.split("@")[-1]:
            raise ValueError("올바른 이메일 형식이 아닙니다.")
        return normalized

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in {"male", "female"}:
            raise ValueError("gender는 male 또는 female만 허용됩니다.")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.split("@")[-1]:
            raise ValueError("올바른 이메일 형식이 아닙니다.")
        return normalized


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class EmailCheckResponse(BaseModel):
    email: str
    available: bool


class RecommendRequest(BaseModel):
    personal_color: str
    personal_color_detail: Optional[str] = None
    user_prompt: str
    skeleton_type: Optional[str] = "스트레이트"
    body_shape: Optional[str] = "모래시계"
    gender: Optional[str] = "female"
    height: Optional[float] = None
    weight: Optional[float] = None
    style_preferences: list[str] = Field(default_factory=list)
    camera_quality: dict[str, Any] = Field(default_factory=dict)


class RecommendationSaveRequest(BaseModel):
    recommended_items: list[dict[str, Any]] = Field(default_factory=list)
    recommended_style: str = ""


class AnalysisSaveRequest(BaseModel):
    user_id: Optional[int] = None
    result_name: str
    confidence: float
    season: Optional[str] = None
    tone: Optional[str] = None


class UserProfileRequest(BaseModel):
    nickname: Optional[str] = None
    gender: Optional[str] = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in {"male", "female"}:
            raise ValueError("gender는 male 또는 female만 허용됩니다.")
        return value

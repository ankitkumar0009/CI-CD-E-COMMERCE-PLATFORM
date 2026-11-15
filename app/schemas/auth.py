from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AdminLoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Admin username or verified email")
    password: str = Field(..., min_length=6, description="Admin secret password")


class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: AdminUserResponse
    admin: Optional[AdminUserResponse] = None

    @classmethod
    def create(cls, access_token: str, expires_in_minutes: int, user: AdminUserResponse):
        return cls(
            access_token=access_token,
            token_type="bearer",
            expires_in_minutes=expires_in_minutes,
            user=user,
            admin=user
        )


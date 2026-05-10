from __future__ import annotations
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    role: str
    student_id: str | None = Field(default=None, max_length=50)
    staff_id: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=255)

    model_config = ConfigDict(str_strip_whitespace=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)
    confirm_password: str = Field(min_length=6, max_length=128)

    model_config = ConfigDict(str_strip_whitespace=True)


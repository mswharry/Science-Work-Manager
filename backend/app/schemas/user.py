from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_approved: bool

    model_config = ConfigDict(from_attributes=True)


class UserApproveRequest(BaseModel):
    is_approved: bool
    role: str

    model_config = ConfigDict(str_strip_whitespace=True)

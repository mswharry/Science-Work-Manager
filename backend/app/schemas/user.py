from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_approved: bool
    staff_id: str | None = None
    student_id: str | None = None
    department: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserApproveRequest(BaseModel):
    is_approved: bool
    role: str

    model_config = ConfigDict(str_strip_whitespace=True)

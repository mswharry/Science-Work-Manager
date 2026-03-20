from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    target_role: str | None = None


class NotificationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = None
    target_role: str | None = None
    is_active: bool | None = None


class NotificationOut(BaseModel):
    id: int
    title: str
    content: str
    target_role: str | None = None
    created_by: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


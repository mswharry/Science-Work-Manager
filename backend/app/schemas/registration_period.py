from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class RegistrationPeriodOut(BaseModel):
    id: int
    title: str
    registration_start: date | None = None
    registration_end: date | None = None
    description: str | None = None
    requirements: str | None = None
    is_open: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PaperClassificationOptionOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperClassificationGroupOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    display_order: int
    is_active: bool
    options: list[PaperClassificationOptionOut]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

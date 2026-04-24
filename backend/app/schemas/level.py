from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LevelCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=255)
    entity_type: str
    description: str | None = None
    weight: int | None = None
    points: int | None = None
    is_active: bool = True

    model_config = ConfigDict(str_strip_whitespace=True)


class LevelUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    weight: int | None = None
    points: int | None = None
    is_active: bool | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class LevelOut(BaseModel):
    id: int
    code: str
    name: str
    entity_type: str
    description: str | None = None
    weight: int | None = None
    points: int | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

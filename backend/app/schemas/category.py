from __future__ import annotations
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    points: int | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    points: int | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str
    description: str | None = None
    points: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



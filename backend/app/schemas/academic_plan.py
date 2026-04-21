from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AcademicPlanCreate(BaseModel):
    academic_year: str = Field(min_length=9, max_length=20)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: Literal["draft", "active", "closed"] = "draft"
    sheet_file_name: str | None = None
    sheet_file_url: str | None = None
    sheet_file_content_type: str | None = None


class AcademicPlanUpdate(BaseModel):
    academic_year: str | None = Field(default=None, min_length=9, max_length=20)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: Literal["draft", "active", "closed"] | None = None
    sheet_file_name: str | None = None
    sheet_file_url: str | None = None
    sheet_file_content_type: str | None = None


class AcademicPlanOut(BaseModel):
    id: int
    academic_year: str
    title: str
    description: str | None = None
    status: str
    sheet_file_name: str | None = None
    sheet_file_url: str | None = None
    sheet_file_content_type: str | None = None
    created_by: int | None = None
    updated_by: int | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

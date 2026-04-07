from __future__ import annotations
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PaperCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    category_id: int
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    file_url: str | None = None


class PaperUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    category_id: int | None = None
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    file_url: str | None = None


class PaperReviewRequest(BaseModel):
    action: str
    note: str | None = None


class AddAuthorRequest(BaseModel):
    user_id: int
    author_order: int = 1
    is_corresponding: bool = False


class PaperOut(BaseModel):
    id: int
    title: str
    category_id: int
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    status: str
    file_url: str | None = None
    review_note: str | None = None
    reviewed_by: int | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

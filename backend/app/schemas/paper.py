from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PaperCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    category_id: int
    level_id: int | None = None
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    file_url: str | None = None
    supervisor_lecturer_id: int | None = None
    classification_option_ids: list[int] | None = None


class PaperUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    category_id: int | None = None
    level_id: int | None = None
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    file_url: str | None = None
    supervisor_lecturer_id: int | None = None
    classification_option_ids: list[int] | None = None


class PaperClassificationTagOut(BaseModel):
    group_id: int
    group_name: str
    option_id: int
    option_code: str
    option_name: str


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
    category_name: str | None = None
    level_id: int | None = None
    level_name: str | None = None
    level_code: str | None = None
    created_by: int | None = None
    creator_name: str | None = None
    creator_email: str | None = None
    creator_staff_id: str | None = None
    creator_student_id: str | None = None
    creator_department: str | None = None
    journal_name: str | None = None
    publication_year: int | None = None
    volume: str | None = None
    issue: str | None = None
    pages: str | None = None
    doi: str | None = None
    status: str
    file_url: str | None = None
    supervisor_lecturer_id: int | None = None
    supervisor_full_name: str | None = None
    supervisor_email: str | None = None
    supervisor_staff_id: str | None = None
    supervisor_department: str | None = None
    classification_options: list[PaperClassificationTagOut] = Field(default_factory=list)
    review_note: str | None = None
    reviewed_by: int | None = None
    reviewed_by_name: str | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

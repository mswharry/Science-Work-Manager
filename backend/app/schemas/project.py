from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category_id: int
    budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    proposal_file: str | None = None
    final_report_file: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category_id: int | None = None
    budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    proposal_file: str | None = None
    final_report_file: str | None = None


class ProjectReviewRequest(BaseModel):
    action: Literal["approve", "reject"]
    note: str | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    code: str | None = None
    category_id: int
    category_name: str | None = None
    leader_id: int
    leader_name: str | None = None
    leader_email: str | None = None
    budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str
    description: str | None = None
    proposal_file: str | None = None
    final_report_file: str | None = None
    review_note: str | None = None
    reviewed_by: int | None = None
    reviewed_by_name: str | None = None
    reviewed_at: datetime | None = None
    completion_requested: bool = False
    completion_requested_at: datetime | None = None
    completion_requested_by: int | None = None
    completion_requested_by_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

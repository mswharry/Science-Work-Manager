from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewAssignmentCreate(BaseModel):
    reviewer_id: int
    due_date: date | None = None
    note: str | None = None


class ReviewAssignmentOut(BaseModel):
    id: int
    project_id: int
    round_id: int
    project_name: str | None = None
    project_code: str | None = None
    reviewer_id: int
    reviewer_name: str | None = None
    reviewer_email: str | None = None
    reviewer_department: str | None = None
    assigned_by: int | None = None
    assigned_by_name: str | None = None
    due_date: date | None = None
    note: str | None = None
    status: str
    submitted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewAssignmentFilter(BaseModel):
    status: str | None = None
    reviewer_id: int | None = None
    project_id: int | None = None


class ReviewerCandidateOut(BaseModel):
    id: int
    full_name: str
    email: str
    staff_id: str | None = None
    department: str | None = None

    model_config = ConfigDict(from_attributes=True)

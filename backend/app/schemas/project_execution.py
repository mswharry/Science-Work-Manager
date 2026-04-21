from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    assignee_id: int | None = None
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    assignee_id: int | None = None
    due_date: date | None = None


class TaskSubmitRequest(BaseModel):
    submission_note: str | None = None


class TaskReviewRequest(BaseModel):
    action: Literal["approve", "reject"]
    note: str | None = None


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None = None
    assignee_id: int | None = None
    assignee_name: str | None = None
    due_date: date | None = None
    status: str
    submission_note: str | None = None
    submitted_at: datetime | None = None
    review_note: str | None = None
    reviewed_by: int | None = None
    reviewed_by_name: str | None = None
    reviewed_at: datetime | None = None
    created_by: int
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = False

    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    due_date: date


class ReportSubmitRequest(BaseModel):
    content: str = Field(min_length=1)


class ReportReviewRequest(BaseModel):
    action: Literal["approve", "reject"]
    note: str | None = None


class ReportOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None = None
    due_date: date
    status: str
    submission_content: str | None = None
    submitted_at: datetime | None = None
    submitted_by: int | None = None
    submitted_by_name: str | None = None
    review_note: str | None = None
    reviewed_by: int | None = None
    reviewed_by_name: str | None = None
    reviewed_at: datetime | None = None
    created_by: int
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = False

    model_config = ConfigDict(from_attributes=True)


class ExecutionOverviewOut(BaseModel):
    project_id: int
    total_tasks: int
    done_tasks: int
    progress_percent: int
    overdue_task_count: int
    overdue_report_count: int
    is_project_overdue: bool
    warning_messages: list[str]

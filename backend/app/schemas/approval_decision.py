from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ApprovalDecisionCreate(BaseModel):
    decision_type: str
    approved_budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    conditions: str | None = None
    note: str | None = None
    attachment_url: str | None = None


class ApprovalDecisionOut(BaseModel):
    id: int
    project_id: int
    round_id: int
    decision_type: str
    approved_budget: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    conditions: str | None = None
    note: str | None = None
    attachment_url: str | None = None
    decided_by: int | None = None
    decided_by_name: str | None = None
    decided_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

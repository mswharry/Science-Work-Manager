from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewFeedbackCreate(BaseModel):
    score: float | None = Field(default=None, ge=0, le=10)
    comment: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    recommendation: str | None = None
    attachment_url: str | None = None
    submit: bool = True


class ReviewFeedbackOut(BaseModel):
    id: int
    assignment_id: int
    reviewer_id: int
    reviewer_name: str | None = None
    score: float | None = None
    comment: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    recommendation: str | None = None
    attachment_url: str | None = None
    submitted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

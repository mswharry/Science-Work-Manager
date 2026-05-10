from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ReviewRoundCreate(BaseModel):
    project_id: int
    round_number: int = 1
    status: str | None = None


class ReviewRoundOut(BaseModel):
    id: int
    project_id: int
    round_number: int
    status: str
    form_check_note: str | None = None
    meeting_at: datetime | None = None
    meeting_location: str | None = None
    revision_request_content: str | None = None
    revision_required_files: str | None = None
    revision_deadline: date | None = None
    revision_submitted_at: datetime | None = None
    revision_submission_note: str | None = None
    revision_files: str | None = None
    created_by: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FormCheckRequest(BaseModel):
    passed: bool
    note: str | None = None


class MeetingScheduleRequest(BaseModel):
    meeting_at: datetime
    meeting_location: str


class RevisionRequest(BaseModel):
    content: str
    deadline: date
    required_files: str | None = None


class RevisionSubmissionRequest(BaseModel):
    revision_files: str | None = None
    note: str | None = None


class RoundDeadlineExtensionRequest(BaseModel):
    revision_deadline: date
    reason: str


class RoundCancelRequest(BaseModel):
    reason: str

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ExecutionHistoryOut(BaseModel):
    id: int
    project_id: int
    action: str
    previous_status: str | None = None
    new_status: str | None = None
    detail: str | None = None
    performed_by: int | None = None
    performed_by_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

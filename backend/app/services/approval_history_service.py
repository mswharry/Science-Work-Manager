from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.models.approval_history import ApprovalHistory


def add_history_entry(
    db: Session,
    project_id: int,
    round_id: int | None,
    action: str,
    previous_status: str | None,
    new_status: str | None,
    detail: str | None,
    performed_by: int | None,
) -> ApprovalHistory:
    entry = ApprovalHistory(
        project_id=project_id,
        round_id=round_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        detail=detail,
        performed_by=performed_by,
    )
    db.add(entry)
    db.flush()
    return entry


def list_approval_history(db: Session, project_id: int) -> list[ApprovalHistory]:
    stmt: Select[tuple[ApprovalHistory]] = (
        select(ApprovalHistory)
        .where(ApprovalHistory.project_id == project_id)
        .options(joinedload(ApprovalHistory.performer))
        .order_by(ApprovalHistory.created_at.desc())
    )
    return list(db.scalars(stmt))

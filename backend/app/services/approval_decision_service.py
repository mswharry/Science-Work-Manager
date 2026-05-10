from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.core.constants import ApprovalDecisionType, ReviewRoundStatus, ProjectStatus
from app.models.approval_decision import ApprovalDecision
from app.models.project import Project
from app.models.review_round import ReviewRound
from app.services.approval_history_service import add_history_entry
from app.services.review_round_service import update_round_status


DECISION_NOT_FOUND = "Không tìm thấy quyết định xét duyệt."
ROUND_NOT_FOUND = "Không tìm thấy vòng xét duyệt."


def make_approval_decision(
    db: Session,
    project_id: int,
    decision_type: str,
    approved_budget: float | None,
    start_date,
    end_date,
    conditions: str | None,
    note: str | None,
    attachment_url: str | None,
    admin_user_id: int,
) -> ApprovalDecision:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đề tài.")

    round_item = db.scalar(
        select(ReviewRound).where(ReviewRound.project_id == project_id).order_by(ReviewRound.round_number.desc())
    )
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    try:
        decision_enum = ApprovalDecisionType(decision_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại quyết định không hợp lệ.") from exc
    decision = ApprovalDecision(
        project_id=project_id,
        round_id=round_item.id,
        decision_type=decision_enum,
        approved_budget=approved_budget,
        start_date=start_date,
        end_date=end_date,
        conditions=conditions,
        note=note,
        attachment_url=attachment_url,
        decided_by=admin_user_id,
        decided_at=datetime.now(timezone.utc),
    )
    db.add(decision)

    if decision_enum == ApprovalDecisionType.APPROVED:
        project.status = ProjectStatus.APPROVED
        update_round_status(
            db=db,
            round_item=round_item,
            new_status=ReviewRoundStatus.DECIDED,
            action="decision_approved",
            detail="Đề tài được duyệt.",
            performed_by=admin_user_id,
        )
    elif decision_enum == ApprovalDecisionType.REJECTED:
        project.status = ProjectStatus.REJECTED
        update_round_status(
            db=db,
            round_item=round_item,
            new_status=ReviewRoundStatus.DECIDED,
            action="decision_rejected",
            detail="Đề tài không được duyệt.",
            performed_by=admin_user_id,
        )
    else:
        update_round_status(
            db=db,
            round_item=round_item,
            new_status=ReviewRoundStatus.REVISION_REQUESTED,
            action="decision_revision",
            detail="Yêu cầu chỉnh sửa hồ sơ.",
            performed_by=admin_user_id,
        )

    add_history_entry(
        db=db,
        project_id=project_id,
        round_id=round_item.id,
        action="approval_decision",
        previous_status=round_item.status.value,
        new_status=round_item.status.value,
        detail=f"Quyết định: {decision_enum.value}.",
        performed_by=admin_user_id,
    )

    db.commit()
    return decision


def list_decisions_by_project(db: Session, project_id: int) -> list[ApprovalDecision]:
    stmt: Select[tuple[ApprovalDecision]] = (
        select(ApprovalDecision)
        .where(ApprovalDecision.project_id == project_id)
        .options(joinedload(ApprovalDecision.decider))
        .order_by(ApprovalDecision.created_at.desc())
    )
    return list(db.scalars(stmt))

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.constants import ReviewRoundStatus
from app.models.review_round import ReviewRound
from app.services.approval_history_service import add_history_entry


ROUND_NOT_FOUND = "Không tìm thấy vòng xét duyệt."


def create_initial_round(db: Session, project_id: int, created_by: int | None) -> ReviewRound:
    existing = db.scalar(select(ReviewRound.id).where(ReviewRound.project_id == project_id).limit(1))
    if existing:
        return get_current_round(db=db, project_id=project_id)

    round_item = ReviewRound(
        project_id=project_id,
        round_number=1,
        status=ReviewRoundStatus.FORM_CHECK_PENDING,
        created_by=created_by,
    )
    db.add(round_item)
    db.flush()
    add_history_entry(
        db=db,
        project_id=project_id,
        round_id=round_item.id,
        action="round_created",
        previous_status=None,
        new_status=round_item.status.value,
        detail="Khởi tạo vòng xét duyệt đầu tiên.",
        performed_by=created_by,
    )
    return round_item


def get_current_round(db: Session, project_id: int) -> ReviewRound:
    stmt: Select[tuple[ReviewRound]] = (
        select(ReviewRound)
        .where(ReviewRound.project_id == project_id)
        .order_by(ReviewRound.round_number.desc())
        .limit(1)
    )
    round_item = db.scalar(stmt)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)
    return round_item


def get_round_by_id(db: Session, round_id: int) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)
    return round_item


def update_round_status(
    db: Session,
    round_item: ReviewRound,
    new_status: ReviewRoundStatus,
    action: str,
    detail: str | None,
    performed_by: int | None,
) -> ReviewRound:
    previous_status = round_item.status.value
    round_item.status = new_status
    add_history_entry(
        db=db,
        project_id=round_item.project_id,
        round_id=round_item.id,
        action=action,
        previous_status=previous_status,
        new_status=new_status.value,
        detail=detail,
        performed_by=performed_by,
    )
    return round_item


def record_form_check(db: Session, round_id: int, passed: bool, note: str | None, admin_user_id: int) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    round_item.form_check_note = note
    new_status = ReviewRoundStatus.ASSIGNMENT_PENDING if passed else ReviewRoundStatus.FORM_CHECK_FAILED
    update_round_status(
        db=db,
        round_item=round_item,
        new_status=new_status,
        action="form_check",
        detail="Đạt hình thức." if passed else "Không đạt hình thức.",
        performed_by=admin_user_id,
    )
    db.commit()
    return round_item


def schedule_council_meeting(
    db: Session,
    round_id: int,
    meeting_at: datetime,
    meeting_location: str,
    admin_user_id: int,
) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    round_item.meeting_at = meeting_at
    round_item.meeting_location = meeting_location
    update_round_status(
        db=db,
        round_item=round_item,
        new_status=ReviewRoundStatus.COUNCIL_SCHEDULED,
        action="schedule_council",
        detail="Đã cập nhật lịch họp hội đồng.",
        performed_by=admin_user_id,
    )
    db.commit()
    return round_item


def create_revision_request(
    db: Session,
    round_id: int,
    content: str,
    deadline,
    required_files: str | None,
    admin_user_id: int,
) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    round_item.revision_request_content = content
    round_item.revision_deadline = deadline
    round_item.revision_required_files = required_files
    update_round_status(
        db=db,
        round_item=round_item,
        new_status=ReviewRoundStatus.REVISION_REQUESTED,
        action="revision_request",
        detail="Đã gửi yêu cầu chỉnh sửa hồ sơ.",
        performed_by=admin_user_id,
    )
    db.commit()
    return round_item


def submit_revision(
    db: Session,
    round_id: int,
    revision_files: str | None,
    note: str | None,
    submitter_id: int,
) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    round_item.revision_files = revision_files
    round_item.revision_submission_note = note
    round_item.revision_submitted_at = datetime.now(timezone.utc)
    update_round_status(
        db=db,
        round_item=round_item,
        new_status=ReviewRoundStatus.REVISION_SUBMITTED,
        action="revision_submitted",
        detail="Đã nộp bản chỉnh sửa hồ sơ.",
        performed_by=submitter_id,
    )
    db.commit()
    return round_item


def extend_round_deadline(
    db: Session,
    round_id: int,
    revision_deadline,
    reason: str,
    admin_user_id: int,
) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    previous_deadline = round_item.revision_deadline
    round_item.revision_deadline = revision_deadline
    add_history_entry(
        db=db,
        project_id=round_item.project_id,
        round_id=round_item.id,
        action="deadline_extended",
        previous_status=round_item.status.value,
        new_status=round_item.status.value,
        detail=f"Gia hạn hạn chỉnh sửa từ {previous_deadline or 'chưa có'} sang {revision_deadline}. Lý do: {reason}",
        performed_by=admin_user_id,
    )
    db.commit()
    return round_item


def cancel_review_round(
    db: Session,
    round_id: int,
    reason: str,
    admin_user_id: int,
) -> ReviewRound:
    round_item = db.get(ReviewRound, round_id)
    if not round_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ROUND_NOT_FOUND)

    update_round_status(
        db=db,
        round_item=round_item,
        new_status=ReviewRoundStatus.CANCELED,
        action="round_canceled",
        detail=f"Đã hủy phiên xét duyệt/thu hồi quyết định. Lý do: {reason}",
        performed_by=admin_user_id,
    )
    db.commit()
    return round_item

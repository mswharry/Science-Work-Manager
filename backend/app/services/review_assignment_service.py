from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.constants import ReviewAssignmentStatus, ReviewRoundStatus, UserRole
from app.models.project import Project
from app.models.review_assignment import ReviewAssignment
from app.models.review_round import ReviewRound
from app.models.user import User
from app.services.approval_history_service import add_history_entry
from app.services.review_round_service import get_current_round, update_round_status


MIN_REVIEWERS_REQUIRED = 2


def list_reviewer_candidates(
    db: Session,
    project_id: int,
    keyword: str | None = None,
    department: str | None = None,
) -> list[User]:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đề tài.")

    stmt: Select[tuple[User]] = select(User).where(
        User.role == UserRole.LECTURER,
        User.is_active.is_(True),
        User.is_approved.is_(True),
        User.id != project.leader_id,
    )

    if department:
        stmt = stmt.where(User.department == department)

    if keyword:
        keyword_like = f"%{keyword.strip()}%"
        stmt = stmt.where(or_(User.full_name.ilike(keyword_like), User.email.ilike(keyword_like)))

    return list(db.scalars(stmt))


def assign_reviewers(
    db: Session,
    project_id: int,
    reviewer_ids: list[int],
    due_date: date | None,
    note: str | None,
    admin_user_id: int,
) -> list[ReviewAssignment]:
    if len(set(reviewer_ids)) < MIN_REVIEWERS_REQUIRED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cần chọn ít nhất {MIN_REVIEWERS_REQUIRED} phản biện.",
        )

    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đề tài.")

    round_item = get_current_round(db=db, project_id=project_id)
    if round_item.status not in {
        ReviewRoundStatus.ASSIGNMENT_PENDING,
        ReviewRoundStatus.FORM_CHECK_PENDING,
        ReviewRoundStatus.IN_REVIEW,
    }:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể phân công ở trạng thái hiện tại.")

    existing = list(
        db.scalars(
            select(ReviewAssignment).where(
                ReviewAssignment.project_id == project_id,
                ReviewAssignment.round_id == round_item.id,
            )
        )
    )
    for item in existing:
        db.delete(item)

    assignments: list[ReviewAssignment] = []
    for reviewer_id in set(reviewer_ids):
        if reviewer_id == project.leader_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể phân công chủ nhiệm đề tài làm phản biện.",
            )
        assignments.append(
            ReviewAssignment(
                project_id=project_id,
                round_id=round_item.id,
                reviewer_id=reviewer_id,
                assigned_by=admin_user_id,
                due_date=due_date,
                note=note,
                status=ReviewAssignmentStatus.ASSIGNED,
            )
        )

    db.add_all(assignments)
    update_round_status(
        db=db,
        round_item=round_item,
        new_status=ReviewRoundStatus.IN_REVIEW,
        action="assign_reviewers",
        detail="Đã phân công phản biện.",
        performed_by=admin_user_id,
    )

    db.flush()
    db.commit()
    return assignments


def list_assignments_for_reviewer(
    db: Session,
    reviewer_id: int,
    status: str | None = None,
) -> list[ReviewAssignment]:
    stmt: Select[tuple[ReviewAssignment]] = (
        select(ReviewAssignment)
        .where(ReviewAssignment.reviewer_id == reviewer_id)
        .options(joinedload(ReviewAssignment.project))
        .order_by(ReviewAssignment.created_at.desc())
    )

    if status:
        stmt = stmt.where(ReviewAssignment.status == status)

    return list(db.scalars(stmt))


def list_assignments_by_project(db: Session, project_id: int) -> list[ReviewAssignment]:
    stmt: Select[tuple[ReviewAssignment]] = (
        select(ReviewAssignment)
        .where(ReviewAssignment.project_id == project_id)
        .options(joinedload(ReviewAssignment.reviewer), joinedload(ReviewAssignment.project))
        .order_by(ReviewAssignment.created_at.desc())
    )
    return list(db.scalars(stmt))


def get_assignment_by_id(db: Session, assignment_id: int) -> ReviewAssignment | None:
    stmt: Select[tuple[ReviewAssignment]] = (
        select(ReviewAssignment)
        .where(ReviewAssignment.id == assignment_id)
        .options(joinedload(ReviewAssignment.project), joinedload(ReviewAssignment.reviewer))
    )
    return db.scalar(stmt)

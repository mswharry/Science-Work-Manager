from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import AcademicPlanStatus
from app.models.academic_plan import AcademicPlan
from app.models.user import User
from app.schemas.academic_plan import AcademicPlanCreate, AcademicPlanUpdate
from app.services.upload_service import delete_local_upload

ACADEMIC_YEAR_PATTERN = re.compile(r"^\d{4}-\d{4}$")


def _validate_academic_year(academic_year: str) -> str:
    normalized = academic_year.strip()
    if not ACADEMIC_YEAR_PATTERN.match(normalized):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Niên khóa phải có định dạng YYYY-YYYY.",
        )

    start_year, end_year = (int(part) for part in normalized.split("-"))
    if end_year != start_year + 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Niên khóa phải tương ứng đúng một năm học.",
        )

    return normalized


def _ensure_active_status_rule(db: Session, plan_id: int | None = None) -> None:
    stmt: Select[tuple[AcademicPlan]] = select(AcademicPlan).where(AcademicPlan.status == AcademicPlanStatus.ACTIVE)
    if plan_id is not None:
        stmt = stmt.where(AcademicPlan.id != plan_id)
    active_plan = db.scalar(stmt)
    if active_plan:
        active_plan.status = AcademicPlanStatus.CLOSED
        active_plan.reviewed_at = datetime.now(timezone.utc)


def list_academic_plans(db: Session) -> list[AcademicPlan]:
    stmt: Select[tuple[AcademicPlan]] = select(AcademicPlan).order_by(AcademicPlan.created_at.desc(), AcademicPlan.id.desc())
    return list(db.scalars(stmt))


def get_academic_plan(db: Session, plan_id: int) -> AcademicPlan:
    plan = db.scalar(select(AcademicPlan).where(AcademicPlan.id == plan_id))
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy kế hoạch năm học.")
    return plan


def create_academic_plan(db: Session, payload: AcademicPlanCreate, admin_user: User) -> AcademicPlan:
    academic_year = _validate_academic_year(payload.academic_year)
    status_value = AcademicPlanStatus(payload.status)

    if not payload.sheet_file_url or not payload.sheet_file_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng tải lên tệp kế hoạch năm học.",
        )

    if status_value == AcademicPlanStatus.ACTIVE:
        _ensure_active_status_rule(db)

    plan = AcademicPlan(
        academic_year=academic_year,
        title=payload.title.strip(),
        description=payload.description,
        status=status_value,
        sheet_file_name=payload.sheet_file_name,
        sheet_file_url=payload.sheet_file_url,
        sheet_file_content_type=payload.sheet_file_content_type,
        created_by=admin_user.id,
        updated_by=admin_user.id,
        reviewed_at=datetime.now(timezone.utc),
    )
    db.add(plan)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Kế hoạch năm học của niên khóa này đã tồn tại.",
        ) from exc

    db.refresh(plan)
    return plan


def update_academic_plan(db: Session, plan_id: int, payload: AcademicPlanUpdate, admin_user: User) -> AcademicPlan:
    plan = get_academic_plan(db=db, plan_id=plan_id)
    previous_sheet_url = None

    if payload.academic_year is not None:
        plan.academic_year = _validate_academic_year(payload.academic_year)
    if payload.title is not None:
        plan.title = payload.title.strip()
    if payload.description is not None:
        plan.description = payload.description
    if payload.sheet_file_name is not None:
        plan.sheet_file_name = payload.sheet_file_name
    if payload.sheet_file_url is not None:
        previous_sheet_url = plan.sheet_file_url if payload.sheet_file_url != plan.sheet_file_url else None
        plan.sheet_file_url = payload.sheet_file_url
    if payload.sheet_file_content_type is not None:
        plan.sheet_file_content_type = payload.sheet_file_content_type
    if payload.status is not None:
        status_value = AcademicPlanStatus(payload.status)
        if status_value == AcademicPlanStatus.ACTIVE:
            _ensure_active_status_rule(db, plan_id=plan.id)
        plan.status = status_value

    plan.updated_by = admin_user.id
    plan.reviewed_at = datetime.now(timezone.utc)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Kế hoạch năm học của niên khóa này đã tồn tại.",
        ) from exc

    db.refresh(plan)
    if previous_sheet_url:
        delete_local_upload(previous_sheet_url)
    return plan


def activate_academic_plan(db: Session, plan_id: int, admin_user: User) -> AcademicPlan:
    plan = get_academic_plan(db=db, plan_id=plan_id)
    _ensure_active_status_rule(db, plan_id=plan.id)
    plan.status = AcademicPlanStatus.ACTIVE
    plan.updated_by = admin_user.id
    plan.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    return plan


def close_academic_plan(db: Session, plan_id: int, admin_user: User) -> AcademicPlan:
    plan = get_academic_plan(db=db, plan_id=plan_id)
    plan.status = AcademicPlanStatus.CLOSED
    plan.updated_by = admin_user.id
    plan.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    return plan


def delete_academic_plan(db: Session, plan_id: int) -> None:
    plan = get_academic_plan(db=db, plan_id=plan_id)
    if plan.status == AcademicPlanStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cần đóng kế hoạch năm học đang hoạt động trước khi xóa.",
        )

    sheet_url = plan.sheet_file_url
    db.delete(plan)
    db.commit()
    delete_local_upload(sheet_url)

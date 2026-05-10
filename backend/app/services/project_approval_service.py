from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.project import Project
from app.models.review_round import ReviewRound
from app.services.review_round_service import get_current_round


def _decorate_project(project: Project) -> Project:
    project.category_name = project.category.name if project.category else None
    project.leader_name = project.leader.full_name if project.leader else None
    project.leader_email = project.leader.email if project.leader else None
    project.leader_department = project.leader.department if project.leader else None
    return project


PROJECT_NOT_FOUND = "Không tìm thấy đề tài."


def list_projects_for_approval(
    db: Session,
    status_filter: str | None = None,
    department: str | None = None,
    keyword: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Project]:
    stmt: Select[tuple[Project]] = (
        select(Project)
        .options(joinedload(Project.leader), joinedload(Project.category))
        .order_by(Project.submitted_at.desc().nullslast(), Project.id.desc())
    )

    if department:
        stmt = stmt.where(Project.leader.has(department=department))

    if keyword:
        keyword_like = f"%{keyword.strip()}%"
        stmt = stmt.where(or_(Project.name.ilike(keyword_like), Project.code.ilike(keyword_like)))

    if start_date:
        stmt = stmt.where(Project.submitted_at >= start_date)
    if end_date:
        stmt = stmt.where(Project.submitted_at <= end_date)

    projects = list(db.scalars(stmt).unique())

    for project in projects:
        _decorate_project(project)
        try:
            round_item = get_current_round(db=db, project_id=project.id)
            project.approval_status = round_item.status.value
            project.approval_round_id = round_item.id
        except HTTPException:
            project.approval_status = None
            project.approval_round_id = None

    if status_filter:
        filtered: list[Project] = []
        for project in projects:
            if project.approval_status == status_filter:
                filtered.append(project)
        return filtered

    return projects


def get_project_for_approval(db: Session, project_id: int) -> Project:
    project = db.scalar(
        select(Project)
        .where(Project.id == project_id)
        .options(
            joinedload(Project.category),
            joinedload(Project.level),
            joinedload(Project.leader),
            joinedload(Project.review_rounds),
        )
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PROJECT_NOT_FOUND)
    project = _decorate_project(project)
    try:
        round_item = get_current_round(db=db, project_id=project.id)
        project.approval_status = round_item.status.value
        project.approval_round_id = round_item.id
    except HTTPException:
        project.approval_status = None
        project.approval_round_id = None
    return project

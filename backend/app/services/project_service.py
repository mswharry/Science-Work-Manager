from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, extract, or_, select
from sqlalchemy.orm import Session

from app.core.constants import CategoryType, ProjectStatus, UserRole
from app.models.category import Category
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectReviewRequest, ProjectUpdate


def _get_project_or_404(db: Session, project_id: int) -> Project:
	project = db.get(Project, project_id)
	if not project:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
	return project


def _ensure_project_category_exists(db: Session, category_id: int) -> None:
	category = db.get(Category, category_id)
	if not category or category.type != CategoryType.PROJECT_TYPE:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Invalid project category.",
		)


def _ensure_project_visible(project: Project, current_user: User) -> None:
	if current_user.role == UserRole.ADMIN:
		return
	if project.leader_id == current_user.id:
		return
	if project.status in {ProjectStatus.APPROVED, ProjectStatus.COMPLETED}:
		return
	raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this project.")


def _ensure_leader_permission(project: Project, current_user: User) -> None:
	if project.leader_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project leader can perform this action.")


def _ensure_editable_status(project: Project) -> None:
	if project.status not in {ProjectStatus.PENDING, ProjectStatus.REJECTED}:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Project can only be modified when status is pending or rejected.",
		)


def create_project(db: Session, payload: ProjectCreate, current_user: User) -> Project:
	if current_user.role == UserRole.ADMIN:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Admin is not allowed to create projects.",
		)

	_ensure_project_category_exists(db, payload.category_id)

	project = Project(
		name=payload.name,
		category_id=payload.category_id,
		leader_id=current_user.id,
		budget=payload.budget,
		start_date=payload.start_date,
		end_date=payload.end_date,
		status=ProjectStatus.PENDING,
		description=payload.description,
	)
	db.add(project)
	db.commit()
	db.refresh(project)
	return project


def list_projects(
	db: Session,
	current_user: User,
	status_filter: str | None = None,
	year: int | None = None,
	keyword: str | None = None,
	mine: bool = False,
) -> list[Project]:
	stmt: Select[tuple[Project]] = select(Project).order_by(Project.id.desc())

	if current_user.role != UserRole.ADMIN:
		if mine:
			stmt = stmt.where(Project.leader_id == current_user.id)
		else:
			stmt = stmt.where(
				or_(
					Project.leader_id == current_user.id,
					Project.status.in_([ProjectStatus.APPROVED, ProjectStatus.COMPLETED]),
				)
			)
	elif mine:
		stmt = stmt.where(Project.leader_id == current_user.id)

	if status_filter:
		allowed_statuses = {project_status.value for project_status in ProjectStatus}
		if status_filter not in allowed_statuses:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status filter.")
		stmt = stmt.where(Project.status == ProjectStatus(status_filter))

	if year is not None:
		stmt = stmt.where(extract("year", Project.start_date) == year)

	if keyword:
		keyword_value = f"%{keyword.strip()}%"
		stmt = stmt.where(Project.name.ilike(keyword_value))

	return list(db.scalars(stmt))


def get_project_detail(db: Session, project_id: int, current_user: User) -> Project:
	project = _get_project_or_404(db, project_id)
	_ensure_project_visible(project, current_user)
	return project


def update_project(db: Session, project_id: int, payload: ProjectUpdate, current_user: User) -> Project:
	project = _get_project_or_404(db, project_id)
	_ensure_leader_permission(project, current_user)
	_ensure_editable_status(project)

	update_data = payload.model_dump(exclude_unset=True)

	if "category_id" in update_data and update_data["category_id"] is not None:
		_ensure_project_category_exists(db, update_data["category_id"])

	for key, value in update_data.items():
		setattr(project, key, value)

	if project.status == ProjectStatus.REJECTED:
		project.status = ProjectStatus.PENDING
		project.review_note = None
		project.reviewed_by = None
		project.reviewed_at = None

	db.commit()
	db.refresh(project)
	return project


def delete_project(db: Session, project_id: int, current_user: User) -> None:
	project = _get_project_or_404(db, project_id)
	_ensure_leader_permission(project, current_user)
	_ensure_editable_status(project)
	db.delete(project)
	db.commit()


def review_project(db: Session, project_id: int, payload: ProjectReviewRequest, admin_user: User) -> Project:
	project = _get_project_or_404(db, project_id)

	if payload.action not in {"approve", "reject"}:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be approve or reject.")

	if project.status != ProjectStatus.PENDING:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Only pending projects can be reviewed.",
		)

	project.status = ProjectStatus.APPROVED if payload.action == "approve" else ProjectStatus.REJECTED
	project.review_note = payload.note
	project.reviewed_by = admin_user.id
	project.reviewed_at = datetime.now(timezone.utc)

	db.commit()
	db.refresh(project)
	return project


def complete_project(db: Session, project_id: int, admin_user: User) -> Project:
	project = _get_project_or_404(db, project_id)

	if project.status != ProjectStatus.APPROVED:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Only approved projects can be completed.",
		)

	project.status = ProjectStatus.COMPLETED
	project.reviewed_by = admin_user.id
	project.reviewed_at = datetime.now(timezone.utc)
	db.commit()
	db.refresh(project)
	return project


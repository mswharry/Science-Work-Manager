from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.project import ProjectCreate, ProjectOut, ProjectReviewRequest, ProjectUpdate
from app.services.project_service import (
	complete_project,
	create_project,
	delete_project,
	get_project_detail,
	list_projects,
	review_project,
	update_project,
)

router = APIRouter(tags=["projects"])


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(
	payload: ProjectCreate,
	db: DbSession,
	current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
	project = create_project(db=db, payload=payload, current_user=current_user)
	return ProjectOut.model_validate(project)


@router.get("/projects", response_model=list[ProjectOut])
def list_projects_endpoint(
	db: DbSession,
	current_user: Annotated[User, Depends(get_current_user)],
	status_filter: str | None = Query(default=None, alias="status"),
	year: int | None = Query(default=None),
	keyword: str | None = Query(default=None),
	mine: bool = Query(default=False),
) -> list[ProjectOut]:
	projects = list_projects(
		db=db,
		current_user=current_user,
		status_filter=status_filter,
		year=year,
		keyword=keyword,
		mine=mine,
	)
	return [ProjectOut.model_validate(project) for project in projects]


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project_endpoint(
	project_id: int,
	db: DbSession,
	current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
	project = get_project_detail(db=db, project_id=project_id, current_user=current_user)
	return ProjectOut.model_validate(project)


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project_endpoint(
	project_id: int,
	payload: ProjectUpdate,
	db: DbSession,
	current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
	updated_project = update_project(
		db=db,
		project_id=project_id,
		payload=payload,
		current_user=current_user,
	)
	return ProjectOut.model_validate(updated_project)


@router.delete("/projects/{project_id}", response_model=MessageResponse)
def delete_project_endpoint(
	project_id: int,
	db: DbSession,
	current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
	delete_project(db=db, project_id=project_id, current_user=current_user)
	return MessageResponse(message="Project deleted successfully")


@router.put("/admin/projects/{project_id}/review", response_model=ProjectOut)
def review_project_endpoint(
	project_id: int,
	payload: ProjectReviewRequest,
	db: DbSession,
	current_admin: Annotated[User, Depends(get_current_admin_user)],
) -> ProjectOut:
	project = review_project(db=db, project_id=project_id, payload=payload, admin_user=current_admin)
	return ProjectOut.model_validate(project)


@router.put("/admin/projects/{project_id}/complete", response_model=MessageResponse)
def complete_project_endpoint(
	project_id: int,
	db: DbSession,
	current_admin: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
	complete_project(db=db, project_id=project_id, admin_user=current_admin)
	return MessageResponse(message="Project completed successfully")


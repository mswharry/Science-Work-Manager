from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.execution_history import ExecutionHistoryOut
from app.schemas.project import ProjectCreate, ProjectOut, ProjectReviewRequest, ProjectSubmitRequest, ProjectUpdate
from app.schemas.registration_history import RegistrationHistoryOut
from app.services.project_service import (
    complete_project,
    create_project,
    delete_project,
    get_project_detail,
    list_execution_history,
    list_registration_history,
    list_projects,
    submit_project,
    request_project_completion,
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
    status: str | None = Query(default=None),
    year: int | None = Query(default=None),
    keyword: str | None = Query(default=None),
    mine: bool | None = Query(default=None),
    completion_requested: bool | None = Query(default=None),
) -> list[ProjectOut]:
    projects = list_projects(
        db=db,
        current_user=current_user,
        status_filter=status,
        year=year,
        keyword=keyword,
        mine=mine,
        completion_requested=completion_requested,
    )
    return [ProjectOut.model_validate(project) for project in projects]


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project_detail_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
    project = get_project_detail(db=db, project_id=project_id, current_user=current_user)
    return ProjectOut.model_validate(project)


@router.get("/projects/{project_id}/registration-history", response_model=list[RegistrationHistoryOut])
def list_registration_history_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[RegistrationHistoryOut]:
    histories = list_registration_history(db=db, project_id=project_id, current_user=current_user)
    return [RegistrationHistoryOut.model_validate(history) for history in histories]


@router.get("/projects/{project_id}/execution-history", response_model=list[ExecutionHistoryOut])
def list_execution_history_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ExecutionHistoryOut]:
    histories = list_execution_history(db=db, project_id=project_id, current_user=current_user)
    return [ExecutionHistoryOut.model_validate(history) for history in histories]


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project_endpoint(
    project_id: int,
    payload: ProjectUpdate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
    project = update_project(db=db, project_id=project_id, payload=payload, current_user=current_user)
    return ProjectOut.model_validate(project)


@router.delete("/projects/{project_id}", response_model=MessageResponse)
def delete_project_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
    delete_project(db=db, project_id=project_id, current_user=current_user)
    return MessageResponse(message="Đã hủy hồ sơ đề tài.")


@router.put("/projects/{project_id}/cancel", response_model=MessageResponse)
def cancel_project_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
    delete_project(db=db, project_id=project_id, current_user=current_user)
    return MessageResponse(message="Đã hủy hồ sơ đề tài.")


@router.put("/projects/{project_id}/submit", response_model=ProjectOut)
def submit_project_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    payload: ProjectSubmitRequest | None = None,
) -> ProjectOut:
    project = submit_project(db=db, project_id=project_id, current_user=current_user, payload=payload)
    return ProjectOut.model_validate(project)


@router.put("/projects/{project_id}/request-completion", response_model=ProjectOut)
def request_project_completion_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectOut:
    project = request_project_completion(db=db, project_id=project_id, current_user=current_user)
    return ProjectOut.model_validate(project)


@router.put("/admin/projects/{project_id}/review", response_model=ProjectOut)
def review_project_endpoint(
    project_id: int,
    payload: ProjectReviewRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> ProjectOut:
    project = review_project(db=db, project_id=project_id, payload=payload, admin_user=admin_user)
    return ProjectOut.model_validate(project)


@router.put("/admin/projects/{project_id}/complete", response_model=MessageResponse)
def complete_project_endpoint(
    project_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    complete_project(db=db, project_id=project_id, admin_user=admin_user)
    return MessageResponse(message="Đã hoàn thành đề tài.")

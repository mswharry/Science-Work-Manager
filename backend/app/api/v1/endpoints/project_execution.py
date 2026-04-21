from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_user
from app.models.user import User
from app.schemas.project_execution import (
    ExecutionOverviewOut,
    ReportCreate,
    ReportOut,
    ReportReviewRequest,
    ReportSubmitRequest,
    TaskCreate,
    TaskOut,
    TaskReviewRequest,
    TaskSubmitRequest,
    TaskUpdate,
)
from app.services.project_execution_service import (
    create_periodic_report,
    create_project_task,
    get_execution_overview,
    list_periodic_reports,
    list_project_tasks,
    review_periodic_report,
    review_project_task,
    submit_periodic_report,
    submit_project_task,
    update_project_task,
)

router = APIRouter(tags=["project-execution"])


@router.get("/projects/{project_id}/execution-overview", response_model=ExecutionOverviewOut)
def get_execution_overview_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ExecutionOverviewOut:
    return get_execution_overview(db=db, project_id=project_id, current_user=current_user)


@router.get("/projects/{project_id}/tasks", response_model=list[TaskOut])
def list_project_tasks_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[TaskOut]:
    tasks = list_project_tasks(db=db, project_id=project_id, current_user=current_user)
    return [TaskOut.model_validate(task) for task in tasks]


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_project_task_endpoint(
    project_id: int,
    payload: TaskCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskOut:
    task = create_project_task(db=db, project_id=project_id, payload=payload, current_user=current_user)
    return TaskOut.model_validate(task)


@router.put("/projects/{project_id}/tasks/{task_id}", response_model=TaskOut)
def update_project_task_endpoint(
    project_id: int,
    task_id: int,
    payload: TaskUpdate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskOut:
    task = update_project_task(
        db=db,
        project_id=project_id,
        task_id=task_id,
        payload=payload,
        current_user=current_user,
    )
    return TaskOut.model_validate(task)


@router.put("/projects/{project_id}/tasks/{task_id}/submit", response_model=TaskOut)
def submit_project_task_endpoint(
    project_id: int,
    task_id: int,
    payload: TaskSubmitRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskOut:
    task = submit_project_task(
        db=db,
        project_id=project_id,
        task_id=task_id,
        payload=payload,
        current_user=current_user,
    )
    return TaskOut.model_validate(task)


@router.put("/projects/{project_id}/tasks/{task_id}/review", response_model=TaskOut)
def review_project_task_endpoint(
    project_id: int,
    task_id: int,
    payload: TaskReviewRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskOut:
    task = review_project_task(
        db=db,
        project_id=project_id,
        task_id=task_id,
        payload=payload,
        current_user=current_user,
    )
    return TaskOut.model_validate(task)


@router.get("/projects/{project_id}/reports", response_model=list[ReportOut])
def list_periodic_reports_endpoint(
    project_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ReportOut]:
    reports = list_periodic_reports(db=db, project_id=project_id, current_user=current_user)
    return [ReportOut.model_validate(report) for report in reports]


@router.post("/projects/{project_id}/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_periodic_report_endpoint(
    project_id: int,
    payload: ReportCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReportOut:
    report = create_periodic_report(db=db, project_id=project_id, payload=payload, current_user=current_user)
    return ReportOut.model_validate(report)


@router.put("/projects/{project_id}/reports/{report_id}/submit", response_model=ReportOut)
def submit_periodic_report_endpoint(
    project_id: int,
    report_id: int,
    payload: ReportSubmitRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReportOut:
    report = submit_periodic_report(
        db=db,
        project_id=project_id,
        report_id=report_id,
        payload=payload,
        current_user=current_user,
    )
    return ReportOut.model_validate(report)


@router.put("/projects/{project_id}/reports/{report_id}/review", response_model=ReportOut)
def review_periodic_report_endpoint(
    project_id: int,
    report_id: int,
    payload: ReportReviewRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ReportOut:
    report = review_periodic_report(
        db=db,
        project_id=project_id,
        report_id=report_id,
        payload=payload,
        current_user=current_user,
    )
    return ReportOut.model_validate(report)

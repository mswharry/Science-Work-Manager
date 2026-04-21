from __future__ import annotations

from datetime import date, datetime, timezone
from math import floor

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.core.constants import ProjectReportStatus, ProjectStatus, ProjectTaskStatus, UserRole
from app.models.association import ProjectMember
from app.models.project import Project
from app.models.project_execution import ProjectPeriodicReport, ProjectTask
from app.models.user import User
from app.schemas.project_execution import (
    ExecutionOverviewOut,
    ReportCreate,
    ReportReviewRequest,
    ReportSubmitRequest,
    TaskCreate,
    TaskReviewRequest,
    TaskSubmitRequest,
    TaskUpdate,
)


def _project_query() -> Select[tuple[Project]]:
    return select(Project).options(joinedload(Project.members))


def _task_query() -> Select[tuple[ProjectTask]]:
    return select(ProjectTask).options(
        joinedload(ProjectTask.assignee),
        joinedload(ProjectTask.reviewer),
        joinedload(ProjectTask.creator),
    )


def _report_query() -> Select[tuple[ProjectPeriodicReport]]:
    return select(ProjectPeriodicReport).options(
        joinedload(ProjectPeriodicReport.submitter),
        joinedload(ProjectPeriodicReport.reviewer),
        joinedload(ProjectPeriodicReport.creator),
    )


def _get_project(db: Session, project_id: int) -> Project:
    project = db.scalar(_project_query().where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project


def _is_project_member(db: Session, project_id: int, user_id: int) -> bool:
    member_id = db.scalar(
        select(ProjectMember.id).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    return member_id is not None


def _is_admin(user: User) -> bool:
    return user.role == UserRole.ADMIN


def _is_leader(project: Project, user: User) -> bool:
    return project.leader_id == user.id


def _ensure_can_view_execution(db: Session, project: Project, current_user: User) -> None:
    if _is_admin(current_user) or _is_leader(project, current_user):
        return
    if _is_project_member(db, project.id, current_user.id):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only project members can access project execution data.",
    )


def _ensure_project_execution_viewable(project: Project) -> None:
    if project.status not in {ProjectStatus.APPROVED, ProjectStatus.COMPLETED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project execution module is available only for approved or completed projects.",
        )


def _ensure_can_manage_execution(project: Project, current_user: User) -> None:
    if _is_admin(current_user) or _is_leader(project, current_user):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only project leader or admin can manage this execution module.",
    )


def _ensure_project_operational(project: Project) -> None:
    if project.status != ProjectStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This operation is only available when project status is approved.",
        )


def _sync_overdue_reports(db: Session, project_id: int) -> None:
    today = date.today()
    updated = False
    reports = list(
        db.scalars(
            select(ProjectPeriodicReport).where(
                ProjectPeriodicReport.project_id == project_id,
                ProjectPeriodicReport.due_date < today,
                ProjectPeriodicReport.status.in_([ProjectReportStatus.PENDING, ProjectReportStatus.SUBMITTED]),
            )
        )
    )
    for report in reports:
        report.status = ProjectReportStatus.OVERDUE
        updated = True

    if updated:
        db.commit()


def _ensure_assignee(db: Session, assignee_id: int) -> User:
    assignee = db.get(User, assignee_id)
    if not assignee or not assignee.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee must be an active user.")
    return assignee


def _ensure_participant_on_assignment(db: Session, project: Project, assignee_id: int) -> None:
    if assignee_id == project.leader_id:
        return

    if _is_project_member(db, project.id, assignee_id):
        return

    db.add(
        ProjectMember(
            project_id=project.id,
            user_id=assignee_id,
            role_in_project="member",
        )
    )


def _is_task_overdue(task: ProjectTask) -> bool:
    if not task.due_date:
        return False
    return task.due_date < date.today() and task.status != ProjectTaskStatus.DONE


def _is_report_overdue(report: ProjectPeriodicReport) -> bool:
    if report.status == ProjectReportStatus.OVERDUE:
        return True
    return report.due_date < date.today() and report.status in {ProjectReportStatus.PENDING, ProjectReportStatus.SUBMITTED}


def _task_out_payload(task: ProjectTask) -> dict:
    return {
        "id": task.id,
        "project_id": task.project_id,
        "title": task.title,
        "description": task.description,
        "assignee_id": task.assignee_id,
        "assignee_name": task.assignee.full_name if task.assignee else None,
        "due_date": task.due_date,
        "status": task.status.value,
        "submission_note": task.submission_note,
        "submitted_at": task.submitted_at,
        "review_note": task.review_note,
        "reviewed_by": task.reviewed_by,
        "reviewed_by_name": task.reviewer.full_name if task.reviewer else None,
        "reviewed_at": task.reviewed_at,
        "created_by": task.created_by,
        "created_by_name": task.creator.full_name if task.creator else None,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "is_overdue": _is_task_overdue(task),
    }


def _report_out_payload(report: ProjectPeriodicReport) -> dict:
    return {
        "id": report.id,
        "project_id": report.project_id,
        "title": report.title,
        "description": report.description,
        "due_date": report.due_date,
        "status": report.status.value,
        "submission_content": report.submission_content,
        "submitted_at": report.submitted_at,
        "submitted_by": report.submitted_by,
        "submitted_by_name": report.submitter.full_name if report.submitter else None,
        "review_note": report.review_note,
        "reviewed_by": report.reviewed_by,
        "reviewed_by_name": report.reviewer.full_name if report.reviewer else None,
        "reviewed_at": report.reviewed_at,
        "created_by": report.created_by,
        "created_by_name": report.creator.full_name if report.creator else None,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "is_overdue": _is_report_overdue(report),
    }


def _get_task(db: Session, project_id: int, task_id: int) -> ProjectTask:
    task = db.scalar(_task_query().where(ProjectTask.id == task_id, ProjectTask.project_id == project_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task


def _get_report(db: Session, project_id: int, report_id: int) -> ProjectPeriodicReport:
    report = db.scalar(_report_query().where(ProjectPeriodicReport.id == report_id, ProjectPeriodicReport.project_id == project_id))
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Periodic report not found.")
    return report


def get_execution_overview(db: Session, project_id: int, current_user: User) -> ExecutionOverviewOut:
    project = _get_project(db, project_id)
    _ensure_can_view_execution(db, project, current_user)
    _ensure_project_execution_viewable(project)

    _sync_overdue_reports(db, project_id)

    tasks = list(db.scalars(select(ProjectTask).where(ProjectTask.project_id == project_id)))
    reports = list(db.scalars(select(ProjectPeriodicReport).where(ProjectPeriodicReport.project_id == project_id)))

    total_tasks = len(tasks)
    done_tasks = len([task for task in tasks if task.status == ProjectTaskStatus.DONE])
    overdue_task_count = len([task for task in tasks if _is_task_overdue(task)])
    overdue_report_count = len([report for report in reports if _is_report_overdue(report)])

    progress_percent = floor(done_tasks / total_tasks * 100) if total_tasks > 0 else 0

    warning_messages: list[str] = []
    project_past_end_date = bool(
        project.status != ProjectStatus.COMPLETED and project.end_date and date.today() > project.end_date
    )

    if project_past_end_date:
        warning_messages.append("Project is past end date but has not been completed yet.")
    if overdue_task_count > 0:
        warning_messages.append(f"There are {overdue_task_count} overdue tasks.")
    if overdue_report_count > 0:
        warning_messages.append(f"There are {overdue_report_count} overdue periodic reports.")

    is_project_overdue = project_past_end_date or overdue_task_count > 0 or overdue_report_count > 0

    return ExecutionOverviewOut(
        project_id=project.id,
        total_tasks=total_tasks,
        done_tasks=done_tasks,
        progress_percent=progress_percent,
        overdue_task_count=overdue_task_count,
        overdue_report_count=overdue_report_count,
        is_project_overdue=is_project_overdue,
        warning_messages=warning_messages,
    )


def list_project_tasks(db: Session, project_id: int, current_user: User) -> list[dict]:
    project = _get_project(db, project_id)
    _ensure_can_view_execution(db, project, current_user)
    _ensure_project_execution_viewable(project)

    tasks = list(
        db.scalars(
            _task_query()
            .where(ProjectTask.project_id == project_id)
            .order_by(ProjectTask.id.desc())
        ).unique()
    )
    return [_task_out_payload(task) for task in tasks]


def create_project_task(db: Session, project_id: int, payload: TaskCreate, current_user: User) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_manage_execution(project, current_user)
    _ensure_project_operational(project)

    assignee_id = payload.assignee_id
    if assignee_id is not None:
        _ensure_assignee(db, assignee_id)
        _ensure_participant_on_assignment(db, project, assignee_id)

    task = ProjectTask(
        project_id=project_id,
        title=payload.title.strip(),
        description=payload.description,
        assignee_id=assignee_id,
        due_date=payload.due_date,
        status=ProjectTaskStatus.TODO,
        created_by=current_user.id,
    )
    db.add(task)
    db.commit()
    return _task_out_payload(_get_task(db, project_id=project_id, task_id=task.id))


def update_project_task(
    db: Session,
    project_id: int,
    task_id: int,
    payload: TaskUpdate,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_manage_execution(project, current_user)
    _ensure_project_operational(project)

    task = _get_task(db, project_id, task_id)
    if task.status == ProjectTaskStatus.DONE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Completed task cannot be edited.")

    values = payload.model_dump(exclude_unset=True)
    if "assignee_id" in values and values["assignee_id"] is not None:
        _ensure_assignee(db, values["assignee_id"])
        _ensure_participant_on_assignment(db, project, values["assignee_id"])

    for field, value in values.items():
        setattr(task, field, value)

    db.commit()
    return _task_out_payload(_get_task(db, project_id=project_id, task_id=task_id))


def submit_project_task(
    db: Session,
    project_id: int,
    task_id: int,
    payload: TaskSubmitRequest,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_view_execution(db, project, current_user)
    _ensure_project_operational(project)

    task = _get_task(db, project_id, task_id)

    is_assignee = task.assignee_id == current_user.id
    if not (_is_admin(current_user) or _is_leader(project, current_user) or is_assignee):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only assignee, project leader, or admin can submit this task.",
        )

    if task.status not in {ProjectTaskStatus.TODO, ProjectTaskStatus.REJECTED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task can only be submitted from todo or rejected status.",
        )

    task.status = ProjectTaskStatus.IN_REVIEW
    task.submission_note = payload.submission_note
    task.submitted_at = datetime.now(timezone.utc)
    task.review_note = None
    task.reviewed_by = None
    task.reviewed_at = None

    db.commit()
    return _task_out_payload(_get_task(db, project_id=project_id, task_id=task_id))


def review_project_task(
    db: Session,
    project_id: int,
    task_id: int,
    payload: TaskReviewRequest,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_manage_execution(project, current_user)
    _ensure_project_operational(project)

    task = _get_task(db, project_id, task_id)
    if task.status != ProjectTaskStatus.IN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only in_review task can be approved or rejected.",
        )

    if payload.action == "approve":
        task.status = ProjectTaskStatus.DONE
    else:
        task.status = ProjectTaskStatus.REJECTED

    task.review_note = payload.note
    task.reviewed_by = current_user.id
    task.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    return _task_out_payload(_get_task(db, project_id=project_id, task_id=task_id))


def list_periodic_reports(db: Session, project_id: int, current_user: User) -> list[dict]:
    project = _get_project(db, project_id)
    _ensure_can_view_execution(db, project, current_user)
    _ensure_project_execution_viewable(project)

    _sync_overdue_reports(db, project_id)

    reports = list(
        db.scalars(
            _report_query()
            .where(ProjectPeriodicReport.project_id == project_id)
            .order_by(ProjectPeriodicReport.due_date.asc(), ProjectPeriodicReport.id.asc())
        ).unique()
    )
    return [_report_out_payload(report) for report in reports]


def create_periodic_report(
    db: Session,
    project_id: int,
    payload: ReportCreate,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_manage_execution(project, current_user)
    _ensure_project_operational(project)

    report = ProjectPeriodicReport(
        project_id=project_id,
        title=payload.title.strip(),
        description=payload.description,
        due_date=payload.due_date,
        status=ProjectReportStatus.PENDING,
        created_by=current_user.id,
    )
    db.add(report)
    db.commit()
    return _report_out_payload(_get_report(db, project_id=project_id, report_id=report.id))


def submit_periodic_report(
    db: Session,
    project_id: int,
    report_id: int,
    payload: ReportSubmitRequest,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_view_execution(db, project, current_user)
    _ensure_project_operational(project)

    if not (
        _is_admin(current_user)
        or _is_leader(project, current_user)
        or _is_project_member(db, project_id=project.id, user_id=current_user.id)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project participants can submit periodic reports.",
        )

    report = _get_report(db, project_id, report_id)
    if report.status not in {
        ProjectReportStatus.PENDING,
        ProjectReportStatus.REJECTED,
        ProjectReportStatus.OVERDUE,
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Periodic report can only be submitted from pending/rejected/overdue status.",
        )

    report.status = ProjectReportStatus.SUBMITTED
    report.submission_content = payload.content.strip()
    report.submitted_at = datetime.now(timezone.utc)
    report.submitted_by = current_user.id
    report.review_note = None
    report.reviewed_by = None
    report.reviewed_at = None

    db.commit()
    return _report_out_payload(_get_report(db, project_id=project_id, report_id=report_id))


def review_periodic_report(
    db: Session,
    project_id: int,
    report_id: int,
    payload: ReportReviewRequest,
    current_user: User,
) -> dict:
    project = _get_project(db, project_id)
    _ensure_can_manage_execution(project, current_user)
    _ensure_project_operational(project)

    report = _get_report(db, project_id, report_id)
    if report.status not in {ProjectReportStatus.SUBMITTED, ProjectReportStatus.OVERDUE}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted or overdue report can be approved/rejected.",
        )

    if payload.action == "approve":
        report.status = ProjectReportStatus.APPROVED
    else:
        report.status = ProjectReportStatus.REJECTED

    report.review_note = payload.note
    report.reviewed_by = current_user.id
    report.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    return _report_out_payload(_get_report(db, project_id=project_id, report_id=report_id))

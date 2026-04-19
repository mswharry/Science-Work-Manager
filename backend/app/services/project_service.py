from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.constants import CategoryType, PROJECT_STATUS_VALUES, ProjectStatus, UserRole
from app.models.association import ProjectMember
from app.models.category import Category
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectReviewRequest, ProjectUpdate
from app.services.upload_service import delete_local_upload


PROJECT_CREATE_FORBIDDEN_MESSAGE = "Only lecturers can create projects."
PROJECT_REQUEST_COMPLETE_FORBIDDEN = "Only project leader can request project completion."
PROJECT_REQUEST_COMPLETE_STATUS = "Only approved projects can request completion confirmation."
PROJECT_REQUEST_COMPLETE_DUPLICATE = "Completion confirmation has already been requested for this project."
PROJECT_COMPLETE_REQUEST_REQUIRED = "Only approved projects with completion request can be completed."


def _validate_project_status(status_value: str) -> ProjectStatus:
    if status_value not in PROJECT_STATUS_VALUES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project status.")
    return ProjectStatus(status_value)



def _project_query() -> Select[tuple[Project]]:
    return select(Project).options(
        joinedload(Project.category),
        joinedload(Project.leader),
        joinedload(Project.reviewer),
        joinedload(Project.completion_requester),
    )



def _decorate_project(project: Project) -> Project:
    project.category_name = project.category.name if project.category else None
    project.leader_name = project.leader.full_name if project.leader else None
    project.leader_email = project.leader.email if project.leader else None
    project.reviewed_by_name = project.reviewer.full_name if project.reviewer else None
    project.completion_requested_by_name = project.completion_requester.full_name if project.completion_requester else None
    return project



def _decorate_projects(projects: list[Project]) -> list[Project]:
    return [_decorate_project(project) for project in projects]



def _is_project_owner_stmt(user_id: int):
    return or_(
        Project.leader_id == user_id,
        select(ProjectMember.id).where(ProjectMember.project_id == Project.id, ProjectMember.user_id == user_id).exists(),
    )



def _ensure_project_category(db: Session, category_id: int) -> None:
    category = db.get(Category, category_id)
    if not category or category.type != CategoryType.PROJECT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="category_id must belong to a project_type category.",
        )



def _validate_project_dates(start_date, end_date) -> None:
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be greater than or equal to start_date.",
        )



def create_project(db: Session, payload: ProjectCreate, current_user: User) -> Project:
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=PROJECT_CREATE_FORBIDDEN_MESSAGE,
        )

    _ensure_project_category(db, payload.category_id)
    _validate_project_dates(payload.start_date, payload.end_date)

    project = Project(
        name=payload.name.strip(),
        category_id=payload.category_id,
        leader_id=current_user.id,
        budget=payload.budget,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=ProjectStatus.PENDING,
        description=payload.description,
        proposal_file=payload.proposal_file,
        final_report_file=payload.final_report_file,
    )
    db.add(project)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create project.") from exc

    return get_project_by_id(db=db, project_id=project.id)



def list_projects(
    db: Session,
    current_user: User,
    status_filter: str | None = None,
    year: int | None = None,
    keyword: str | None = None,
    mine: bool | None = None,
    completion_requested: bool | None = None,
) -> list[Project]:
    stmt: Select[tuple[Project]] = _project_query().order_by(Project.id.desc())
    is_admin = current_user.role == UserRole.ADMIN
    owner_condition = _is_project_owner_stmt(current_user.id)

    if not is_admin:
        stmt = stmt.where(
            or_(
                Project.status.in_([ProjectStatus.APPROVED, ProjectStatus.COMPLETED]),
                owner_condition,
            )
        )

    if status_filter:
        stmt = stmt.where(Project.status == _validate_project_status(status_filter))

    if year is not None:
        stmt = stmt.where(func.strftime("%Y", Project.start_date) == str(year))

    if keyword:
        keyword_like = f"%{keyword.strip()}%"
        stmt = stmt.where(or_(Project.name.ilike(keyword_like), Project.description.ilike(keyword_like)))

    if mine:
        stmt = stmt.where(owner_condition)

    if completion_requested is not None:
        stmt = stmt.where(Project.completion_requested == completion_requested)

    projects = list(db.scalars(stmt).unique())
    return _decorate_projects(projects)



def get_project_by_id(db: Session, project_id: int) -> Project:
    project = db.scalar(_project_query().where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return _decorate_project(project)



def _can_view_project(project: Project, current_user: User, db: Session) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if project.status in {ProjectStatus.APPROVED, ProjectStatus.COMPLETED}:
        return True
    if project.leader_id == current_user.id:
        return True

    member_exists = db.scalar(
        select(ProjectMember.id).where(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == current_user.id,
        )
    )
    return member_exists is not None



def get_project_detail(db: Session, project_id: int, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if not _can_view_project(project, current_user, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view this project.")
    return project



def _ensure_project_editable(project: Project, current_user: User) -> None:
    if project.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project leader can modify this project.")
    if project.status not in {ProjectStatus.PENDING, ProjectStatus.REJECTED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project can only be modified when status is pending or rejected.",
        )



def update_project(db: Session, project_id: int, payload: ProjectUpdate, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    _ensure_project_editable(project, current_user)

    values = payload.model_dump(exclude_unset=True)
    if "category_id" in values and values["category_id"] is not None:
        _ensure_project_category(db, values["category_id"])

    start_date = values.get("start_date", project.start_date)
    end_date = values.get("end_date", project.end_date)
    _validate_project_dates(start_date, end_date)

    if "proposal_file" in values and values["proposal_file"] != project.proposal_file:
        delete_local_upload(project.proposal_file)
    if "final_report_file" in values and values["final_report_file"] != project.final_report_file:
        delete_local_upload(project.final_report_file)

    for field, value in values.items():
        setattr(project, field, value)

    if project.status == ProjectStatus.REJECTED:
        project.status = ProjectStatus.PENDING
        project.review_note = None
        project.reviewed_by = None
        project.reviewed_at = None
        project.completion_requested = False
        project.completion_requested_at = None
        project.completion_requested_by = None

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update project.") from exc

    return get_project_by_id(db=db, project_id=project.id)



def delete_project(db: Session, project_id: int, current_user: User) -> None:
    project = get_project_by_id(db, project_id)
    _ensure_project_editable(project, current_user)
    delete_local_upload(project.proposal_file)
    delete_local_upload(project.final_report_file)
    db.delete(project)
    db.commit()



def review_project(db: Session, project_id: int, payload: ProjectReviewRequest, admin_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if project.status != ProjectStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending projects can be reviewed.")

    action = payload.action.lower().strip()
    if action == "approve":
        project.status = ProjectStatus.APPROVED
    elif action == "reject":
        project.status = ProjectStatus.REJECTED
        project.completion_requested = False
        project.completion_requested_at = None
        project.completion_requested_by = None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be approve or reject.")

    project.review_note = payload.note
    project.reviewed_by = admin_user.id
    project.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)



def request_project_completion(db: Session, project_id: int, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if project.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PROJECT_REQUEST_COMPLETE_FORBIDDEN)
    if project.status != ProjectStatus.APPROVED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REQUEST_COMPLETE_STATUS)
    if project.completion_requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REQUEST_COMPLETE_DUPLICATE)

    project.completion_requested = True
    project.completion_requested_at = datetime.now(timezone.utc)
    project.completion_requested_by = current_user.id
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)



def complete_project(db: Session, project_id: int) -> Project:
    project = get_project_by_id(db, project_id)
    if project.status != ProjectStatus.APPROVED or not project.completion_requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_COMPLETE_REQUEST_REQUIRED)

    project.status = ProjectStatus.COMPLETED
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)

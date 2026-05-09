from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.constants import CategoryType, PROJECT_STATUS_VALUES, ProjectStatus, UserRole
from app.models.category import Category
from app.models.project_history import ExecutionHistory, RegistrationHistory
from app.models.project import Project
from app.models.registration_period import RegistrationPeriod
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectReviewRequest, ProjectSubmitRequest, ProjectUpdate
from app.services.registration_period_service import get_registration_period
from app.services.upload_service import delete_local_upload


PROJECT_CREATE_FORBIDDEN_MESSAGE = "Chỉ giảng viên mới được tạo hồ sơ đăng ký đề tài."
PROJECT_EDIT_FORBIDDEN_MESSAGE = "Chỉ chủ nhiệm hồ sơ mới được phép chỉnh sửa hồ sơ này."
PROJECT_EDIT_STATUS_MESSAGE = "Chỉ có thể chỉnh sửa hồ sơ ở trạng thái nháp."
PROJECT_SUBMIT_STATUS_MESSAGE = "Chỉ có thể nộp hồ sơ ở trạng thái nháp."
PROJECT_CANCEL_STATUS_MESSAGE = "Chỉ có thể hủy hồ sơ ở trạng thái nháp hoặc đã nộp."
PROJECT_PROPOSAL_REQUIRED = "Vui lòng đính kèm tệp đề cương đề tài."
PROJECT_REGISTRATION_PERIOD_REQUIRED = "Vui lòng chọn đợt đăng ký."
PROJECT_REGISTRATION_PERIOD_CLOSED = "Đợt đăng ký đã chọn hiện không còn mở."

PROJECT_HISTORY_CREATE = "create"
PROJECT_HISTORY_UPDATE = "update"
PROJECT_HISTORY_SUBMIT = "submit"
PROJECT_HISTORY_CANCEL = "cancel"
PROJECT_HISTORY_REVIEW = "review"
PROJECT_HISTORY_COMPLETE = "complete"
PROJECT_HISTORY_REQUEST_COMPLETION = "request_completion"
PROJECT_REQUEST_COMPLETE_FORBIDDEN = "Chỉ chủ nhiệm hồ sơ mới được gửi yêu cầu xác nhận hoàn thành."
PROJECT_REQUEST_COMPLETE_STATUS = "Chỉ hồ sơ đã được duyệt mới có thể gửi yêu cầu xác nhận hoàn thành."
PROJECT_REQUEST_COMPLETE_DUPLICATE = "Hồ sơ này đã được gửi yêu cầu xác nhận hoàn thành trước đó."
PROJECT_COMPLETE_REQUEST_REQUIRED = "Chỉ hồ sơ đã được duyệt và đã gửi yêu cầu xác nhận hoàn thành mới có thể được đánh dấu hoàn thành."


def _validate_project_status(status_value: str) -> ProjectStatus:
    if status_value not in PROJECT_STATUS_VALUES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái hồ sơ không hợp lệ.")
    return ProjectStatus(status_value)



def _project_query() -> Select[tuple[Project]]:
    return select(Project).options(
        joinedload(Project.category),
        joinedload(Project.level),
        joinedload(Project.leader),
        joinedload(Project.registration_period),
        joinedload(Project.reviewer),
        joinedload(Project.completion_requester),
    )



def _decorate_project(project: Project) -> Project:
    project.category_name = project.category.name if project.category else None
    project.level_name = project.level.name if project.level else None
    project.level_code = project.level.code if project.level else None
    project.leader_name = project.leader.full_name if project.leader else None
    project.leader_email = project.leader.email if project.leader else None
    project.registration_period_name = project.registration_period.title if project.registration_period else None
    project.reviewed_by_name = project.reviewer.full_name if project.reviewer else None
    project.completion_requested_by_name = project.completion_requester.full_name if project.completion_requester else None
    return project



def _decorate_projects(projects: list[Project]) -> list[Project]:
    return [_decorate_project(project) for project in projects]


def _registration_history_query() -> Select[tuple[RegistrationHistory]]:
    return select(RegistrationHistory).options(joinedload(RegistrationHistory.performer))


def _execution_history_query() -> Select[tuple[ExecutionHistory]]:
    return select(ExecutionHistory).options(joinedload(ExecutionHistory.performer))


def _decorate_registration_history(history: RegistrationHistory) -> RegistrationHistory:
    history.performed_by_name = history.performer.full_name if history.performer else None
    return history


def _decorate_execution_history(history: ExecutionHistory) -> ExecutionHistory:
    history.performed_by_name = history.performer.full_name if history.performer else None
    return history


def _decorate_registration_histories(histories: list[RegistrationHistory]) -> list[RegistrationHistory]:
    return [_decorate_registration_history(history) for history in histories]


def _decorate_execution_histories(histories: list[ExecutionHistory]) -> list[ExecutionHistory]:
    return [_decorate_execution_history(history) for history in histories]


def _project_status_value(value: ProjectStatus | str | None) -> str | None:
    if value is None:
        return None
    return value.value if hasattr(value, "value") else str(value)


def _record_registration_history(
    db: Session,
    project: Project,
    action: str,
    detail: str | None,
    current_user: User | None,
    previous_status: ProjectStatus | str | None = None,
    new_status: ProjectStatus | str | None = None,
) -> None:
    db.add(
        RegistrationHistory(
            project_id=project.id,
            action=action,
            detail=detail,
            previous_status=_project_status_value(previous_status),
            new_status=_project_status_value(new_status),
            performed_by=current_user.id if current_user else None,
        )
    )


def _record_execution_history(
    db: Session,
    project: Project,
    action: str,
    detail: str | None,
    current_user: User | None,
    previous_status: ProjectStatus | str | None = None,
    new_status: ProjectStatus | str | None = None,
) -> None:
    db.add(
        ExecutionHistory(
            project_id=project.id,
            action=action,
            detail=detail,
            previous_status=_project_status_value(previous_status),
            new_status=_project_status_value(new_status),
            performed_by=current_user.id if current_user else None,
        )
    )


def _review_action_detail(action: str) -> str:
    if action == "approve":
        return "Đề tài đã được quản trị viên phê duyệt."
    if action == "reject":
        return "Đề tài đã bị quản trị viên từ chối."
    return "Đề tài đã được quản trị viên xem xét."


def _project_is_editable(project: Project, current_user: User) -> bool:
    return project.leader_id == current_user.id and project.status == ProjectStatus.DRAFT


def _project_can_be_canceled(project: Project, current_user: User) -> bool:
    return project.leader_id == current_user.id and project.status in {ProjectStatus.DRAFT, ProjectStatus.SUBMITTED}


def _validate_registration_period(db: Session, registration_period_id: int | None) -> RegistrationPeriod | None:
    if registration_period_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REGISTRATION_PERIOD_REQUIRED)
    period = get_registration_period(db, registration_period_id)
    if not period.is_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REGISTRATION_PERIOD_CLOSED)
    return period



def _ensure_project_category(db: Session, category_id: int) -> None:
    category = db.get(Category, category_id)
    if not category or category.type != CategoryType.PROJECT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục đề tài không hợp lệ. Vui lòng chọn một danh mục thuộc nhóm đề tài.",
        )



def _validate_project_dates(start_date, end_date) -> None:
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.",
        )



def create_project(db: Session, payload: ProjectCreate, current_user: User) -> Project:
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=PROJECT_CREATE_FORBIDDEN_MESSAGE,
        )

    _ensure_project_category(db, payload.category_id)
    _validate_project_dates(payload.start_date, payload.end_date)
    period = _validate_registration_period(db, payload.registration_period_id)
    if not payload.proposal_file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_PROPOSAL_REQUIRED)

    project = Project(
        name=payload.name.strip(),
        category_id=payload.category_id,
        level_id=payload.level_id,
        leader_id=current_user.id,
        registration_period_id=period.id if period else None,
        budget=payload.budget,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=ProjectStatus.DRAFT,
        description=payload.description,
        proposal_file=payload.proposal_file,
        final_report_file=payload.final_report_file,
    )
    db.add(project)

    try:
        db.flush()
        _record_registration_history(
            db=db,
            project=project,
            action=PROJECT_HISTORY_CREATE,
            detail="Đã tạo mới hồ sơ đề tài.",
            current_user=current_user,
            new_status=project.status,
        )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể tạo hồ sơ đăng ký đề tài.") from exc

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
    if current_user.role not in {UserRole.ADMIN, UserRole.LECTURER}:
        return []

    if not is_admin:
        stmt = stmt.where(Project.leader_id == current_user.id)

    if status_filter:
        stmt = stmt.where(Project.status == _validate_project_status(status_filter))

    if year is not None:
        stmt = stmt.where(func.strftime("%Y", Project.start_date) == str(year))

    if keyword:
        keyword_like = f"%{keyword.strip()}%"
        stmt = stmt.where(or_(Project.name.ilike(keyword_like), Project.description.ilike(keyword_like)))

    if mine:
        stmt = stmt.where(Project.leader_id == current_user.id)

    if completion_requested is not None:
        stmt = stmt.where(Project.completion_requested == completion_requested)

    projects = list(db.scalars(stmt).unique())
    return _decorate_projects(projects)



def get_project_by_id(db: Session, project_id: int) -> Project:
    project = db.scalar(_project_query().where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy hồ sơ đề tài.")
    return _decorate_project(project)



def _can_view_project(project: Project, current_user: User, db: Session) -> bool:
    if current_user.role == UserRole.LECTURER and project.leader_id == current_user.id:
        return True
    if current_user.role == UserRole.ADMIN and project.status in {ProjectStatus.APPROVED, ProjectStatus.COMPLETED}:
        return True
    return False



def get_project_detail(db: Session, project_id: int, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if not _can_view_project(project, current_user, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xem hồ sơ đề tài này.")
    return project


def list_registration_history(db: Session, project_id: int, current_user: User) -> list[RegistrationHistory]:
    _ = get_project_detail(db=db, project_id=project_id, current_user=current_user)
    stmt = (
        _registration_history_query()
        .where(RegistrationHistory.project_id == project_id)
        .order_by(RegistrationHistory.created_at.desc())
    )
    histories = list(db.scalars(stmt).unique())
    return _decorate_registration_histories(histories)


def list_execution_history(db: Session, project_id: int, current_user: User) -> list[ExecutionHistory]:
    _ = get_project_detail(db=db, project_id=project_id, current_user=current_user)
    stmt = _execution_history_query().where(ExecutionHistory.project_id == project_id).order_by(
        ExecutionHistory.created_at.desc()
    )
    histories = list(db.scalars(stmt).unique())
    return _decorate_execution_histories(histories)



def _ensure_project_editable(project: Project, current_user: User) -> None:
    if not _project_is_editable(project, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PROJECT_EDIT_FORBIDDEN_MESSAGE)



def update_project(db: Session, project_id: int, payload: ProjectUpdate, current_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    _ensure_project_editable(project, current_user)
    previous_status = project.status

    values = payload.model_dump(exclude_unset=True)
    if "category_id" in values and values["category_id"] is not None:
        _ensure_project_category(db, values["category_id"])
    if "registration_period_id" in values and values["registration_period_id"] is not None:
        period = _validate_registration_period(db, values["registration_period_id"])
        values["registration_period_id"] = period.id

    start_date = values.get("start_date", project.start_date)
    end_date = values.get("end_date", project.end_date)
    _validate_project_dates(start_date, end_date)

    if "proposal_file" in values and values["proposal_file"] != project.proposal_file:
        delete_local_upload(project.proposal_file)
    if "final_report_file" in values and values["final_report_file"] != project.final_report_file:
        delete_local_upload(project.final_report_file)

    for field, value in values.items():
        setattr(project, field, value)

    _record_registration_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_UPDATE,
        detail="Đã cập nhật thông tin đề tài.",
        current_user=current_user,
        previous_status=previous_status,
        new_status=project.status,
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể cập nhật hồ sơ đề tài.") from exc

    return get_project_by_id(db=db, project_id=project.id)



def delete_project(db: Session, project_id: int, current_user: User) -> None:
    project = get_project_by_id(db, project_id)
    if not _project_can_be_canceled(project, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ chủ nhiệm hồ sơ mới được phép hủy hồ sơ này.")
    previous_status = project.status
    project.status = ProjectStatus.CANCELED
    project.canceled_at = datetime.now(timezone.utc)
    _record_registration_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_CANCEL,
        detail="Đã hủy hồ sơ đề tài.",
        current_user=current_user,
        previous_status=previous_status,
        new_status=project.status,
    )
    db.commit()


def submit_project(db: Session, project_id: int, current_user: User, payload: ProjectSubmitRequest | None = None) -> Project:
    project = get_project_by_id(db, project_id)
    if project.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PROJECT_EDIT_FORBIDDEN_MESSAGE)
    if project.status != ProjectStatus.DRAFT:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_SUBMIT_STATUS_MESSAGE)
    if not project.registration_period_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REGISTRATION_PERIOD_REQUIRED)
    period = get_registration_period(db, project.registration_period_id)
    if not period.is_open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_REGISTRATION_PERIOD_CLOSED)
    if not project.proposal_file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_PROPOSAL_REQUIRED)

    project.status = ProjectStatus.SUBMITTED
    project.submitted_at = datetime.now(timezone.utc)
    _record_registration_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_SUBMIT,
        detail=payload.note if payload and payload.note else "Đã nộp hồ sơ đăng ký đề tài.",
        current_user=current_user,
        previous_status=ProjectStatus.DRAFT,
        new_status=project.status,
    )
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)



def review_project(db: Session, project_id: int, payload: ProjectReviewRequest, admin_user: User) -> Project:
    project = get_project_by_id(db, project_id)
    if project.status != ProjectStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ có thể duyệt các hồ sơ đang chờ duyệt.")

    action = payload.action.lower().strip()
    previous_status = project.status
    if action == "approve":
        project.status = ProjectStatus.APPROVED
    elif action == "reject":
        project.status = ProjectStatus.REJECTED
        project.completion_requested = False
        project.completion_requested_at = None
        project.completion_requested_by = None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hành động không hợp lệ. Vui lòng chọn phê duyệt hoặc từ chối.")

    project.review_note = payload.note
    project.reviewed_by = admin_user.id
    project.reviewed_at = datetime.now(timezone.utc)
    _record_registration_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_REVIEW,
        detail=_review_action_detail(action),
        current_user=admin_user,
        previous_status=previous_status,
        new_status=project.status,
    )
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
    _record_execution_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_REQUEST_COMPLETION,
        detail="Đã gửi yêu cầu xác nhận hoàn thành.",
        current_user=current_user,
        previous_status=project.status,
        new_status=project.status,
    )
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)



def complete_project(db: Session, project_id: int, admin_user: User | None = None) -> Project:
    project = get_project_by_id(db, project_id)
    if project.status != ProjectStatus.APPROVED or not project.completion_requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=PROJECT_COMPLETE_REQUEST_REQUIRED)

    previous_status = project.status
    project.status = ProjectStatus.COMPLETED
    _record_execution_history(
        db=db,
        project=project,
        action=PROJECT_HISTORY_COMPLETE,
        detail="Đề tài đã được đánh dấu hoàn thành.",
        current_user=admin_user,
        previous_status=previous_status,
        new_status=project.status,
    )
    db.commit()
    return get_project_by_id(db=db, project_id=project.id)

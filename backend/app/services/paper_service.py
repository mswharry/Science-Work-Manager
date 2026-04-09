from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import Select, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import CategoryType, PAPER_STATUS_VALUES, PaperStatus, UserRole
from app.models.association import PaperAuthor
from app.models.category import Category
from app.models.paper import Paper
from app.models.user import User
from app.schemas.paper import AddAuthorRequest, PaperCreate, PaperReviewRequest, PaperUpdate
from app.services.upload_service import delete_local_upload


SUPERVISOR_REQUIRED_MESSAGE = "Student paper requires a supervising lecturer."
SUPERVISOR_INVALID_MESSAGE = "supervisor_lecturer_id must reference an active approved lecturer."
SUPERVISOR_NOT_FOUND_MESSAGE = "Supervisor lecturer not found."


def _validate_paper_status(status_value: str) -> PaperStatus:
    if status_value not in PAPER_STATUS_VALUES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid paper status.")
    return PaperStatus(status_value)



def _is_paper_author_stmt(user_id: int):
    return select(PaperAuthor.id).where(PaperAuthor.paper_id == Paper.id, PaperAuthor.user_id == user_id).exists()



def _ensure_paper_category(db: Session, category_id: int) -> None:
    category = db.get(Category, category_id)
    if not category or category.type != CategoryType.PAPER_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="category_id must belong to a paper_type category.",
        )



def _resolve_supervisor_lecturer(db: Session, supervisor_lecturer_id: int | None) -> User | None:
    if supervisor_lecturer_id is None:
        return None

    lecturer = db.get(User, supervisor_lecturer_id)
    if not lecturer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SUPERVISOR_NOT_FOUND_MESSAGE)

    if lecturer.role != UserRole.LECTURER or not lecturer.is_active or not lecturer.is_approved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=SUPERVISOR_INVALID_MESSAGE)

    return lecturer



def _apply_supervisor_snapshot(paper: Paper, lecturer: User | None) -> None:
    if lecturer is None:
        paper.supervisor_lecturer_id = None
        paper.supervisor_full_name = None
        paper.supervisor_email = None
        paper.supervisor_staff_id = None
        paper.supervisor_department = None
        return

    paper.supervisor_lecturer_id = lecturer.id
    paper.supervisor_full_name = lecturer.full_name
    paper.supervisor_email = lecturer.email
    paper.supervisor_staff_id = lecturer.staff_id
    paper.supervisor_department = lecturer.department



def create_paper(db: Session, payload: PaperCreate, current_user: User) -> Paper:
    _ensure_paper_category(db, payload.category_id)

    if current_user.role == UserRole.STUDENT and payload.supervisor_lecturer_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=SUPERVISOR_REQUIRED_MESSAGE)

    supervisor = _resolve_supervisor_lecturer(db, payload.supervisor_lecturer_id)

    try:
        paper = Paper(
            title=payload.title.strip(),
            category_id=payload.category_id,
            journal_name=payload.journal_name,
            publication_year=payload.publication_year,
            volume=payload.volume,
            issue=payload.issue,
            pages=payload.pages,
            doi=payload.doi,
            file_url=payload.file_url,
            status=PaperStatus.PENDING,
        )
        _apply_supervisor_snapshot(paper, supervisor)
        db.add(paper)
        db.flush()

        db.add(
            PaperAuthor(
                paper_id=paper.id,
                user_id=current_user.id,
                author_order=1,
                is_corresponding=True,
            )
        )

        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create paper.") from exc

    db.refresh(paper)
    return paper



def list_papers(
    db: Session,
    current_user: User,
    year: int | None = None,
    category_id: int | None = None,
    status_filter: str | None = None,
    mine: bool | None = None,
) -> list[Paper]:
    stmt: Select[tuple[Paper]] = select(Paper).order_by(Paper.id.desc())
    is_admin = current_user.role == UserRole.ADMIN
    author_condition = _is_paper_author_stmt(current_user.id)

    if not is_admin:
        stmt = stmt.where(or_(Paper.status == PaperStatus.APPROVED, author_condition))

    if year is not None:
        stmt = stmt.where(Paper.publication_year == year)

    if category_id is not None:
        stmt = stmt.where(Paper.category_id == category_id)

    if status_filter:
        stmt = stmt.where(Paper.status == _validate_paper_status(status_filter))

    if mine:
        stmt = stmt.where(author_condition)

    return list(db.scalars(stmt))



def get_paper_by_id(db: Session, paper_id: int) -> Paper:
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    return paper



def _can_view_paper(db: Session, paper: Paper, current_user: User) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if paper.status == PaperStatus.APPROVED:
        return True
    is_author = db.scalar(select(PaperAuthor.id).where(PaperAuthor.paper_id == paper.id, PaperAuthor.user_id == current_user.id))
    return is_author is not None



def get_paper_detail(db: Session, paper_id: int, current_user: User) -> Paper:
    paper = get_paper_by_id(db, paper_id)
    if not _can_view_paper(db, paper, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view this paper.")
    return paper



def _ensure_paper_editable(db: Session, paper: Paper, current_user: User) -> None:
    is_author = db.scalar(select(PaperAuthor.id).where(PaperAuthor.paper_id == paper.id, PaperAuthor.user_id == current_user.id))
    if not is_author:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only paper author can modify this paper.")

    if paper.status not in {PaperStatus.PENDING, PaperStatus.REJECTED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paper can only be modified when status is pending or rejected.",
        )



def update_paper(db: Session, paper_id: int, payload: PaperUpdate, current_user: User) -> Paper:
    paper = get_paper_by_id(db, paper_id)
    _ensure_paper_editable(db, paper, current_user)

    values = payload.model_dump(exclude_unset=True)
    if "category_id" in values and values["category_id"] is not None:
        _ensure_paper_category(db, values["category_id"])

    if "file_url" in values and values["file_url"] != paper.file_url:
        delete_local_upload(paper.file_url)

    supervisor_changed = "supervisor_lecturer_id" in values
    supervisor_id = values.get("supervisor_lecturer_id", paper.supervisor_lecturer_id)

    if current_user.role == UserRole.STUDENT and supervisor_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=SUPERVISOR_REQUIRED_MESSAGE)

    if supervisor_changed:
        supervisor = _resolve_supervisor_lecturer(db, values["supervisor_lecturer_id"])
        _apply_supervisor_snapshot(paper, supervisor)

    for field, value in values.items():
        if field == "supervisor_lecturer_id":
            continue
        setattr(paper, field, value)

    if paper.status == PaperStatus.REJECTED:
        paper.status = PaperStatus.PENDING
        paper.review_note = None
        paper.reviewed_by = None
        paper.reviewed_at = None

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update paper.") from exc

    db.refresh(paper)
    return paper



def delete_paper(db: Session, paper_id: int, current_user: User) -> None:
    paper = get_paper_by_id(db, paper_id)
    _ensure_paper_editable(db, paper, current_user)
    delete_local_upload(paper.file_url)
    db.delete(paper)
    db.commit()



def review_paper(db: Session, paper_id: int, payload: PaperReviewRequest, admin_user: User) -> Paper:
    paper = get_paper_by_id(db, paper_id)
    if paper.status != PaperStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending papers can be reviewed.")

    action = payload.action.lower().strip()
    if action == "approve":
        paper.status = PaperStatus.APPROVED
    elif action == "reject":
        paper.status = PaperStatus.REJECTED
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be approve or reject.")

    paper.review_note = payload.note
    paper.reviewed_by = admin_user.id
    paper.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(paper)
    return paper



def add_paper_author(db: Session, paper_id: int, payload: AddAuthorRequest, current_user: User) -> None:
    paper = get_paper_by_id(db, paper_id)

    owner_is_current_user = db.scalar(
        select(PaperAuthor.id).where(
            PaperAuthor.paper_id == paper.id,
            PaperAuthor.user_id == current_user.id,
            PaperAuthor.author_order == 1,
        )
    )
    if current_user.role != UserRole.ADMIN and not owner_is_current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only paper creator or admin can add authors.",
        )

    user_exists = db.get(User, payload.user_id)
    if not user_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author user not found.")

    duplicate = db.scalar(
        select(PaperAuthor.id).where(PaperAuthor.paper_id == paper.id, PaperAuthor.user_id == payload.user_id)
    )
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This user is already an author of the paper.")

    db.add(
        PaperAuthor(
            paper_id=paper.id,
            user_id=payload.user_id,
            author_order=payload.author_order,
            is_corresponding=payload.is_corresponding,
        )
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add paper author.") from exc

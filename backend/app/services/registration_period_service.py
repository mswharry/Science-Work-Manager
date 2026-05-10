from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.models.project import Project
from app.models.registration_period import RegistrationPeriod
from app.models.user import User
from app.schemas.registration_period import RegistrationPeriodCreate, RegistrationPeriodUpdate

REGISTRATION_PERIOD_NOT_FOUND = "Registration period not found."
REGISTRATION_PERIOD_FORBIDDEN = "Only admin can manage registration periods."
REGISTRATION_PERIOD_DATE_INVALID = "registration_start must be before or equal to registration_end."
REGISTRATION_PERIOD_DELETE_FORBIDDEN = "Cannot delete this registration period because it is being used by projects."


def _ensure_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=REGISTRATION_PERIOD_FORBIDDEN)


def _validate_dates(registration_start: date | None, registration_end: date | None) -> None:
    if registration_start and registration_end and registration_end < registration_start:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=REGISTRATION_PERIOD_DATE_INVALID)


def _maybe_activate_period(period: RegistrationPeriod, is_open: bool | None) -> None:
    if is_open is True:
        period.is_open = True
    elif is_open is False:
        period.is_open = False


def _ensure_not_in_use(db: Session, period_id: int) -> None:
    project_exists = db.scalar(select(func.count(Project.id)).where(Project.registration_period_id == period_id))
    if project_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=REGISTRATION_PERIOD_DELETE_FORBIDDEN)


def _period_query(keyword: str | None = None, year: int | None = None) -> Select[tuple[RegistrationPeriod]]:
    stmt = select(RegistrationPeriod)
    if keyword:
        keyword_like = f"%{keyword.strip()}%"
        stmt = stmt.where(
            or_(
                RegistrationPeriod.title.ilike(keyword_like),
                RegistrationPeriod.description.ilike(keyword_like),
                RegistrationPeriod.requirements.ilike(keyword_like),
            )
        )
    if year is not None:
        year_value = str(year)
        stmt = stmt.where(
            or_(
                func.strftime("%Y", RegistrationPeriod.registration_start) == year_value,
                func.strftime("%Y", RegistrationPeriod.registration_end) == year_value,
            )
        )
    return stmt.order_by(
        RegistrationPeriod.is_open.desc(),
        RegistrationPeriod.registration_start.desc().nullslast(),
        RegistrationPeriod.id.desc(),
    )


def list_registration_periods(db: Session, keyword: str | None = None, year: int | None = None) -> list[RegistrationPeriod]:
    return list(db.scalars(_period_query(keyword=keyword, year=year)))


def get_registration_period(db: Session, period_id: int) -> RegistrationPeriod:
    period = db.scalar(select(RegistrationPeriod).where(RegistrationPeriod.id == period_id))
    if not period:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=REGISTRATION_PERIOD_NOT_FOUND)
    return period


def get_open_registration_period(db: Session) -> RegistrationPeriod | None:
    today = date.today()
    stmt = select(RegistrationPeriod).where(RegistrationPeriod.is_open.is_(True))
    period = db.scalar(stmt.order_by(RegistrationPeriod.registration_start.desc().nullslast(), RegistrationPeriod.id.desc()))
    if period and period.registration_start and period.registration_start > today:
        return None
    if period and period.registration_end and period.registration_end < today:
        return None
    return period


def create_registration_period(db: Session, payload: RegistrationPeriodCreate, current_user: User) -> RegistrationPeriod:
    _ensure_admin(current_user)
    _validate_dates(payload.registration_start, payload.registration_end)
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title is required.")

    period = RegistrationPeriod(
        title=title,
        registration_start=payload.registration_start,
        registration_end=payload.registration_end,
        description=payload.description,
        requirements=payload.requirements,
        is_open=payload.is_open,
    )
    db.add(period)
    db.flush()

    db.commit()
    return get_registration_period(db, period.id)


def update_registration_period(
    db: Session,
    period_id: int,
    payload: RegistrationPeriodUpdate,
    current_user: User,
) -> RegistrationPeriod:
    _ensure_admin(current_user)
    period = get_registration_period(db, period_id)

    values = payload.model_dump(exclude_unset=True)
    registration_start = values.get("registration_start", period.registration_start)
    registration_end = values.get("registration_end", period.registration_end)
    _validate_dates(registration_start, registration_end)

    is_open = values.pop("is_open", None)
    if "title" in values and values["title"] is not None:
        values["title"] = values["title"].strip()
        if not values["title"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title is required.")

    for field, value in values.items():
        setattr(period, field, value)

    _maybe_activate_period(period, is_open)
    db.commit()
    return get_registration_period(db, period.id)


def open_registration_period(db: Session, period_id: int, current_user: User) -> RegistrationPeriod:
    _ensure_admin(current_user)
    period = get_registration_period(db, period_id)
    period.is_open = True
    db.commit()
    return get_registration_period(db, period.id)


def close_registration_period(db: Session, period_id: int, current_user: User) -> RegistrationPeriod:
    _ensure_admin(current_user)
    period = get_registration_period(db, period_id)
    period.is_open = False
    db.commit()
    return get_registration_period(db, period.id)


def delete_registration_period(db: Session, period_id: int, current_user: User) -> None:
    _ensure_admin(current_user)
    period = get_registration_period(db, period_id)
    _ensure_not_in_use(db, period.id)
    db.delete(period)
    db.commit()

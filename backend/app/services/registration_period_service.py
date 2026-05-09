from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.registration_period import RegistrationPeriod


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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đợt đăng ký.")
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

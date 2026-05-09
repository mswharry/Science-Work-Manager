from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, get_current_user
from app.models.user import User
from app.schemas.registration_period import RegistrationPeriodOut
from app.services.registration_period_service import get_registration_period, list_registration_periods

router = APIRouter(tags=["registration-periods"])


@router.get("/registration-periods", response_model=list[RegistrationPeriodOut])
def list_registration_periods_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
    keyword: str | None = None,
    year: int | None = None,
) -> list[RegistrationPeriodOut]:
    periods = list_registration_periods(db=db, keyword=keyword, year=year)
    return [RegistrationPeriodOut.model_validate(period) for period in periods]


@router.get("/registration-periods/{period_id}", response_model=RegistrationPeriodOut)
def get_registration_period_endpoint(
    period_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> RegistrationPeriodOut:
    period = get_registration_period(db=db, period_id=period_id)
    return RegistrationPeriodOut.model_validate(period)

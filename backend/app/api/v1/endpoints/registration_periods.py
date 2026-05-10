from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.registration_period import RegistrationPeriodCreate, RegistrationPeriodOut, RegistrationPeriodUpdate
from app.services.registration_period_service import (
    close_registration_period,
    create_registration_period,
    delete_registration_period,
    get_registration_period,
    list_registration_periods,
    open_registration_period,
    update_registration_period,
)

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


@router.post("/admin/registration-periods", response_model=RegistrationPeriodOut, status_code=status.HTTP_201_CREATED)
def create_registration_period_endpoint(
    payload: RegistrationPeriodCreate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> RegistrationPeriodOut:
    period = create_registration_period(db=db, payload=payload, current_user=admin_user)
    return RegistrationPeriodOut.model_validate(period)


@router.put("/admin/registration-periods/{period_id}", response_model=RegistrationPeriodOut)
def update_registration_period_endpoint(
    period_id: int,
    payload: RegistrationPeriodUpdate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> RegistrationPeriodOut:
    period = update_registration_period(db=db, period_id=period_id, payload=payload, current_user=admin_user)
    return RegistrationPeriodOut.model_validate(period)


@router.patch("/admin/registration-periods/{period_id}/open", response_model=RegistrationPeriodOut)
def open_registration_period_endpoint(
    period_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> RegistrationPeriodOut:
    period = open_registration_period(db=db, period_id=period_id, current_user=admin_user)
    return RegistrationPeriodOut.model_validate(period)


@router.patch("/admin/registration-periods/{period_id}/close", response_model=RegistrationPeriodOut)
def close_registration_period_endpoint(
    period_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> RegistrationPeriodOut:
    period = close_registration_period(db=db, period_id=period_id, current_user=admin_user)
    return RegistrationPeriodOut.model_validate(period)


@router.delete("/admin/registration-periods/{period_id}", response_model=MessageResponse)
def delete_registration_period_endpoint(
    period_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    delete_registration_period(db=db, period_id=period_id, current_user=admin_user)
    return MessageResponse(message="Deleted registration period.")

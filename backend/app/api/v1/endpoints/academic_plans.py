from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.academic_plan import AcademicPlanCreate, AcademicPlanOut, AcademicPlanUpdate
from app.schemas.common import MessageResponse
from app.services.academic_plan_service import (
    activate_academic_plan,
    close_academic_plan,
    create_academic_plan,
    delete_academic_plan,
    get_academic_plan,
    list_academic_plans,
    update_academic_plan,
)

router = APIRouter(tags=["academic-plans"])


@router.get("/plans", response_model=list[AcademicPlanOut])
def list_plans_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[AcademicPlanOut]:
    plans = list_academic_plans(db=db)
    return [AcademicPlanOut.model_validate(plan) for plan in plans]


@router.get("/plans/{plan_id}", response_model=AcademicPlanOut)
def get_plan_endpoint(
    plan_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> AcademicPlanOut:
    plan = get_academic_plan(db=db, plan_id=plan_id)
    return AcademicPlanOut.model_validate(plan)


@router.post("/admin/plans", response_model=AcademicPlanOut, status_code=status.HTTP_201_CREATED)
def create_plan_endpoint(
    payload: AcademicPlanCreate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> AcademicPlanOut:
    plan = create_academic_plan(db=db, payload=payload, admin_user=admin_user)
    return AcademicPlanOut.model_validate(plan)


@router.put("/admin/plans/{plan_id}", response_model=AcademicPlanOut)
def update_plan_endpoint(
    plan_id: int,
    payload: AcademicPlanUpdate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> AcademicPlanOut:
    plan = update_academic_plan(db=db, plan_id=plan_id, payload=payload, admin_user=admin_user)
    return AcademicPlanOut.model_validate(plan)


@router.put("/admin/plans/{plan_id}/activate", response_model=AcademicPlanOut)
def activate_plan_endpoint(
    plan_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> AcademicPlanOut:
    plan = activate_academic_plan(db=db, plan_id=plan_id, admin_user=admin_user)
    return AcademicPlanOut.model_validate(plan)


@router.put("/admin/plans/{plan_id}/close", response_model=AcademicPlanOut)
def close_plan_endpoint(
    plan_id: int,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> AcademicPlanOut:
    plan = close_academic_plan(db=db, plan_id=plan_id, admin_user=admin_user)
    return AcademicPlanOut.model_validate(plan)


@router.delete("/admin/plans/{plan_id}", response_model=MessageResponse)
def delete_plan_endpoint(
    plan_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    delete_academic_plan(db=db, plan_id=plan_id)
    return MessageResponse(message="Academic plan deleted successfully")

from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.statistics import DashboardStatsResponse, TopLecturerResponse
from app.services.statistics_service import get_dashboard_statistics, get_top_lecturers

router = APIRouter(tags=["statistics"])


@router.get("/admin/statistics/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_statistics_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> DashboardStatsResponse:
    return get_dashboard_statistics(db=db)


@router.get("/statistics/top-lecturers", response_model=list[TopLecturerResponse])
def get_top_lecturers_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[TopLecturerResponse]:
    return get_top_lecturers(db=db)

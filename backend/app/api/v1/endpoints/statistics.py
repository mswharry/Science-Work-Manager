from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.statistics import DashboardStatsResponse, LevelStatisticResponse, TopLecturerResponse
from app.services.statistics_service import (
    get_dashboard_statistics,
    get_statistics_by_paper_level,
    get_statistics_by_project_level,
    get_top_lecturers,
)

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


@router.get("/admin/statistics/project-levels", response_model=list[LevelStatisticResponse])
def get_project_level_statistics_admin_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[LevelStatisticResponse]:
    stats = get_statistics_by_project_level(db=db)
    return [
        LevelStatisticResponse(
            level_id=item.level_id,
            level_code=item.level_code,
            level_name=item.level_name,
            count=item.count,
        )
        for item in stats
    ]


@router.get("/admin/statistics/paper-levels", response_model=list[LevelStatisticResponse])
def get_paper_level_statistics_admin_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[LevelStatisticResponse]:
    stats = get_statistics_by_paper_level(db=db)
    return [
        LevelStatisticResponse(
            level_id=item.level_id,
            level_code=item.level_code,
            level_name=item.level_name,
            count=item.count,
        )
        for item in stats
    ]


@router.get("/statistics/project-levels", response_model=list[LevelStatisticResponse])
def get_project_level_statistics_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[LevelStatisticResponse]:
    stats = get_statistics_by_project_level(db=db)
    return [
        LevelStatisticResponse(
            level_id=item.level_id,
            level_code=item.level_code,
            level_name=item.level_name,
            count=item.count,
        )
        for item in stats
    ]


@router.get("/statistics/paper-levels", response_model=list[LevelStatisticResponse])
def get_paper_level_statistics_endpoint(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[LevelStatisticResponse]:
    stats = get_statistics_by_paper_level(db=db)
    return [
        LevelStatisticResponse(
            level_id=item.level_id,
            level_code=item.level_code,
            level_name=item.level_name,
            count=item.count,
        )
        for item in stats
    ]

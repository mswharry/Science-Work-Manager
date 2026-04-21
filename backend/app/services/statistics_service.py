from __future__ import annotations

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.constants import PAPER_STATUS_VALUES, PROJECT_STATUS_VALUES, PaperStatus, UserRole
from app.models.association import PaperAuthor
from app.models.level import Level
from app.models.paper import Paper
from app.models.project import Project
from app.models.user import User
from app.schemas.statistics import DashboardStatsResponse, StatusCount, TopLecturerResponse, YearlyCount


class LevelStatistic:
    def __init__(self, level_id: int, level_code: str, level_name: str, count: int) -> None:
        self.level_id = level_id
        self.level_code = level_code
        self.level_name = level_name
        self.count = count



def _status_count_map(rows: list[tuple[str, int]], expected_statuses: set[str]) -> list[StatusCount]:
    row_map = {status: count for status, count in rows}
    return [StatusCount(status=status, count=row_map.get(status, 0)) for status in sorted(expected_statuses)]



def _to_status_value(raw_status) -> str:
    return raw_status.value if hasattr(raw_status, "value") else str(raw_status)



def get_dashboard_statistics(db: Session) -> DashboardStatsResponse:
    total_users = db.scalar(select(func.count(User.id))) or 0
    total_projects = db.scalar(select(func.count(Project.id))) or 0
    total_papers = db.scalar(select(func.count(Paper.id))) or 0

    project_status_rows = list(
        db.execute(select(Project.status, func.count(Project.id)).group_by(Project.status)).all()
    )
    paper_status_rows = list(
        db.execute(select(Paper.status, func.count(Paper.id)).group_by(Paper.status)).all()
    )

    yearly_project_rows = list(
        db.execute(
            select(func.strftime("%Y", Project.start_date), func.count(Project.id))
            .where(Project.start_date.is_not(None))
            .group_by(func.strftime("%Y", Project.start_date))
            .order_by(func.strftime("%Y", Project.start_date))
        ).all()
    )
    yearly_paper_rows = list(
        db.execute(
            select(Paper.publication_year, func.count(Paper.id))
            .where(Paper.publication_year.is_not(None))
            .group_by(Paper.publication_year)
            .order_by(Paper.publication_year)
        ).all()
    )

    yearly_project_counts = [
        YearlyCount(year=int(year), count=count)
        for year, count in yearly_project_rows
        if year is not None and year.isdigit()
    ]
    yearly_paper_counts = [YearlyCount(year=year, count=count) for year, count in yearly_paper_rows if year is not None]

    return DashboardStatsResponse(
        total_users=total_users,
        total_projects=total_projects,
        total_papers=total_papers,
        project_counts_by_status=_status_count_map(
            [(_to_status_value(row[0]), row[1]) for row in project_status_rows], PROJECT_STATUS_VALUES
        ),
        paper_counts_by_status=_status_count_map(
            [(_to_status_value(row[0]), row[1]) for row in paper_status_rows],
            PAPER_STATUS_VALUES,
        ),
        yearly_project_counts=yearly_project_counts,
        yearly_paper_counts=yearly_paper_counts,
    )



def get_top_lecturers(db: Session) -> list[TopLecturerResponse]:
    stmt: Select[tuple[int, str, str | None, str | None, int]] = (
        select(
            User.id,
            User.full_name,
            User.staff_id,
            User.department,
            func.count(Paper.id).label("paper_count"),
        )
        .join(PaperAuthor, PaperAuthor.user_id == User.id)
        .join(Paper, Paper.id == PaperAuthor.paper_id)
        .where(User.role == UserRole.LECTURER, Paper.status == PaperStatus.APPROVED)
        .group_by(User.id, User.full_name, User.staff_id, User.department)
        .order_by(func.count(Paper.id).desc(), User.id.asc())
        .limit(5)
    )

    rows = db.execute(stmt).all()
    return [
        TopLecturerResponse(
            lecturer_id=lecturer_id,
            full_name=full_name,
            staff_id=staff_id,
            department=department,
            paper_count=paper_count,
        )
        for lecturer_id, full_name, staff_id, department, paper_count in rows
    ]


def get_statistics_by_paper_level(db: Session) -> list[LevelStatistic]:
    rows = list(
        db.execute(
            select(Level.id, Level.code, Level.name, func.count(Paper.id))
            .outerjoin(Paper, Paper.level_id == Level.id)
            .where(Level.entity_type == "paper")
            .group_by(Level.id, Level.code, Level.name)
            .order_by(Level.id.asc())
        ).all()
    )
    return [
        LevelStatistic(level_id=level_id, level_code=level_code, level_name=level_name, count=count)
        for level_id, level_code, level_name, count in rows
    ]


def get_statistics_by_project_level(db: Session) -> list[LevelStatistic]:
    rows = list(
        db.execute(
            select(Level.id, Level.code, Level.name, func.count(Project.id))
            .outerjoin(Project, Project.level_id == Level.id)
            .where(Level.entity_type == "project")
            .group_by(Level.id, Level.code, Level.name)
            .order_by(Level.id.asc())
        ).all()
    )
    return [
        LevelStatistic(level_id=level_id, level_code=level_code, level_name=level_name, count=count)
        for level_id, level_code, level_name, count in rows
    ]

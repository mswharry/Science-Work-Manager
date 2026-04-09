from __future__ import annotations

from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class YearlyCount(BaseModel):
    year: int
    count: int


class DashboardStatsResponse(BaseModel):
    total_users: int
    total_projects: int
    total_papers: int
    project_counts_by_status: list[StatusCount]
    paper_counts_by_status: list[StatusCount]
    yearly_project_counts: list[YearlyCount]
    yearly_paper_counts: list[YearlyCount]


class TopLecturerResponse(BaseModel):
    lecturer_id: int
    full_name: str
    staff_id: str | None = None
    department: str | None = None
    paper_count: int

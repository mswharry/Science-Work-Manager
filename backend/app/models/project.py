from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ProjectStatus
from app.models.base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    leader_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    budget: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, native_enum=False),
        nullable=False,
        default=ProjectStatus.PENDING,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proposal_file: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    final_report_file: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    category = relationship("Category", back_populates="projects")
    leader = relationship("User", back_populates="led_projects", foreign_keys=[leader_id])
    reviewer = relationship("User", back_populates="reviewed_projects", foreign_keys=[reviewed_by])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")


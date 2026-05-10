from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ReviewAssignmentStatus
from app.models.base import Base, TimestampMixin


class ReviewAssignment(Base, TimestampMixin):
    __tablename__ = "review_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    round_id: Mapped[int] = mapped_column(ForeignKey("review_rounds.id"), nullable=False, index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[ReviewAssignmentStatus] = mapped_column(
        Enum(ReviewAssignmentStatus, native_enum=False),
        nullable=False,
        default=ReviewAssignmentStatus.ASSIGNED,
        index=True,
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="review_assignments")
    round = relationship("ReviewRound", back_populates="assignments")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    feedback = relationship("ReviewFeedback", back_populates="assignment", uselist=False, cascade="all, delete-orphan")

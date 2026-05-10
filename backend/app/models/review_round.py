from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ReviewRoundStatus
from app.models.base import Base, TimestampMixin


class ReviewRound(Base, TimestampMixin):
    __tablename__ = "review_rounds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    round_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[ReviewRoundStatus] = mapped_column(
        Enum(ReviewRoundStatus, native_enum=False),
        nullable=False,
        default=ReviewRoundStatus.FORM_CHECK_PENDING,
        index=True,
    )
    form_check_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meeting_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    meeting_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    revision_request_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    revision_required_files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    revision_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    revision_submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revision_submission_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    revision_files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    project = relationship("Project", back_populates="review_rounds")
    assignments = relationship("ReviewAssignment", back_populates="round", cascade="all, delete-orphan")
    decisions = relationship("ApprovalDecision", back_populates="round", cascade="all, delete-orphan")
    histories = relationship("ApprovalHistory", back_populates="round", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])

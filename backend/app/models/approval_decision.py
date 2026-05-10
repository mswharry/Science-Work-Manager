from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ApprovalDecisionType
from app.models.base import Base, TimestampMixin


class ApprovalDecision(Base, TimestampMixin):
    __tablename__ = "approval_decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    round_id: Mapped[int] = mapped_column(ForeignKey("review_rounds.id"), nullable=False, index=True)
    decision_type: Mapped[ApprovalDecisionType] = mapped_column(
        Enum(ApprovalDecisionType, native_enum=False),
        nullable=False,
        index=True,
    )
    approved_budget: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    decided_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="approval_decisions")
    round = relationship("ReviewRound", back_populates="decisions")
    decider = relationship("User", foreign_keys=[decided_by])

from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class ApprovalHistory(Base, TimestampMixin):
    __tablename__ = "approval_histories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    round_id: Mapped[Optional[int]] = mapped_column(ForeignKey("review_rounds.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    previous_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    new_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    performed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    project = relationship("Project", back_populates="approval_histories")
    round = relationship("ReviewRound", back_populates="histories")
    performer = relationship("User", foreign_keys=[performed_by])

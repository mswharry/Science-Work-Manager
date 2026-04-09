from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PaperStatus
from app.models.base import Base, TimestampMixin


class Paper(Base, TimestampMixin):
    __tablename__ = "papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    journal_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    publication_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    volume: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    issue: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pages: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    doi: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    status: Mapped[PaperStatus] = mapped_column(
        Enum(PaperStatus, native_enum=False),
        nullable=False,
        default=PaperStatus.PENDING,
        index=True,
    )
    file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    supervisor_lecturer_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    supervisor_full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    supervisor_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    supervisor_staff_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    supervisor_department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    category = relationship("Category", back_populates="papers")
    creator = relationship("User", foreign_keys=[created_by])
    reviewer = relationship("User", back_populates="reviewed_papers", foreign_keys=[reviewed_by])
    authors = relationship("PaperAuthor", back_populates="paper", cascade="all, delete-orphan")

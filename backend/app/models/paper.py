from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PaperStatus
from app.models.base import Base, TimestampMixin


class Paper(Base, TimestampMixin):
    __tablename__ = "papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    journal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    publication_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    volume: Mapped[str | None] = mapped_column(String(50), nullable=True)
    issue: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pages: Mapped[str | None] = mapped_column(String(50), nullable=True)
    doi: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    status: Mapped[PaperStatus] = mapped_column(
        Enum(PaperStatus, native_enum=False),
        nullable=False,
        default=PaperStatus.PENDING,
        index=True,
    )
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    review_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    category = relationship("Category", back_populates="papers")
    reviewer = relationship("User", back_populates="reviewed_papers", foreign_keys=[reviewed_by])
    authors = relationship("PaperAuthor", back_populates="paper", cascade="all, delete-orphan")


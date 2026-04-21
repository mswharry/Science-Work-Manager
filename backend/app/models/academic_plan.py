from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import AcademicPlanStatus
from app.models.base import Base, TimestampMixin


class AcademicPlan(Base, TimestampMixin):
    __tablename__ = "academic_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[AcademicPlanStatus] = mapped_column(
        Enum(AcademicPlanStatus, native_enum=False),
        nullable=False,
        default=AcademicPlanStatus.DRAFT,
        index=True,
    )
    sheet_file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sheet_file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    sheet_file_content_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

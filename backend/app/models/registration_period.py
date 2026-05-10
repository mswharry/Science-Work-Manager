from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class RegistrationPeriod(Base, TimestampMixin):
    __tablename__ = "registration_periods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    registration_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    projects = relationship("Project", back_populates="registration_period")

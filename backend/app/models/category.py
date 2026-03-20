from __future__ import annotations

from typing import Optional

from sqlalchemy import Enum, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import CategoryType
from app.models.base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("type", "name", name="uq_categories_type_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[CategoryType] = mapped_column(Enum(CategoryType, native_enum=False), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    projects = relationship("Project", back_populates="category")
    papers = relationship("Paper", back_populates="category")


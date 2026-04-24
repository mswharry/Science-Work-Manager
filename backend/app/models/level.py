from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, Enum, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import EntityType
from app.models.base import Base, TimestampMixin


class Level(Base, TimestampMixin):
    __tablename__ = "levels"
    __table_args__ = (UniqueConstraint("code", "entity_type", name="uq_levels_code_entity_type"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    entity_type: Mapped[EntityType] = mapped_column(Enum(EntityType, native_enum=False), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weight: Mapped[Optional[int]] = mapped_column(Integer, default=0, nullable=True)
    points: Mapped[Optional[int]] = mapped_column(Integer, default=0, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    papers = relationship("Paper", back_populates="level")
    projects = relationship("Project", back_populates="level")

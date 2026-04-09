from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import UserRole
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False),
        nullable=False,
        default=UserRole.STUDENT,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    staff_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    student_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    led_projects = relationship("Project", back_populates="leader", foreign_keys="Project.leader_id")
    reviewed_projects = relationship(
        "Project",
        back_populates="reviewer",
        foreign_keys="Project.reviewed_by",
    )
    requested_project_completions = relationship(
        "Project",
        foreign_keys="Project.completion_requested_by",
    )
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    paper_authorships = relationship("PaperAuthor", back_populates="user", cascade="all, delete-orphan")
    created_papers = relationship("Paper", foreign_keys="Paper.created_by")
    reviewed_papers = relationship("Paper", back_populates="reviewer", foreign_keys="Paper.reviewed_by")
    created_notifications = relationship(
        "Notification",
        back_populates="creator",
        foreign_keys="Notification.created_by",
    )

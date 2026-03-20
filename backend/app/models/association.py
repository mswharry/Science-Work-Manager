from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class ProjectMember(Base, TimestampMixin):
    __tablename__ = "project_members"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_members_project_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role_in_project: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")


class PaperAuthor(Base, TimestampMixin):
    __tablename__ = "paper_authors"
    __table_args__ = (UniqueConstraint("paper_id", "user_id", name="uq_paper_authors_paper_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    author_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_corresponding: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    paper = relationship("Paper", back_populates="authors")
    user = relationship("User", back_populates="paper_authorships")


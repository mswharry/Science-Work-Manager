from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate

ALLOWED_TARGET_ROLES = {"all", UserRole.LECTURER.value, UserRole.STUDENT.value}


def create_notification(db: Session, payload: NotificationCreate, admin_user: User) -> Notification:
    target_role = (payload.target_role or "all").strip().lower()
    if target_role not in ALLOWED_TARGET_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_role must be one of: all, lecturer, student.",
        )

    notification = Notification(
        title=payload.title.strip(),
        content=payload.content.strip(),
        target_role=target_role,
        created_by=admin_user.id,
        is_active=True,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def list_notifications(db: Session, current_user: User) -> list[Notification]:
    role_value = current_user.role.value
    stmt: Select[tuple[Notification]] = (
        select(Notification)
        .where(
            Notification.is_active.is_(True),
            or_(
                Notification.target_role == "all",
                Notification.target_role == role_value,
                Notification.target_role.is_(None),
            ),
        )
        .order_by(Notification.id.desc())
    )
    return list(db.scalars(stmt))

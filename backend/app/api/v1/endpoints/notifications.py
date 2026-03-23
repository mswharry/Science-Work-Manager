from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationOut
from app.services.notification_service import create_notification, list_notifications

router = APIRouter(tags=["notifications"])


@router.post("/admin/notifications", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification_endpoint(
    payload: NotificationCreate,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> NotificationOut:
    notification = create_notification(db=db, payload=payload, admin_user=admin_user)
    return NotificationOut.model_validate(notification)


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications_endpoint(
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[NotificationOut]:
    notifications = list_notifications(db=db, current_user=current_user)
    return [NotificationOut.model_validate(notification) for notification in notifications]

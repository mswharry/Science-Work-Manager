from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import UserApproveRequest, UserOut
from app.services.user_service import approve_user, list_users, toggle_user_block

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserOut)
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.model_validate(current_user)


@router.get("/admin/users", response_model=list[UserOut])
def admin_list_users(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
    role: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    is_approved: bool | None = Query(default=None),
) -> list[UserOut]:
    users = list_users(db=db, role=role, is_active=is_active, is_approved=is_approved)
    return [UserOut.model_validate(user) for user in users]


@router.put("/admin/users/{user_id}/approve", response_model=UserOut)
def admin_approve_user(
    user_id: int,
    payload: UserApproveRequest,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> UserOut:
    updated_user = approve_user(db=db, user_id=user_id, payload=payload)
    return UserOut.model_validate(updated_user)


@router.put("/admin/users/{user_id}/toggle-block", response_model=MessageResponse)
def admin_toggle_block_user(
    user_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    toggle_user_block(db=db, user_id=user_id)
    return MessageResponse(message="User status updated")



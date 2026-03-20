from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.models.user import User
from app.schemas.user import UserApproveRequest


def list_users(
    db: Session,
    role: str | None = None,
    is_active: bool | None = None,
    is_approved: bool | None = None,
) -> list[User]:
    stmt: Select[tuple[User]] = select(User).order_by(User.id.desc())

    if role:
        if role not in {UserRole.ADMIN.value, UserRole.LECTURER.value, UserRole.STUDENT.value}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role filter.")
        stmt = stmt.where(User.role == UserRole(role))
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
    if is_approved is not None:
        stmt = stmt.where(User.is_approved == is_approved)

    return list(db.scalars(stmt))


def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def approve_user(db: Session, user_id: int, payload: UserApproveRequest) -> User:
    if payload.role not in {UserRole.STUDENT.value, UserRole.LECTURER.value}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved role must be student or lecturer.",
        )

    user = get_user_by_id(db, user_id)
    user.role = UserRole(payload.role)
    user.is_approved = payload.is_approved

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user due to data constraint.",
        ) from exc

    db.refresh(user)
    return user


def toggle_user_block(db: Session, user_id: int) -> User:
    user = get_user_by_id(db, user_id)
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

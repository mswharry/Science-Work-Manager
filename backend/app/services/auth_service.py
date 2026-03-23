from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut


def register_user(db: Session, payload: RegisterRequest) -> User:
    if payload.role not in {UserRole.STUDENT.value, UserRole.LECTURER.value}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public register only supports student or lecturer role.",
        )

    if payload.role == UserRole.STUDENT.value and not payload.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id is required for student registration.",
        )

    if payload.role == UserRole.LECTURER.value and not payload.staff_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="staff_id is required for lecturer registration.",
        )

    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists.")

    is_approved = payload.role == UserRole.STUDENT.value
    new_user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=UserRole(payload.role),
        is_active=True,
        is_approved=is_approved,
        student_id=payload.student_id,
        staff_id=payload.staff_id,
        department=payload.department,
    )
    db.add(new_user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate student_id, staff_id, or email.",
        ) from exc

    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is blocked.")

    if user.role == UserRole.LECTURER and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lecturer account is waiting for admin approval.",
        )

    return user


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = authenticate_user(db, payload)
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, token_type="bearer")


def to_user_out(user: User) -> UserOut:
    return UserOut.model_validate(user)

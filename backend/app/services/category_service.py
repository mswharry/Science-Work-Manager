from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import CategoryType
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def _ensure_category_type(category_type: str) -> CategoryType:
    try:
        return CategoryType(category_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category type.") from exc


def list_categories_by_type(db: Session, category_type: str) -> list[Category]:
    category_enum = _ensure_category_type(category_type)
    stmt: Select[tuple[Category]] = select(Category).where(Category.type == category_enum).order_by(Category.id.asc())
    return list(db.scalars(stmt))


def create_category(db: Session, payload: CategoryCreate, category_type: str) -> Category:
    category_enum = _ensure_category_type(category_type)

    if payload.type and payload.type != category_enum.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category type must be {category_enum.value}.",
        )

    category = Category(
        name=payload.name.strip(),
        type=category_enum,
        description=payload.description,
        points=payload.points,
    )
    db.add(category)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category with this name already exists for the selected type.",
        ) from exc

    db.refresh(category)
    return category


def get_category_by_id_and_type(db: Session, category_id: int, category_type: str) -> Category:
    category_enum = _ensure_category_type(category_type)
    category = db.scalar(select(Category).where(Category.id == category_id, Category.type == category_enum))
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return category


def update_category(db: Session, category_id: int, payload: CategoryUpdate, category_type: str) -> Category:
    category = get_category_by_id_and_type(db=db, category_id=category_id, category_type=category_type)

    if payload.name is not None:
        category.name = payload.name.strip()
    if payload.description is not None:
        category.description = payload.description
    if payload.points is not None:
        category.points = payload.points

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category with this name already exists for the selected type.",
        ) from exc

    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int, category_type: str) -> None:
    category = get_category_by_id_and_type(db=db, category_id=category_id, category_type=category_type)
    db.delete(category)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete this category because it is being used.",
        ) from exc

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import CategoryType
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def _get_category_by_id(db: Session, category_id: int) -> Category:
	category = db.get(Category, category_id)
	if not category:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
	return category


def list_categories_by_type(db: Session, category_type: CategoryType) -> list[Category]:
	stmt: Select[tuple[Category]] = (
		select(Category)
		.where(Category.type == category_type)
		.order_by(Category.id.desc())
	)
	return list(db.scalars(stmt))


def create_category(db: Session, payload: CategoryCreate, category_type: CategoryType) -> Category:
	category = Category(
		name=payload.name,
		type=category_type,
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
			detail="Category name already exists for this type.",
		) from exc
	db.refresh(category)
	return category


def update_category(
	db: Session,
	category_id: int,
	payload: CategoryUpdate,
	category_type: CategoryType,
) -> Category:
	category = _get_category_by_id(db, category_id)
	if category.type != category_type:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

	update_data = payload.model_dump(exclude_unset=True)
	for key, value in update_data.items():
		setattr(category, key, value)

	try:
		db.commit()
	except IntegrityError as exc:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Category name already exists for this type.",
		) from exc
	db.refresh(category)
	return category


def delete_category(db: Session, category_id: int, category_type: CategoryType) -> None:
	category = _get_category_by_id(db, category_id)
	if category.type != category_type:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

	db.delete(category)
	try:
		db.commit()
	except IntegrityError as exc:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Cannot delete category because it is being used by projects or papers.",
		) from exc


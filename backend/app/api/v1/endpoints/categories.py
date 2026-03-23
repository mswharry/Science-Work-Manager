from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_admin_user
from app.core.constants import CategoryType
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.common import MessageResponse
from app.services.category_service import (
	create_category,
	delete_category,
	list_categories_by_type,
	update_category,
)

router = APIRouter(prefix="/admin/categories", tags=["categories"])


@router.get("/project-types", response_model=list[CategoryOut])
def list_project_types(
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> list[CategoryOut]:
	categories = list_categories_by_type(db=db, category_type=CategoryType.PROJECT_TYPE)
	return [CategoryOut.model_validate(category) for category in categories]


@router.post("/project-types", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_project_type(
	payload: CategoryCreate,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> CategoryOut:
	category = create_category(db=db, payload=payload, category_type=CategoryType.PROJECT_TYPE)
	return CategoryOut.model_validate(category)


@router.put("/project-types/{category_id}", response_model=CategoryOut)
def update_project_type(
	category_id: int,
	payload: CategoryUpdate,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> CategoryOut:
	category = update_category(
		db=db,
		category_id=category_id,
		payload=payload,
		category_type=CategoryType.PROJECT_TYPE,
	)
	return CategoryOut.model_validate(category)


@router.delete("/project-types/{category_id}", response_model=MessageResponse)
def delete_project_type(
	category_id: int,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
	delete_category(db=db, category_id=category_id, category_type=CategoryType.PROJECT_TYPE)
	return MessageResponse(message="Category deleted successfully")


@router.get("/paper-types", response_model=list[CategoryOut])
def list_paper_types(
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> list[CategoryOut]:
	categories = list_categories_by_type(db=db, category_type=CategoryType.PAPER_TYPE)
	return [CategoryOut.model_validate(category) for category in categories]


@router.post("/paper-types", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_paper_type(
	payload: CategoryCreate,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> CategoryOut:
	category = create_category(db=db, payload=payload, category_type=CategoryType.PAPER_TYPE)
	return CategoryOut.model_validate(category)


@router.put("/paper-types/{category_id}", response_model=CategoryOut)
def update_paper_type(
	category_id: int,
	payload: CategoryUpdate,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> CategoryOut:
	category = update_category(
		db=db,
		category_id=category_id,
		payload=payload,
		category_type=CategoryType.PAPER_TYPE,
	)
	return CategoryOut.model_validate(category)


@router.delete("/paper-types/{category_id}", response_model=MessageResponse)
def delete_paper_type(
	category_id: int,
	db: DbSession,
	_: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
	delete_category(db=db, category_id=category_id, category_type=CategoryType.PAPER_TYPE)
	return MessageResponse(message="Category deleted successfully")


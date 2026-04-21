from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.core.constants import EntityType
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.level import LevelCreate, LevelOut, LevelUpdate
from app.services.level_service import (
    create_level,
    delete_level,
    list_active_levels_by_entity_type,
    list_levels_by_entity_type,
    update_level,
)

router = APIRouter(tags=["levels"])


@router.get("/levels/project-levels", response_model=list[LevelOut])
def get_public_project_levels(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[LevelOut]:
    levels = list_active_levels_by_entity_type(db=db, entity_type=EntityType.PROJECT.value)
    return [LevelOut.model_validate(level) for level in levels]


@router.get("/levels/paper-levels", response_model=list[LevelOut])
def get_public_paper_levels(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[LevelOut]:
    levels = list_active_levels_by_entity_type(db=db, entity_type=EntityType.PAPER.value)
    return [LevelOut.model_validate(level) for level in levels]


@router.get("/admin/levels/project-levels", response_model=list[LevelOut])
def get_project_levels(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[LevelOut]:
    levels = list_levels_by_entity_type(db=db, entity_type=EntityType.PROJECT.value)
    return [LevelOut.model_validate(level) for level in levels]


@router.post("/admin/levels/project-levels", response_model=LevelOut, status_code=status.HTTP_201_CREATED)
def create_project_level(
    payload: LevelCreate,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> LevelOut:
    level = create_level(db=db, payload=payload)
    return LevelOut.model_validate(level)


@router.put("/admin/levels/project-levels/{level_id}", response_model=LevelOut)
def update_project_level(
    level_id: int,
    payload: LevelUpdate,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> LevelOut:
    level = update_level(db=db, level_id=level_id, payload=payload)
    return LevelOut.model_validate(level)


@router.delete("/admin/levels/project-levels/{level_id}", response_model=MessageResponse)
def delete_project_level(
    level_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    delete_level(db=db, level_id=level_id)
    return MessageResponse(message="Level deleted successfully")


@router.get("/admin/levels/paper-levels", response_model=list[LevelOut])
def get_paper_levels(
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> list[LevelOut]:
    levels = list_levels_by_entity_type(db=db, entity_type=EntityType.PAPER.value)
    return [LevelOut.model_validate(level) for level in levels]


@router.post("/admin/levels/paper-levels", response_model=LevelOut, status_code=status.HTTP_201_CREATED)
def create_paper_level(
    payload: LevelCreate,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> LevelOut:
    level = create_level(db=db, payload=payload)
    return LevelOut.model_validate(level)


@router.put("/admin/levels/paper-levels/{level_id}", response_model=LevelOut)
def update_paper_level(
    level_id: int,
    payload: LevelUpdate,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> LevelOut:
    level = update_level(db=db, level_id=level_id, payload=payload)
    return LevelOut.model_validate(level)


@router.delete("/admin/levels/paper-levels/{level_id}", response_model=MessageResponse)
def delete_paper_level(
    level_id: int,
    db: DbSession,
    _: Annotated[User, Depends(get_current_admin_user)],
) -> MessageResponse:
    delete_level(db=db, level_id=level_id)
    return MessageResponse(message="Level deleted successfully")

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import EntityType
from app.models.level import Level
from app.schemas.level import LevelCreate, LevelUpdate


DEFAULT_LEVELS_BY_ENTITY: dict[EntityType, list[dict[str, object]]] = {
    EntityType.PROJECT: [
        {"code": "cap_khoa", "name": "Cấp khoa", "weight": 1, "points": 10},
        {"code": "cap_truong", "name": "Cấp trường", "weight": 2, "points": 20},
        {"code": "cap_bo", "name": "Cấp bộ", "weight": 3, "points": 30},
        {"code": "cap_nha_nuoc", "name": "Cấp nhà nước", "weight": 4, "points": 40},
    ],
    EntityType.PAPER: [
        {"code": "hoi_nghi_trong_nuoc", "name": "Hội nghị trong nước", "weight": 1, "points": 10},
        {"code": "hoi_nghi_quoc_te", "name": "Hội nghị quốc tế", "weight": 2, "points": 20},
        {"code": "tap_chi_trong_nuoc", "name": "Tạp chí trong nước", "weight": 3, "points": 30},
        {"code": "tap_chi_quoc_te", "name": "Tạp chí quốc tế", "weight": 4, "points": 40},
    ],
}


def _ensure_entity_type(entity_type: str) -> EntityType:
    try:
        return EntityType(entity_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid entity type.") from exc


def _ensure_default_levels(db: Session, entity_type: EntityType) -> None:
    has_any = db.scalar(select(Level.id).where(Level.entity_type == entity_type).limit(1))
    if has_any:
        return

    defaults = DEFAULT_LEVELS_BY_ENTITY.get(entity_type, [])
    for item in defaults:
        db.add(
            Level(
                code=str(item["code"]),
                name=str(item["name"]),
                entity_type=entity_type,
                weight=int(item["weight"]),
                points=int(item["points"]),
                is_active=True,
            )
        )

    if defaults:
        db.commit()


def list_levels_by_entity_type(db: Session, entity_type: str) -> list[Level]:
    entity_type_enum = _ensure_entity_type(entity_type)
    _ensure_default_levels(db, entity_type_enum)
    stmt: Select[tuple[Level]] = select(Level).where(Level.entity_type == entity_type_enum).order_by(Level.id.asc())
    return list(db.scalars(stmt))


def list_active_levels_by_entity_type(db: Session, entity_type: str) -> list[Level]:
    entity_type_enum = _ensure_entity_type(entity_type)
    _ensure_default_levels(db, entity_type_enum)
    stmt: Select[tuple[Level]] = (
        select(Level)
        .where(Level.entity_type == entity_type_enum, Level.is_active == True)
        .order_by(Level.id.asc())
    )
    return list(db.scalars(stmt))


def create_level(db: Session, payload: LevelCreate) -> Level:
    entity_type_enum = _ensure_entity_type(payload.entity_type)

    level = Level(
        code=payload.code.strip(),
        name=payload.name.strip(),
        entity_type=entity_type_enum,
        description=payload.description,
        weight=payload.weight,
        points=payload.points,
        is_active=payload.is_active,
    )
    db.add(level)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Level with this code already exists for the selected entity type.",
        ) from exc

    db.refresh(level)
    return level


def get_level_by_id(db: Session, level_id: int) -> Level:
    level = db.scalar(select(Level).where(Level.id == level_id))
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found.")
    return level


def get_level_by_id_and_entity_type(db: Session, level_id: int, entity_type: str) -> Level:
    entity_type_enum = _ensure_entity_type(entity_type)
    level = db.scalar(select(Level).where(Level.id == level_id, Level.entity_type == entity_type_enum))
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found.")
    return level


def update_level(db: Session, level_id: int, payload: LevelUpdate) -> Level:
    level = get_level_by_id(db=db, level_id=level_id)

    if payload.code is not None:
        level.code = payload.code.strip()
    if payload.name is not None:
        level.name = payload.name.strip()
    if payload.description is not None:
        level.description = payload.description
    if payload.weight is not None:
        level.weight = payload.weight
    if payload.points is not None:
        level.points = payload.points
    if payload.is_active is not None:
        level.is_active = payload.is_active

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Level with this code already exists for the selected entity type.",
        ) from exc

    db.refresh(level)
    return level


def delete_level(db: Session, level_id: int) -> None:
    level = get_level_by_id(db=db, level_id=level_id)
    db.delete(level)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete this level because it is being used.",
        ) from exc

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, get_current_user
from app.models.user import User
from app.schemas.classification import PaperClassificationGroupOut
from app.services.classification_service import list_active_paper_classification_groups

router = APIRouter(tags=["classifications"])


@router.get("/classifications/paper-groups", response_model=list[PaperClassificationGroupOut])
def get_public_paper_classification_groups(
    db: DbSession,
    _: Annotated[User, Depends(get_current_user)],
) -> list[PaperClassificationGroupOut]:
    groups = list_active_paper_classification_groups(db=db)
    return [PaperClassificationGroupOut.model_validate(group) for group in groups]

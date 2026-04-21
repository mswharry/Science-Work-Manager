from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, get_current_admin_user, get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.paper import AddAuthorRequest, PaperCreate, PaperOut, PaperReviewRequest, PaperUpdate
from app.services.paper_service import (
    add_paper_author,
    create_paper,
    delete_paper,
    get_paper_detail,
    list_papers,
    review_paper,
    update_paper,
)

router = APIRouter(tags=["papers"])


@router.post("/papers", response_model=PaperOut, status_code=status.HTTP_201_CREATED)
def create_paper_endpoint(
    payload: PaperCreate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaperOut:
    paper = create_paper(db=db, payload=payload, current_user=current_user)
    return PaperOut.model_validate(paper)


@router.get("/papers", response_model=list[PaperOut])
def list_papers_endpoint(
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    year: int | None = Query(default=None),
    category_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    mine: bool | None = Query(default=None),
    classification_option_id: int | None = Query(default=None),
) -> list[PaperOut]:
    papers = list_papers(
        db=db,
        current_user=current_user,
        year=year,
        category_id=category_id,
        status_filter=status,
        mine=mine,
        classification_option_id=classification_option_id,
    )
    return [PaperOut.model_validate(paper) for paper in papers]


@router.get("/papers/{paper_id}", response_model=PaperOut)
def get_paper_detail_endpoint(
    paper_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaperOut:
    paper = get_paper_detail(db=db, paper_id=paper_id, current_user=current_user)
    return PaperOut.model_validate(paper)


@router.put("/papers/{paper_id}", response_model=PaperOut)
def update_paper_endpoint(
    paper_id: int,
    payload: PaperUpdate,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaperOut:
    paper = update_paper(db=db, paper_id=paper_id, payload=payload, current_user=current_user)
    return PaperOut.model_validate(paper)


@router.delete("/papers/{paper_id}", response_model=MessageResponse)
def delete_paper_endpoint(
    paper_id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
    delete_paper(db=db, paper_id=paper_id, current_user=current_user)
    return MessageResponse(message="Paper deleted successfully")


@router.put("/admin/papers/{paper_id}/approve", response_model=PaperOut)
def review_paper_endpoint(
    paper_id: int,
    payload: PaperReviewRequest,
    db: DbSession,
    admin_user: Annotated[User, Depends(get_current_admin_user)],
) -> PaperOut:
    paper = review_paper(db=db, paper_id=paper_id, payload=payload, admin_user=admin_user)
    return PaperOut.model_validate(paper)


@router.post("/papers/{paper_id}/authors", response_model=MessageResponse)
def add_paper_author_endpoint(
    paper_id: int,
    payload: AddAuthorRequest,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
    add_paper_author(db=db, paper_id=paper_id, payload=payload, current_user=current_user)
    return MessageResponse(message="Author added successfully")

from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.upload import UploadOut
from app.services.upload_service import save_upload

router = APIRouter(tags=["uploads"])


@router.post('/uploads/paper-file', response_model=UploadOut, status_code=status.HTTP_201_CREATED)
def upload_paper_file(
    _: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
) -> UploadOut:
    return UploadOut.model_validate(save_upload(file, 'papers'))


@router.post('/uploads/project-proposal', response_model=UploadOut, status_code=status.HTTP_201_CREATED)
def upload_project_proposal(
    _: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
) -> UploadOut:
    return UploadOut.model_validate(save_upload(file, 'projects/proposals'))


@router.post('/uploads/project-final-report', response_model=UploadOut, status_code=status.HTTP_201_CREATED)
def upload_project_final_report(
    _: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
) -> UploadOut:
    return UploadOut.model_validate(save_upload(file, 'projects/final_reports'))

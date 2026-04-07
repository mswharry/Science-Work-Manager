from __future__ import annotations

import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".zip", ".rar",
    ".png", ".jpg", ".jpeg", ".ppt", ".pptx"
}


def _sanitize_name(name: str) -> str:
    safe = ''.join(ch if ch.isalnum() or ch in {'-', '_', '.'} else '_' for ch in name)
    return safe[:120] or 'file'


def save_upload(file: UploadFile, subdir: str) -> dict:
    settings = get_settings()
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Tệp tải lên không hợp lệ.')

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Định dạng tệp không được hỗ trợ. Vui lòng dùng PDF, Word, Excel, ảnh hoặc tệp nén phổ biến.',
        )

    upload_root = Path(settings.UPLOAD_DIR)
    target_dir = upload_root / subdir
    target_dir.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid4().hex}_{_sanitize_name(Path(file.filename).stem)}{ext}"
    target_path = target_dir / stored_name

    size = 0
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    with target_path.open('wb') as buffer:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                buffer.close()
                target_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'Tệp vượt quá dung lượng cho phép ({settings.MAX_UPLOAD_SIZE_MB} MB).',
                )
            buffer.write(chunk)

    return {
        'file_name': file.filename,
        'file_url': f'/uploads/{subdir}/{stored_name}',
        'content_type': file.content_type,
        'size': size,
    }


def delete_local_upload(file_url: str | None) -> None:
    if not file_url or not file_url.startswith('/uploads/'):
        return

    settings = get_settings()
    rel = file_url[len('/uploads/'):].lstrip('/')
    path = Path(settings.UPLOAD_DIR) / rel
    try:
        path.unlink(missing_ok=True)
        # remove empty parent folders up to upload root
        upload_root = Path(settings.UPLOAD_DIR).resolve()
        current = path.parent
        while current.exists() and current != upload_root:
            try:
                current.rmdir()
            except OSError:
                break
            current = current.parent
    except OSError:
        pass

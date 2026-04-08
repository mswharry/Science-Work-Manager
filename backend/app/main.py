from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.database import create_all_tables

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def bootstrap_database() -> None:
    create_all_tables()


upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=upload_dir), name='uploads')


@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Science Work Manager API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./science_work_manager.db"

    SECRET_KEY: str = Field(default="change_me_in_production", min_length=16)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    ADMIN_EMAIL: str = "admin@swm.local"
    ADMIN_PASSWORD: str = "Admin@123456"
    ADMIN_FULL_NAME: str = "System Admin"
    ADMIN_DEPARTMENT: str = "Faculty of Information Security"


@lru_cache
def get_settings() -> Settings:
    return Settings()


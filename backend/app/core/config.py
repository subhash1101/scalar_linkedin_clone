from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    SECRET_KEY: str = "super-secret-key-change-in-production-minimum-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "sqlite:///./linkedin.db"
    UPLOAD_DIR: str = "uploads"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()

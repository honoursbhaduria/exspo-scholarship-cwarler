import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://honours@/scholarship_db"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3.2"
    SNAPSHOT_DIR: str = str(BASE_DIR / "storage" / "snapshots")
    VERIFIED_CONFIDENCE_THRESHOLD: float = 95.0
    EXPIRING_SOON_DAYS: int = 7
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

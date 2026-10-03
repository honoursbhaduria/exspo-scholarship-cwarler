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
    API_PORT: int = 8080
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    SERPER_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None
    BROWSERLESS_API_KEY: str | None = None

    B2_KEY_ID: str | None = None
    B2_APPLICATION_KEY: str | None = None
    B2_BUCKET_NAME: str | None = None
    B2_BUCKET_ID: str | None = None
    B2_S3_ENDPOINT: str | None = None

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def sync_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg2://", 1)
        return url

settings = Settings()


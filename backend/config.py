from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Smart Campus ERP API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:!Ayushmanpostgre@localhost:5432/campus_erp"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:!Ayushmanpostgre@localhost:5432/campus_erp"

    # JWT
    SECRET_KEY: str = "campus_erp_super_secret_key_change_in_production_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10

    CORS_ORIGINS: list = [
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost",
        "https://localhost",
        "capacitor://localhost",
        "http://127.0.0.1:8000",
        "*"
    ]

    # Render deployment
    PORT: int = 8000

    # AI - Google Gemini
    GEMINI_API_KEY: str = "AQ.Ab8RN6IeMy0vBTpSzY1FOl_MPxwY2z5Goy0AIVhjUpu5jewhWg"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

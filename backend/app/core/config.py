import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SnapMind AI"
    PROJECT_TAGLINE: str = "Intelligence. On Your PC."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "snapmind_secret_key_change_in_production_arm64_snapdragon_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snapmind.db")
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/documents")
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./storage/models")
    MAX_FILE_SIZE_MB: int = 50
    
    # Snapdragon & Execution
    DEMO_MODE_DEFAULT: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    FORCE_LOCAL_INFERENCE: bool = os.getenv("FORCE_LOCAL_INFERENCE", "true").lower() in ("true", "1", "yes")
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

settings = Settings()

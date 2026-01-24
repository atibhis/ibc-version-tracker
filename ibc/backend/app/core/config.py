from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "IBC Version Tracker"
    DATABASE_URL: str = "postgresql://localhost:5433/ibc_tracker"
    
    # In production, these should be set via environment variables
    POSTGRES_USER: str = "atibhisharma"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"
    POSTGRES_DB: str = "ibc_tracker"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "IBC Version Tracker"
    DATABASE_URL: str = "duckdb:///ibc_data.duckdb"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

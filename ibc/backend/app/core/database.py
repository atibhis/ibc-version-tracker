from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings
from typing import Generator

# Using standard sync driver for now, asyncpg can be used later if needed for full async
# alchemy_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

connect_args = {}
engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    # This will create tables if they don't exist
    # In a production environment, we use Alembic migrations instead
    SQLModel.metadata.create_all(engine)

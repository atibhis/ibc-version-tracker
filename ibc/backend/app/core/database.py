from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings
from typing import Generator

import os

connect_args = {}
if os.environ.get("VERCEL"):
    connect_args["read_only"] = True

engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def init_db():
    # This will create tables if they don't exist
    SQLModel.metadata.create_all(engine)

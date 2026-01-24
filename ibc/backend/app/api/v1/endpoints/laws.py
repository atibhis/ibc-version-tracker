from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.domain import DocumentSource
from app.models.schemas import DocumentSourceRead

router = APIRouter()

@router.get("/", response_model=List[DocumentSourceRead])
async def list_sources(session: Session = Depends(get_session)):
    """List all available law sources."""
    return session.exec(select(DocumentSource)).all()

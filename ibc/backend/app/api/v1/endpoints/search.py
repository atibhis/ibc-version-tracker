from typing import List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.domain import NodeContent, HierarchyNode
from app.models.schemas import NodeContentRead

router = APIRouter()

@router.get("/", response_model=List[NodeContentRead])
async def search_content(
    q: str = Query(..., min_length=3),
    source_code: str = "ibc",
    session: Session = Depends(get_session)
):
    """
    Search across document content.
    For now, uses simple iLIKE search. In production, use Postgres tsvector.
    """
    # Simple search for now
    statement = (
        select(NodeContent)
        .where(NodeContent.raw_content.ilike(f"%{q}%"))
        .limit(20)
    )
    results = session.exec(statement).all()
    return results

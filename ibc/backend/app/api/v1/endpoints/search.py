from typing import List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.core.database import get_session
from app.models.domain import NodeContent, HierarchyNode

router = APIRouter()

@router.get("/")
async def search_all(
    q: str = Query(..., min_length=2),
    source_code: str = "ibc",
    session: Session = Depends(get_session)
):
    """
    Search across section titles (HierarchyNode) and content (NodeContent).
    Returns unique sections that match the query.
    """
    # 1. Search in HierarchyNode labels (Titles)
    title_statement = (
        select(HierarchyNode)
        .options(selectinload(HierarchyNode.parent).selectinload(HierarchyNode.parent))
        .where(HierarchyNode.source_id == source_code)
        .where(HierarchyNode.node_type.in_(["section", "schedule"]))
        .where(HierarchyNode.label.ilike(f"%{q}%"))
        .limit(20)
    )
    title_results = session.exec(title_statement).all()

    # 2. Search in NodeContent (Body)
    content_statement = (
        select(HierarchyNode)
        .options(selectinload(HierarchyNode.parent).selectinload(HierarchyNode.parent))
        .join(NodeContent, HierarchyNode.id == NodeContent.node_id)
        .where(HierarchyNode.source_id == source_code)
        .where(NodeContent.raw_content.ilike(f"%{q}%"))
        .limit(20)
    )
    content_results = session.exec(content_statement).all()

    # Combine and deduplicate by ID
    seen_ids = set()
    combined = []
    
    for node in title_results + content_results:
        if node.id not in seen_ids:
            # Construct context: "Part X > Chapter Y"
            path_parts = []
            curr = node.parent
            while curr:
                path_parts.append(curr.label)
                curr = curr.parent
            
            # Reverse because we went bottom-up
            path_parts.reverse()
            context = " > ".join(path_parts) if path_parts else ""

            combined.append({
                "id": node.id,
                "label": node.label,
                "identifier": node.identifier,
                "node_type": node.node_type,
                "context": context
            })
            seen_ids.add(node.id)

    return combined

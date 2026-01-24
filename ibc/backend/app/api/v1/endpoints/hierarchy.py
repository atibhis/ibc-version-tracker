from typing import List, Optional, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.domain import HierarchyNode, DocumentSource
from app.models.schemas import HierarchyNodeRead, HierarchyNodeWithChildren

router = APIRouter()

@router.get("/{source_code}", response_model=List[HierarchyNodeWithChildren])
async def get_full_hierarchy(
    source_code: str,
    parent_id: Optional[UUID] = None,
    session: Session = Depends(get_session)
):
    """
    Get the full hierarchy for a given document source (e.g., 'ibc').
    Can be filtered by parent_id to get sub-trees.
    """
    source = session.exec(select(DocumentSource).where(DocumentSource.code == source_code)).first()
    if not source:
        raise HTTPException(status_code=404, detail="Document source not found")
    
    # Fetch all nodes for this source in one go to avoid N+1 issues
    all_nodes = session.exec(
        select(HierarchyNode)
        .where(HierarchyNode.source_id == source.id)
        .order_by(HierarchyNode.sort_order)
    ).all()
    
    # Build a lookup map
    nodes_by_parent: Dict[Optional[UUID], List[HierarchyNode]] = {}
    for node in all_nodes:
        p_id = node.parent_id
        if p_id not in nodes_by_parent:
            nodes_by_parent[p_id] = []
        nodes_by_parent[p_id].append(node)
        
    def build_tree_recursive(current_parent_id: Optional[UUID]) -> List[Dict]:
        children = nodes_by_parent.get(current_parent_id, [])
        result = []
        for node in children:
            child_tree = build_tree_recursive(node.id)
            node_dict = {
                "id": str(node.id),
                "node_type": node.node_type,
                "label": node.label,
                "identifier": node.identifier,
                "sort_order": node.sort_order,
                "parent_id": str(node.parent_id) if node.parent_id else None,
                "children": child_tree
            }
            result.append(node_dict)
        return result

    final_tree = build_tree_recursive(parent_id)
    print(f"API: Returning hierarchy tree with {len(final_tree)} root nodes")
    for root in final_tree:
        print(f"API: Root {root['label']} has {len(root['children'])} children")
        
    return final_tree

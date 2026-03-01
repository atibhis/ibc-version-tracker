from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.domain import HierarchyNode, NodeContent, DocumentVersion, DocumentSource
from app.models.schemas import NodeContentRead, DocumentVersionRead, SectionDetailRead

router = APIRouter()

@router.get("/versions/{source_code}", response_model=List[DocumentVersionRead])
async def get_source_versions(source_code: str, session: Session = Depends(get_session)):
    source = session.exec(select(DocumentSource).where(DocumentSource.code == source_code)).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    return session.exec(
        select(DocumentVersion)
        .where(DocumentVersion.source_id == source.id)
        .order_by(DocumentVersion.release_date)
    ).all()

@router.get("/{source_code}/{identifier}", response_model=SectionDetailRead)
async def get_node_details(
    source_code: str,
    identifier: str,
    node_type: str = "section",
    version_code: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    Get details for a specific node (section/schedule), including its available versions
    and the content for the requested version.
    """
    source = session.exec(select(DocumentSource).where(DocumentSource.code == source_code)).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    node = session.exec(
        select(HierarchyNode)
        .where(HierarchyNode.source_id == source.id)
        .where(HierarchyNode.identifier == identifier)
        .where(HierarchyNode.node_type == node_type)
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # Get all available versions for this source
    versions = session.exec(
        select(DocumentVersion)
        .where(DocumentVersion.source_id == source.id)
        .order_by(DocumentVersion.release_date)
    ).all()
    
    # Get content for requested version or the latest one if not specified
    if version_code:
        requested_version = session.exec(
            select(DocumentVersion)
            .where(DocumentVersion.source_id == source.id)
            .where(DocumentVersion.version_code == version_code)
        ).first()
    else:
        # Default to latest version
        requested_version = session.exec(
            select(DocumentVersion)
            .where(DocumentVersion.source_id == source.id)
            .order_by(DocumentVersion.release_date.desc())
        ).first()
    
    if not requested_version:
        # Fallback to base version if requested doesn't exist
        requested_version = session.exec(
            select(DocumentVersion)
            .where(DocumentVersion.source_id == source.id)
            .where(DocumentVersion.is_base == True)
        ).first()

    # Find content for this node at this version
    content = session.exec(
        select(NodeContent)
        .where(NodeContent.node_id == node.id)
        .where(NodeContent.version_id == requested_version.id)
    ).first()
    
    # If content doesn't exist for this specific version, we might want to find the 
    # latest version before or equal to this one.
    if not content:
        content = session.exec(
            select(NodeContent)
            .join(DocumentVersion)
            .where(NodeContent.node_id == node.id)
            .where(DocumentVersion.release_date <= requested_version.release_date)
            .order_by(DocumentVersion.release_date.desc())
        ).first()

    return {
        "node": node,
        "versions": versions,
        "current_content": content
    }

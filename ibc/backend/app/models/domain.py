from datetime import date, datetime
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
import sqlalchemy as sa

class DocumentSource(SQLModel, table=True):
    id: str = Field(primary_key=True)  # e.g., 'ibc'
    code: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    versions: List["DocumentVersion"] = Relationship(back_populates="source")
    nodes: List["HierarchyNode"] = Relationship(back_populates="source")

class DocumentType(SQLModel, table=True):
    id: str = Field(primary_key=True)  # e.g., 'act'
    name: str  # e.g., 'Act', 'Regulation'
    slug: str = Field(unique=True, index=True)

class DocumentVersion(SQLModel, table=True):
    id: str = Field(primary_key=True)  # e.g., 'ibc-201611'
    source_id: str = Field(foreign_key="documentsource.id")
    version_code: str = Field(index=True)  # e.g., '201611'
    release_date: date
    is_base: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    source: DocumentSource = Relationship(back_populates="versions")
    contents: List["NodeContent"] = Relationship(back_populates="version")

class HierarchyNode(SQLModel, table=True):
    id: str = Field(primary_key=True)  # e.g., 'ibc-section-1'
    source_id: str = Field(foreign_key="documentsource.id")
    parent_id: Optional[str] = Field(default=None, foreign_key="hierarchynode.id")
    node_type: str  # e.g., 'part', 'chapter', 'section'
    label: str  # e.g., 'Section 12'
    identifier: str  # e.g., '12'
    sort_order: int = Field(default=0)
    
    source: DocumentSource = Relationship(back_populates="nodes")
    contents: List["NodeContent"] = Relationship(back_populates="node")
    
    # Recursive relationship
    children: List["HierarchyNode"] = Relationship(back_populates="parent")
    parent: Optional["HierarchyNode"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "HierarchyNode.id"}
    )

class NodeContent(SQLModel, table=True):
    id: str = Field(primary_key=True) # e.g. 'ibc-section-1-201611'
    node_id: str = Field(foreign_key="hierarchynode.id")
    version_id: str = Field(foreign_key="documentversion.id")
    raw_content: str  # Markdown
    context_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    node: HierarchyNode = Relationship(back_populates="contents")
    version: DocumentVersion = Relationship(back_populates="contents")

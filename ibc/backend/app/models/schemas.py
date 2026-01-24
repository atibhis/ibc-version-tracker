from datetime import date, datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel

class DocumentSourceRead(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str]

class DocumentTypeRead(BaseModel):
    id: str
    name: str
    slug: str

class DocumentVersionRead(BaseModel):
    id: str
    version_code: str
    release_date: date
    is_base: bool

class HierarchyNodeRead(BaseModel):
    id: str
    node_type: str
    label: str
    identifier: str
    sort_order: int
    parent_id: Optional[str]

class HierarchyNodeWithChildren(HierarchyNodeRead):
    children: List["HierarchyNodeWithChildren"] = []

class NodeContentRead(BaseModel):
    id: str
    node_id: str
    version_id: str
    raw_content: str
    context_data: Dict[str, Any]
    version: DocumentVersionRead

class SectionDetailRead(BaseModel):
    node: HierarchyNodeRead
    versions: List[DocumentVersionRead]
    current_content: Optional[NodeContentRead]

HierarchyNodeWithChildren.model_rebuild()

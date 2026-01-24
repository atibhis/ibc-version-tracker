import sys
import json
import os
from pathlib import Path
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select

# Add parent directory to path so 'app' module can be found
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import engine, init_db
from app.models.domain import DocumentSource, DocumentType, DocumentVersion, HierarchyNode, NodeContent

# Configuration
HIERARCHY_FILE = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/law_hierarchy.json"
CONTENT_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/frontend/public/content"

def to_folder_name(key: str) -> str:
    return key.replace("-", "_")

def ingest_data():
    # Make sure tables exist
    init_db()
    
    with open(HIERARCHY_FILE, "r") as f:
        hierarchy = json.load(f)

    with Session(engine) as session:
        # 1. Seed Document Source
        source = session.exec(select(DocumentSource).where(DocumentSource.code == "ibc")).first()
        if not source:
            source = DocumentSource(
                id="ibc",
                code="ibc",
                name="Insolvency and Bankruptcy Code",
                description="The Insolvency and Bankruptcy Code, 2016"
            )
            session.add(source)
            session.commit()
            session.refresh(source)
        
        # 2. Seed Document Type
        doc_type = session.exec(select(DocumentType).where(DocumentType.slug == "act")).first()
        if not doc_type:
            doc_type = DocumentType(id="act", name="Act", slug="act")
            session.add(doc_type)
        
        # 3. Seed Document Versions
        version_map = {} # code -> version_id
        for v_code, v_info in hierarchy["versions"].items():
            version = session.exec(
                select(DocumentVersion)
                .where(DocumentVersion.source_id == source.id)
                .where(DocumentVersion.version_code == v_code)
            ).first()
            
            if not version:
                is_base = (v_info == "base")
                # Parse date from yyyymm
                year = int(v_code[:4])
                month = int(v_code[4:])
                release_date = date(year, month, 1)
                
                v_id = f"ibc:v:{v_code}"
                version = DocumentVersion(
                    id=v_id,
                    source_id=source.id,
                    version_code=v_code,
                    release_date=release_date,
                    is_base=is_base
                )
                session.add(version)
                session.commit()
                session.refresh(version)
            
            version_map[v_code] = version.id

        # 4. Ingest Hierarchy Recursively
        def process_node(parent_id: Optional[str], node_type: str, identifier: str, label: str, sort_order: int):
            node = session.exec(
                select(HierarchyNode)
                .where(HierarchyNode.source_id == source.id)
                .where(HierarchyNode.parent_id == parent_id)
                .where(HierarchyNode.identifier == identifier)
                .where(HierarchyNode.node_type == node_type)
            ).first()
            
            if not node:
                # Use parent_id in key to ensure uniqueness (e.g. preliminary chapters in different parts)
                n_id = f"ibc:{node_type}:{identifier}"
                if parent_id:
                    # Strip the 'ibc:' prefix from parent for a cleaner slug
                    p_slug = parent_id.replace("ibc:", "")
                    n_id = f"ibc:{p_slug}:{node_type}:{identifier}"
                
                node = HierarchyNode(
                    id=n_id,
                    source_id=source.id,
                    parent_id=parent_id,
                    node_type=node_type,
                    identifier=identifier,
                    label=label,
                    sort_order=sort_order
                )
                session.add(node)
                session.commit()
                session.refresh(node)
            else:
                if node.sort_order != sort_order:
                    node.sort_order = sort_order
                    session.add(node)
            return node

        # Process Parts
        for p_idx, (part_key, part_data) in enumerate(hierarchy["parts"].items()):
            part_node = process_node(None, "part", part_key, part_data["name"], p_idx)
            
            # Process Chapters
            if "chapters" in part_data and part_data["chapters"]:
                for idx, chapter in enumerate(part_data["chapters"]):
                    chap_node = process_node(part_node.id, "chapter", chapter["key"], chapter["name"], idx)
                    
                    # Process Sections in Chapter
                    for s_idx, section_num in enumerate(chapter["sections"]):
                        process_node(chap_node.id, "section", section_num, f"Section {section_num}", s_idx)
            
            # Process Default Sections (parts without chapters)
            if "defaultSections" in part_data:
                node_type = "schedule" if part_key == "schedules" else "section"
                for s_idx, section_num in enumerate(part_data["defaultSections"]):
                    label = f"Schedule {section_num}" if node_type == "schedule" else f"Section {section_num}"
                    process_node(part_node.id, node_type, section_num, label, s_idx)

        session.commit()
        print("Hierarchy ingestion complete.")

        # 5. Ingest Content from Markdown Files
        # Filename pattern: section12_2018-06.md or schedule1_201611.md
        content_path = Path(CONTENT_DIR)
        files_processed = 0
        
        for md_file in content_path.rglob("*.md"):
            stem = md_file.stem # e.g. section12_2018-06
            if "_" not in stem:
                continue
                
            parts = stem.split("_")
            node_info = parts[0] # section12
            raw_v_code = parts[1] # 2018-06 or 201611
            
            # Normalize version code (2018-06 -> 201806)
            v_code = raw_v_code.replace("-", "")
            
            if v_code not in version_map:
                print(f"Skipping {md_file.name}: version {v_code} not in hierarchy")
                continue
            
            # Identify node type and number
            if node_info.startswith("section"):
                n_type = "section"
                n_id = node_info.replace("section", "")
            elif node_info.startswith("schedule"):
                n_type = "schedule"
                n_id = node_info.replace("schedule", "")
            else:
                continue
            
            # Find the node in DB (across all parents since id is unique for that type/identifier combo in our simple model)
            # A more robust search would use the folder path to narrow down parts/chapters
            node = session.exec(
                select(HierarchyNode)
                .where(HierarchyNode.source_id == source.id)
                .where(HierarchyNode.identifier == n_id)
                .where(HierarchyNode.node_type == n_type)
            ).first()
            
            if not node:
                print(f"Skipping {md_file.name}: node {n_type} {n_id} not found in hierarchy")
                continue
            
            # Read content
            with open(md_file, "r") as f:
                content_text = f.read()
            
            # Create NodeContent
            existing_content = session.exec(
                select(NodeContent)
                .where(NodeContent.node_id == node.id)
                .where(NodeContent.version_id == version_map[v_code])
            ).first()
            
            if not existing_content:
                # Structured ID for content: law:section:v:version
                nc_id = f"{node.id}:v:{v_code}"
                new_content = NodeContent(
                    id=nc_id,
                    node_id=node.id,
                    version_id=version_map[v_code],
                    raw_content=content_text,
                    context_data={"file_path": str(md_file.relative_to(CONTENT_DIR))}
                )
                session.add(new_content)
                files_processed += 1
        
        session.commit()
        print(f"Content ingestion complete. Processed {files_processed} files.")

if __name__ == "__main__":
    from typing import Optional
    ingest_data()

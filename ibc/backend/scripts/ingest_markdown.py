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

BASE_DIR = Path(__file__).parent.parent.parent

import argparse

# Configuration
DEFAULT_HIERARCHY = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/law_hierarchy.json"
DEFAULT_CONTENT_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/frontend/public/content"

def ingest_data(source_code: str, law_name: str, hierarchy_path: str, content_path: str, update_existing: bool = False):
    # Make sure tables exist
    init_db()
    
    with open(hierarchy_path, "r") as f:
        hierarchy = json.load(f)

    with Session(engine) as session:
        # 1. Seed Document Source
        source = session.exec(select(DocumentSource).where(DocumentSource.code == source_code)).first()
        if not source:
            source = DocumentSource(
                id=source_code,
                code=source_code,
                name=law_name,
                description=f"Automated registry for {law_name}"
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
        for v_code, v_data in hierarchy["versions"].items():
            # v_code is A0, A1, etc.
            v_id = f"{source_code}.{v_code}"
            version = session.get(DocumentVersion, v_id)
            
            if not version:
                is_base = (v_code == "A0")
                # Parse date from yyyymm
                v_date_str = v_data["date"]
                year = int(v_date_str[:4])
                month = int(v_date_str[4:])
                release_date = date(year, month, 1)
                
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
            # Compact ID format: source_code.P1.C1.S1
            # identifier is already P1, C1, S1 etc.
            
            # Prefix types for ID readability
            prefix = ""
            if node_type == "part": prefix = "" # already has P
            elif node_type == "chapter": prefix = "" # already has C
            elif node_type == "section": prefix = "S"
            elif node_type == "schedule": prefix = "SCH"
            
            node_slug = f"{prefix}{identifier}"
            if parent_id:
                n_id = f"{parent_id}.{node_slug}"
            else:
                n_id = f"{source_code}.{node_slug}"

            node = session.get(HierarchyNode, n_id)
            
            if not node:
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
                if node.sort_order != sort_order or node.label != label or node.node_type != node_type:
                    node.sort_order = sort_order
                    node.label = label
                    node.node_type = node_type
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
                    for s_idx, s_item in enumerate(chapter["sections"]):
                        if isinstance(s_item, dict):
                            s_num = s_item["id"]
                            s_label = f"Section {s_num}: {s_item['name']}"
                        else:
                            s_num = s_item
                            s_label = f"Section {s_num}"
                        process_node(chap_node.id, "section", s_num, s_label, s_idx)
            
            # Process Default Sections (parts without chapters)
            if "defaultSections" in part_data:
                node_type = "schedule" if part_key == "SCH" else "section"
                for s_idx, s_item in enumerate(part_data["defaultSections"]):
                    prefix = "Schedule" if node_type == "schedule" else "Section"
                    if isinstance(s_item, dict):
                        s_num = s_item["id"]
                        s_label = f"{prefix} {s_num}: {s_item['name']}"
                    else:
                        s_num = s_item
                        s_label = f"{prefix} {s_num}"
                    process_node(part_node.id, node_type, s_num, s_label, s_idx)

        session.commit()
        print(f"Hierarchy ingestion for {source_code} complete.")

        # 5. Ingest Content from Markdown Files
        files_processed = 0
        p_content = Path(content_path)
        
        for md_file in p_content.rglob("*.md"):
            stem = md_file.stem
            if "_" not in stem: continue
                
            parent_dir = md_file.parent.name # P1, SCH, C1 etc.
            p_parts = stem.split("_")
            node_info = p_parts[0] 
            raw_v_code = p_parts[1]
            
            v_code = raw_v_code.replace("-", "")
            if v_code not in version_map: continue
            
            if node_info.startswith("S") and not node_info.startswith("SCH"):
                n_type = "section"
                n_id_val = node_info[1:]
            elif node_info.startswith("SCH"):
                n_type = "schedule"
                n_id_val = node_info[3:]
            else:
                continue
            
            # Find the node in DB for this source
            # More specific query using part/chapter hints from path if needed
            statement = select(HierarchyNode).where(
                HierarchyNode.source_id == source.id,
                HierarchyNode.identifier == n_id_val,
                HierarchyNode.node_type == n_type
            )
            
            # If parent_dir is like P1, SCH, we can filter by ID containing that
            if parent_dir.startswith("P") or parent_dir == "SCH":
                statement = statement.where(HierarchyNode.id.contains(f".{parent_dir}."))
            
            node = session.exec(statement).first()
            
            if not node: continue
            
            # Create NodeContent
            v_id = version_map[v_code]
            # Content ID: ibc.P2.C2.S10.A0
            nc_id = f"{node.id}.{v_code}"
            
            existing_content = session.get(NodeContent, nc_id)
            with open(md_file, "r") as f:
                content_text = f.read()

            if not existing_content:
                new_content = NodeContent(
                    id=nc_id,
                    node_id=node.id,
                    version_id=v_id,
                    raw_content=content_text,
                    context_data={"file_path": str(md_file.relative_to(content_path))}
                )
                session.add(new_content)
                files_processed += 1
            elif update_existing:
                if existing_content.raw_content != content_text:
                    existing_content.raw_content = content_text
                    session.add(existing_content)
                    files_processed += 1
        
        session.commit()
        print(f"Content ingestion complete for {source_code}. Processed {files_processed} files.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Law Hierarchy and Content")
    parser.add_argument("--source", default="ibc", help="Code for the law (e.g. ibc, constitution)")
    parser.add_argument("--name", default="Insolvency and Bankruptcy Code", help="Full name of the law")
    parser.add_argument("--hierarchy", default=DEFAULT_HIERARCHY, help="Path to law_hierarchy.json")
    parser.add_argument("--content", default=BASE_DIR / "content", help="Path to markdown content folder")
    parser.add_argument("--update", action="store_true", help="Update existing content in database if file has changed")
    parser.add_argument("--reset", action="store_true", help="Reset hierarchy and content tables before ingestion")
    
    args = parser.parse_args()
    
    if args.reset:
        from app.core.database import engine
        from sqlmodel import text
        with Session(engine) as session:
            session.execute(text("DELETE FROM nodecontent"))
            session.execute(text("DELETE FROM hierarchynode"))
            session.execute(text("DELETE FROM documentversion"))
            session.commit()
        print("Reset hierarchy and content tables.")

    ingest_data(args.source, args.name, args.hierarchy, str(args.content), args.update)

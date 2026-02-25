
import os
import re
import pymupdf4llm
from pathlib import Path
from tqdm import tqdm

# Configuration
PDF_SOURCE_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc_rules"
MARKDOWN_OUTPUT_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/RULES"

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def filter_hindi(text):
    """
    Filters out lines containing:
    1. Significant Hindi characters (Devanagari unicode range).
    2. Mojibake/Legecy fonts (High ratio of extended ASCII characters).
    3. Known garbage patterns.
    """
    filtered_lines = []
    
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            filtered_lines.append(line)
            continue

        # 1. Unicode Hindi Filter
        # Heuristic: If line has > 3 Hindi characters, drop it.
        if len(re.findall(r'[\u0900-\u097F]', line)) > 3:
            continue
            
        # 2. Mojibake / Legacy Font Filter
        # Count extended ASCII characters (char code > 127) and suspicious symbols (ª, ö, etc.)
        non_ascii = len([c for c in stripped if ord(c) > 127])
        total = len(stripped)
        ratio = non_ascii / total if total > 0 else 0
        
        # Heuristic: If > 10% of the line is extended ASCII, it's likely garbage
        # OR if it contains specific known noise markers
        if ratio > 0.1 or 'ö' in stripped or 'ª' in stripped:
             continue
             
        # 3. Known Prefix Filter / Artifacts
        if stripped.startswith("jftLV") or "Hkkx" in stripped or "xxxGID" in stripped:
             continue

        # 4. Legacy Hindi ASCII Patterns (Kruti Dev / Devlys)
        # Matches patterns like [k.M, j.k, izk, vlk common in these fonts
        if re.search(r'\[k\.M|j\.k|izk|vlk|jkti|mi&', stripped):
             continue

        # 5. Empty Table Filter
        # Remove lines that are just table dividers without content typically found in bad OCR
        # Catches |---|---| with any number of columns
        if re.match(r'^\|(-+\|)+$', stripped):
             continue
            
        filtered_lines.append(line)
        
    return "\n".join(filtered_lines)

def process_pdf(pdf_path, output_dir):
    filename = os.path.basename(pdf_path)
    base_name = os.path.splitext(filename)[0]
    
    # Normalize filename for valid URL/Path usage (replace spaces/brackets with underscores)
    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', base_name)
    safe_name = re.sub(r'_+', '_', safe_name).strip('_')
    
    output_path = os.path.join(output_dir, f"{safe_name}.md")
    
    try:
        # 1. Extract to Markdown using PyMuPDF4LLM
        md_content = pymupdf4llm.to_markdown(pdf_path)
        
        # 2. Filter Hindi
        cleaned_content = filter_hindi(md_content)
        
        # 3. Add Metadata Header
        final_content = f"""---
source_file: "{filename}"
created_at: {os.path.getctime(pdf_path)}
node_type: "rule"
---

# {base_name}

{cleaned_content}
"""
        
        # 4. Save
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_content)
            
        return True, output_path
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")
        return False, str(e)

def run_pipeline():
    ensure_dir(MARKDOWN_OUTPUT_DIR)
    
    pdf_files = [f for f in os.listdir(PDF_SOURCE_DIR) if f.lower().endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDFs in {PDF_SOURCE_DIR}")
    
    success_count = 0
    
    for pdf_file in tqdm(pdf_files, desc="Processing PDFs"):
        full_path = os.path.join(PDF_SOURCE_DIR, pdf_file)
        success, result = process_pdf(full_path, MARKDOWN_OUTPUT_DIR)
        if success:
            success_count += 1
            
    print(f"\nPipeline Complete. {success_count}/{len(pdf_files)} files successfully processed.")
    print(f"Output directory: {MARKDOWN_OUTPUT_DIR}")

if __name__ == "__main__":
    run_pipeline()

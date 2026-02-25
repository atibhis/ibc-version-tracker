
import os
import re
import pymupdf4llm
import yaml
from pathlib import Path
from tqdm import tqdm
from spellchecker import SpellChecker

# Configuration
SOURCE_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/IBBI_DOCS"
OUTPUT_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/LEGAL_FRAMEWORK_MD"

# Initialize SpellChecker
spell = SpellChecker()

class OCRScorer:
    def __init__(self, text):
        self.text = text
        self.lines = text.splitlines()
        self.total_lines = len(self.lines)
        self.words = re.findall(r'\b[a-zA-Z]{3,}\b', text)
        self.total_words = len(self.words)

    def get_dictionary_match_rate(self):
        if not self.total_words:
            return 0
        unique_words = set(w.lower() for w in self.words)
        known_set = spell.known(unique_words)
        matches = [w for w in self.words if w.lower() in known_set]
        return (len(matches) / self.total_words) * 100

    def get_special_char_ratio(self):
        # Count non-alphanumeric, non-whitespace, non-punctuation chars typically used in tables
        # Allow md markers like * # > `
        chars = re.sub(r'[\w\s\.,;:\(\)\-\[\]|*#>`]', '', self.text)
        if not self.text:
            return 0
        return (len(chars) / len(self.text)) * 100

    def calculate_score(self, rejection_ratio):
        # Base Score: Starts at 100
        score = 100
        
        # 1. Penalty for low dictionary match rate
        match_rate = self.get_dictionary_match_rate()
        if match_rate < 85:
            score -= (85 - match_rate) * 1.5
            
        # 2. Penalty for special char noise
        noise_ratio = self.get_special_char_ratio()
        if noise_ratio > 2:
            score -= (noise_ratio - 2) * 10
            
        # 3. Penalty for rejected lines (Hindi/Mojibake filter)
        score -= rejection_ratio * 100
        
        return max(0, min(100, round(score, 2)))

def filter_content(text):
    filtered_lines = []
    rejected_count = 0
    total_count = 0
    
    for line in text.splitlines():
        total_count += 1
        stripped = line.strip()
        if not stripped:
            filtered_lines.append(line)
            continue

        # Hindi/Mojibake Detection
        # 1. Unicode Hindi Character Density
        hindi_chars = len(re.findall(r'[\u0900-\u097F]', line))
        if hindi_chars > (len(stripped) * 0.1): # More than 10% Hindi
            rejected_count += 1
            continue
            
        # 2. Mojibake Ratio
        non_ascii = len([c for c in stripped if ord(c) > 127])
        total = len(stripped)
        ratio = non_ascii / total if total > 0 else 0
        if ratio > 0.1 or 'ö' in stripped or 'ª' in stripped:
             rejected_count += 1
             continue
             
        # 3. Kruti Dev / Legacy Patterns
        if re.search(r'\[k\.M|j\.k|izk|vlk|jkti|mi&', stripped):
             rejected_count += 1
             continue

        filtered_lines.append(line)
        
    rejection_ratio = rejected_count / total_count if total_count > 0 else 0
    return "\n".join(filtered_lines), rejection_ratio

def process_file(pdf_path, output_root):
    filename = os.path.basename(pdf_path)
    
    # Determine type and subdirectory
    type_label = "unknown"
    if "_notification_" in filename: type_label = "NOTIFICATIONS"
    elif "_circular_" in filename: type_label = "CIRCULARS"
    elif "_regulation_" in filename: type_label = "REGULATIONS"
    elif "_rule_" in filename: type_label = "RULES"
    
    dest_dir = os.path.join(output_root, type_label)
    Path(dest_dir).mkdir(parents=True, exist_ok=True)
    
    base_name = os.path.splitext(filename)[0]
    output_path = os.path.join(dest_dir, f"{base_name}.md")

    try:
        # Extract using 'lines' strategy which is better for Gazette borders
        # pymupdf-layout is used automatically if installed
        raw_md = pymupdf4llm.to_markdown(pdf_path, table_strategy="lines")
        
        # Filter
        cleaned_md, rejection_ratio = filter_content(raw_md)
        
        # Score
        scorer = OCRScorer(cleaned_md)
        score = scorer.calculate_score(rejection_ratio)
        
        # Meta
        metadata = {
            "source_file": filename,
            "type": type_label.lower().rstrip('s'),
            "ocr_quality_score": score,
            "rejection_ratio": round(rejection_ratio, 4)
        }
        
        final_content = f"---\n{yaml.dump(metadata)}---\n\n{cleaned_md}"
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_content)
            
        return True, score
    except Exception as e:
        return False, str(e)

def run_pipeline():
    pdf_files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDFs. Starting OCR Pipeline...")
    
    results = []
    for pdf_file in tqdm(pdf_files):
        path = os.path.join(SOURCE_DIR, pdf_file)
        success, res = process_file(path, OUTPUT_DIR)
        if success:
            results.append(res)
            
    if results:
        avg_score = sum(results) / len(results)
        print(f"\nPipeline Complete. Average Quality Score: {avg_score:.2f}/100")
        print(f"Processed {len(results)} files. Check {OUTPUT_DIR} for results.")

if __name__ == "__main__":
    run_pipeline()

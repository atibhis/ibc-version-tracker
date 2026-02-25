
import os
import re

def analyze_garbage(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    print(f"Analyzing {os.path.basename(file_path)}...")
    
    clean_lines = []
    removed_count = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            clean_lines.append(line)
            continue
            
        # 1. Check for basic Unicode Hindi (Devanagari)
        if re.search(r'[\u0900-\u097F]', line):
            print(f"[REMOVED-HINDI] {stripped[:50]}...")
            removed_count += 1
            continue
            
        # 2. Check for "Mojibake" / Legacy Font Garbage
        # Count extended ASCII characters (char code > 127) and suspicious symbols
        # Common garbage in these files: ª, ö, ź, ®, ¡
        # Valid legal text is mostly ASCII. 
        
        non_ascii = len([c for c in stripped if ord(c) > 127])
        total = len(stripped)
        ratio = non_ascii / total if total > 0 else 0
        
        # Heuristic: If > 10% of the line is extended ASCII, it's likely garbage
        # ALSO check for common garbage patterns like repeated 'ö' 
        if ratio > 0.1 or 'ö' in stripped or 'ª' in stripped:
             print(f"[REMOVED-JUNK]  {stripped[:50]}...")
             removed_count += 1
             continue
             
        # 3. Check for specific known noise prefixes
        if stripped.startswith("jftLV") or "Hkkx" in stripped: # Common start of Hindi lines in junk fonts
             print(f"[REMOVED-KNOWN] {stripped[:50]}...")
             removed_count += 1
             continue
             
        clean_lines.append(line)

    print(f"Total removed: {removed_count} lines")
    return "".join(clean_lines)

if __name__ == "__main__":
    # Test on the file the user flagged
    target_file = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/RULES/The_Insolvency_and_Bankruptcy_Insolvency_and_Liquidation_Proceedings_of_Financial_Service_Providers_and_Application_to_Adjudicating_Authority_Rules.md"
    
    # Also test on the one we viewed earlier if that one doesn't exist
    fallback = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/RULES/The_Companies_Transfer_of_Pending_Proceedings_Second_Amendment_Rules_2017_1_48_MB.md"
    
    file_to_test = target_file if os.path.exists(target_file) else fallback
    
    if os.path.exists(file_to_test):
        cleaned = analyze_garbage(file_to_test)
        
        # Save validation output
        with open("scripts/cleaned_sample.md", "w") as f:
            f.write(cleaned)
    else:
        print(f"Could not find file: {file_to_test}")

import os
import re

def cleanup_markdown_files(root_dir):
    pattern = re.compile(r'^#\s+Section\s+\w+', re.IGNORECASE)
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                if lines and pattern.match(lines[0].strip()):
                    # Remove the first line (the header)
                    new_lines = lines[1:]
                    # Also remove leading empty lines if any
                    while new_lines and not new_lines[0].strip():
                        new_lines.pop(0)
                        
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    print(f"Cleaned: {file_path}")

if __name__ == "__main__":
    content_dir = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content"
    cleanup_markdown_files(content_dir)

import os
import re
import sys

def format_clause_content(line):
    # Bold definitions: (1) "Term" -> (1) **"Term"**
    # Only if it's at the start of a clause or list item
    line = re.sub(r'(\(\w+\))\s+"([^"]+)"', r'\1 **"\2"**', line)
    # Also handle list items: * (a) "Term" -> * (a) **"Term"**
    line = re.sub(r'(\* \(\w+\))\s+"([^"]+)"', r'\1 **"\2"**', line)
    return line

def format_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read().strip()

    # Handle leading/trailing quotes
    if content.startswith('"') and content.endswith('"'):
        content = content[1:-1].strip()

    lines = [line.rstrip() for line in content.splitlines()]
    if not lines:
        return

    new_lines = []
    
    # 1. Header handling
    header_pattern = re.compile(r'^(\d+\.|SCH\d+\.)(.*)')
    match = header_pattern.match(lines[0])
    if match:
        header_num = match.group(1).strip()
        header_rest = match.group(2).strip()
        
        # If the rest starts with a clause "(1)", separate them
        if header_rest.startswith('(1)'):
            new_lines.append(header_num)
            new_lines.append("")
            remaining_lines = [header_rest] + lines[1:]
        else:
            # Keep as is (like "5. In this part...") but ensure blank line after
            new_lines.append(lines[0])
            new_lines.append("")
            remaining_lines = lines[1:]
    else:
        remaining_lines = lines

    # 2. Process clauses
    current_list_type = None # None, 'top', 'sub', 'nested'
    
    for i, line in enumerate(remaining_lines):
        clean_line = line.strip()
        if not clean_line:
            continue
            
        # Top-level clause: (1), (2), (3) or (a), (b), (c) at start of line
        is_top_clause = re.match(r'^\(\w+\)', clean_line)
        # Sub bullet: * (a), * (b)
        is_sub_bullet = re.match(r'^\* \(\w+\)', clean_line)
        # Nested bullet: ** (i), ** (ii)
        is_nested_bullet = re.match(r'^\*\* \(\w+\)', clean_line)
        # Simple bullet: * Term
        is_simple_bullet = re.match(r'^\* ', clean_line) and not is_sub_bullet
        
        # Continuation of previous line (starts with space or not a clause/bullet)
        is_continuation = not (is_top_clause or is_sub_bullet or is_nested_bullet or is_simple_bullet) and line.startswith(' ')

        if is_top_clause:
            # Blank line before new top-level clause
            if new_lines and new_lines[-1] != "":
                new_lines.append("")
            new_lines.append(format_clause_content(clean_line))
        elif is_sub_bullet:
            # Sub-bullets don't need blank lines between them
            new_lines.append(format_clause_content(clean_line))
        elif is_nested_bullet:
            new_lines.append(format_clause_content(clean_line))
        elif is_simple_bullet:
            # Normalize simple bullets if needed? S1 has simple bullets for "Provided that"
            # In S5, sub-clauses are * (a). Let's keep * Provided that as is for now.
            new_lines.append(clean_line)
        else:
            # Normal text or continuation
            if is_continuation:
                # Append to last line or keep as is?
                # Section 5 seems to have some wrapped lines but mostly single line per item.
                # Let's just strip and append to previous line if appropriate, or keep on new line.
                new_lines.append(line)
            else:
                # If it's a new paragraph, add blank line
                if new_lines and new_lines[-1] != "" and not new_lines[-1].startswith(' ') and not is_continuation:
                      # Check if previous line ended with colon/comma?
                      if not new_lines[-1].endswith(':') and not new_lines[-1].endswith('—'):
                          new_lines.append("")
                new_lines.append(clean_line)

    # Final cleanup: trim extra blank lines
    final_content = "\n".join(new_lines).strip() + "\n"
    
    # Second pass for spacing (ensure exactly one blank line after header and between top-level clauses)
    # This is hard with simple join, let's use regex
    final_content = re.sub(r'\n{3,}', '\n\n', final_content)

    with open(file_path, 'w') as f:
        f.write(final_content)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python format_markdown.py <file_or_dir>")
        sys.exit(1)
        
    path = sys.argv[1]
    if os.path.isfile(path):
        format_file(path)
    elif os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('.md'):
                    format_file(os.path.join(root, file))

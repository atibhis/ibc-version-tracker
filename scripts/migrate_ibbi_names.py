
import os
import re

BASE_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/LEGAL_FRAMEWORK"
CATEGORIES = {
    "NOTIFICATIONS": "notification",
    "CIRCULARS": "circular",
    "UPDATED": "regulation"
}

def rename_files():
    total_renamed = 0
    for cat_dir, type_label in CATEGORIES.items():
        path = os.path.join(BASE_DIR, cat_dir)
        if not os.path.exists(path):
            continue
            
        print(f"Checking {cat_dir}...")
        for filename in os.listdir(path):
            if not filename.endswith(".pdf"):
                continue
                
            # Current format: {sr_no}_{date}.pdf
            # Target format: {sr_no}_{type}_{date}.pdf
            
            # Check if already renamed (contains the type label)
            if type_label in filename:
                continue
                
            match = re.match(r"^(\d+)_(\d{4}-\d{2}-\d{2})\.pdf$", filename)
            if match:
                sr_no = match.group(1)
                date = match.group(2)
                new_filename = f"{sr_no}_{type_label}_{date}.pdf"
                
                old_path = os.path.join(path, filename)
                new_path = os.path.join(path, new_filename)
                
                os.rename(old_path, new_path)
                print(f"  Renamed: {filename} -> {new_filename}")
                total_renamed += 1
            else:
                print(f"  Skipped (doesn't match pattern): {filename}")

    print(f"\nMigration complete. Renamed {total_renamed} files.")

if __name__ == "__main__":
    rename_files()

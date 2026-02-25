
import os
import yaml
import pandas as pd

REPORT_DIR = "/Users/atibhisharma/Documents/XKDR/IBC/ibc-version-tracker/ibc/content/LEGAL_FRAMEWORK_MD"

def generate_report():
    data = []
    for root, dirs, files in os.walk(REPORT_DIR):
        for file in files:
            if file.endswith(".md"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Extract YAML frontmatter
                    if content.startswith("---"):
                        parts = content.split("---")
                        if len(parts) >= 3:
                            meta = yaml.safe_load(parts[1])
                            data.append({
                                "File": file,
                                "Category": meta.get("type", "unknown"),
                                "Score": meta.get("ocr_quality_score", 0),
                                "Rejection": meta.get("rejection_ratio", 0)
                            })
    
    if not data:
        print("No markdown files found to report on.")
        return

    df = pd.DataFrame(data)
    print("\n--- OCR Quality Summary ---")
    print(df.groupby("Category")["Score"].describe()[["count", "mean", "min", "max"]])
    
    print("\n--- Bottom 10 Low Quality Files ---")
    print(df.sort_values("Score").head(10)[["File", "Score", "Rejection"]])
    
    # Save report
    df.to_csv("ocr_quality_report.csv", index=False)
    print("\nDetailed report saved to ocr_quality_report.csv")

if __name__ == "__main__":
    generate_report()

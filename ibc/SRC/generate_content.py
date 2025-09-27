import os
import json
import shutil

# Load JSON from file
with open("law_hierarchy.json", "r") as f:
    data = json.load(f)

# Define amendment dates (YYYYMM format)
amendment_dates = {
    "201611": "base",  # Original November 2016
    "201711": "2017-11",  # November 2017
    "201806": "2018-06",  # June 2018
    "201908": "2019-08",  # August 2019
    "201912": "2019-12",  # December 2019
    "202006": "2020-06",  # June 2020
    "202104": "2021-04",  # April 2021
}

# Create content directory
os.makedirs("content", exist_ok=True)

# Generate markdown files for each part and chapter
for part_key, part in data["parts"].items():
    part_dir = os.path.join("content", part_key.replace("-", "_"))
    os.makedirs(part_dir, exist_ok=True)

    # Handle default sections for parts with no chapters
    if not part["chapters"]:
        for section in part.get("defaultSections", []):
            base_filename = os.path.join(part_dir, f"section{section}_201611.md")
            os.makedirs(os.path.dirname(base_filename), exist_ok=True)
            with open(base_filename, "w") as f:
                f.write(
                    f"# Section {section}\n\nThis is the original content for Section {section} in {part['name']} (November 2016).\n"
                )

    # Handle sections within chapters
    for chapter in part.get("chapters", []):
        chapter_dir = os.path.join(part_dir, chapter["key"].replace("-", "_"))
        os.makedirs(chapter_dir, exist_ok=True)

        # Generate base files for 2016
        for section in chapter["sections"]:
            base_filename = os.path.join(chapter_dir, f"section{section}_201611.md")
            with open(base_filename, "w") as f:
                f.write(
                    f"# Section {section}\n\nThis is the original content for Section {section} in {chapter['name']} under {part['name']} (November 2016).\n"
                )

        # Generate files for amended sections based on versions
        for date, amendments in data["versions"].items():
            if isinstance(amendments, dict) and "sections" in amendments:
                for section in amendments["sections"]:
                    if section in chapter["sections"]:
                        amended_filename = os.path.join(
                            chapter_dir, f"section{section}_{amendment_dates[date]}.md"
                        )
                        with open(amended_filename, "w") as f:
                            f.write(
                                f"# Section {section}\n\nThis is the amended content for Section {section} in {chapter['name']} under {part['name']} ({amendment_dates[date]}).\n"
                            )
            elif date == "201611":  # Base case already handled above
                continue

print("Markdown files generated successfully in the 'content' directory.")

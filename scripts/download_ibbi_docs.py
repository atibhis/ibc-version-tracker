
import requests
from bs4 import BeautifulSoup
import re
import os
from urllib.parse import urljoin
from datetime import datetime

# Configuration
BASE_URL = "https://ibbi.gov.in"
OUTPUT_DIR = "ibc/content/LEGAL_FRAMEWORK"
URLS = {
    "UPDATED": "https://ibbi.gov.in/legal-framework/updated",
    "CIRCULARS": "https://ibbi.gov.in/legal-framework/circulars",
    "NOTIFICATIONS": "https://ibbi.gov.in/legal-framework/notifications",
    "RULES": "https://ibbi.gov.in/legal-framework/rules"
}

# Regex Patterns
ONCLICK_PATTERN = re.compile(r"newwindow1\('([^']+)'\)")
FILE_NO_PATTERN = re.compile(r"(IBBI/[A-Za-z0-9/\-]+|No\. [A-Za-z0-9/\-]+)")

def clean_filename(text):
    # Remove invalid chars and limit length
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '_', text).strip()
    return text[:100]

def parse_date(date_str):
    try:
        # Expected format "07 Jul, 2025"
        dt = datetime.strptime(date_str.strip(), "%d %b, %Y")
        return dt.strftime("%Y-%m-%d")
    except:
        return clean_filename(date_str)

def download_file(url, filepath):
    print(f"Attempting to download: {url} -> {filepath}")
    if os.path.exists(filepath):
        print(f"Skipping (exists): {filepath}")
        return
        
    try:
        response = requests.get(url, stream=True, verify=False, timeout=30)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully downloaded: {filepath}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def scrape_category(category, url):
    print(f"\n--- Scraping {category} from {url} ---")
    dest_dir = os.path.join(OUTPUT_DIR, category)
    os.makedirs(dest_dir, exist_ok=True)
    
    try:
        # Get first page to find total records
        response = requests.get(url, verify=False, timeout=30)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for "Total Records : 81"
        total_records = 1
        total_text_elem = soup.find(text=re.compile(r'Total Records\s*:\s*\d+'))
        if total_text_elem:
            match = re.search(r'Total Records\s*:\s*(\d+)', total_text_elem)
            if match:
                total_records = int(match.group(1))
        
        # 20 records per page
        total_pages = (total_records + 19) // 20
        print(f"Total Records: {total_records}, Total Pages: {total_pages}")

        for page in range(1, total_pages + 1):
            page_url = f"{url}?page={page}"
            print(f"Scraping Page {page}: {page_url}")
            
            page_res = requests.get(page_url, verify=False, timeout=30)
            page_soup = BeautifulSoup(page_res.content, 'html.parser')
            table = page_soup.find('table')
            if not table:
                print(f"No table found on page {page}.")
                continue

            rows = table.find_all('tr')[1:] # Skip header
            for row in rows:
                cols = row.find_all(['td', 'th'])
                if len(cols) < 3:
                    continue
                    
                sr_no = cols[0].get_text(strip=True)
                date_text = cols[1].get_text(strip=True)
                
                # Determine where the link is
                # Notifications (3 cols) -> col 3 (index 2)
                # Updated/Circulars (5 cols) -> col 4 (index 3)
                link_col_idx = 2 if len(cols) == 3 else 3
                if len(cols) >= 4:
                    link_col_idx = 3 # English PDF column
                
                target_col = cols[link_col_idx]
                
                # Find Link
                a_tag = target_col.find('a')
                if not a_tag:
                     # Fallback: check all columns for an anchor if specific one fails
                     for col in cols:
                         a_tag = col.find('a')
                         if a_tag: break
                     if not a_tag: continue
                
                # Extract PDF Path
                onclick = a_tag.get('onclick', '')
                match = ONCLICK_PATTERN.search(onclick)
                if not match:
                    pdf_url = a_tag.get('href')
                    if not pdf_url or 'javascript' in pdf_url:
                        continue
                else:
                    pdf_url = match.group(1)
                    
                full_url = urljoin(BASE_URL, pdf_url)
                
                # Generate Filename
                date_formatted = parse_date(date_text)
                clean_sno = clean_filename(sr_no)
                
                # Determine type label
                type_label = category.lower()
                if type_label == "updated":
                    type_label = "regulation"
                elif type_label.endswith("s"): # circulars -> circular, notifications -> notification
                    type_label = type_label[:-1]

                filename = f"{clean_sno}_{type_label}_{date_formatted}.pdf"
                filepath = os.path.join(dest_dir, filename)
                
                download_file(full_url, filepath)
            
    except Exception as e:
        print(f"Error scraping {category}: {e}")
            
    except Exception as e:
        print(f"Error scraping {category}: {e}")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    for cat, url in URLS.items():
        scrape_category(cat, url)

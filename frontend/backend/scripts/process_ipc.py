import json
import pandas as pd
import os
from tqdm import tqdm

# --- CONFIGURATION ---
INPUT_FILE = "data/raw/crpc.json"  # Make sure filename matches exactly
OUTPUT_FILE = "data/processed/crpc_clean.csv"

def load_data(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Error: File not found at {filepath}")
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def process_ipc(json_data):
    processed_rows = []
    
    # The JSON structure is usually: { "structure": { "chapters": [...] } } 
    # OR just a list of chapters. Let's handle both.
    
    chapters = []
    if isinstance(json_data, dict):
        # specific to civictech-india structure
        if "structure" in json_data:
            chapters = json_data["structure"].get("chapters", [])
        elif "chapters" in json_data:
            chapters = json_data["chapters"]
    elif isinstance(json_data, list):
        chapters = json_data

    print(f"🔍 Found {len(chapters)} chapters. Processing...")

    for chapter in tqdm(chapters):
        chapter_num = chapter.get("number", "")
        chapter_title = chapter.get("title", "")
        
        sections = chapter.get("sections", [])
        
        for section in sections:
            # Extract fields
            sec_num = section.get("number", "")
            sec_title = section.get("title", "")
            sec_desc = section.get("description", "")
            
            # --- CRITICAL STEP: HIERARCHY AWARENESS ---
            # The AI needs to know that "Section 302" belongs to "Chapter XVI: Offences Affecting the Human Body"
            # We combine them into a single "Context String"
            
            full_context_text = (
                f"Law: Indian Penal Code (IPC) 1860\n"
                f"Chapter: {chapter_num} - {chapter_title}\n"
                f"Section: {sec_num}\n"
                f"Title: {sec_title}\n"
                f"Content: {sec_desc}"
            )
            
            # Create a structured row
            processed_rows.append({
                "law_name": "IPC",
                "section_number": sec_num,
                "section_title": sec_title,
                "chapter_number": chapter_num,
                "chapter_title": chapter_title,
                "original_text": sec_desc,
                "rag_text": full_context_text,  # <--- THIS is what goes into the Vector DB
                "url": f"https://indiankanoon.org/doc/{sec_num}/" # Placeholder
            })

    return pd.DataFrame(processed_rows)

def main():
    # 1. Create output directory if it doesn't exist
    os.makedirs("data/processed", exist_ok=True)

    # 2. Load
    data = load_data(INPUT_FILE)
    if not data:
        return

    # 3. Process
    df = process_ipc(data)
    
    # 4. Save
    print(f"✅ Processed {len(df)} sections.")
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"💾 Saved to {OUTPUT_FILE}")
    
    # 5. Preview
    print("\n--- PREVIEW (First 2 Rows) ---")
    print(df[['section_number', 'section_title', 'rag_text']].head(2))

if __name__ == "__main__":
    main()
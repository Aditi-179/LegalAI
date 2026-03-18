import os
import json
from sqlalchemy.orm import Session
import sys

# 1. Add the backend directory to the path so we can import 'app'
# This ensures Python knows where to find database.py and models.py
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.database import SessionLocal
from app.models import LegalDocument

# 2. Point exactly to where your JSON files are located based on your new path
# We are currently in: LegalAI/backend/app/scripts/load_json.py
# The data is in:      LegalAI/backend/app/scripts/data/raw/
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_DIR = os.path.join(CURRENT_DIR, "data", "raw")

def process_and_load_json(filepath: str, db: Session):
    filename = os.path.basename(filepath)
    # Extract Act Name (e.g., 'ipc.json' -> 'IPC')
    act_name = filename.replace('.json', '').upper() 
    
    print(f"\n📥 Processing {act_name} from {filename}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # The CivicTech JSON usually puts chapters inside a "structure" key, 
        # or just as a list at the root. We handle both.
        chapters = []
        if isinstance(data, dict):
            if "structure" in data:
                chapters = data["structure"].get("chapters", [])
            elif "chapters" in data:
                chapters = data["chapters"]
        elif isinstance(data, list):
            chapters = data

        if not chapters:
            print(f"⚠️ Warning: Could not find chapters in {filename}. Skipping.")
            return

        records_inserted = 0

        # Loop through the JSON hierarchy
        for chapter in chapters:
            chap_num = str(chapter.get("number", ""))
            chap_title = str(chapter.get("title", ""))
            sections = chapter.get("sections", [])
            
            for section in sections:
                sec_num = str(section.get("number", ""))
                sec_title = str(section.get("title", ""))
                sec_desc = str(section.get("description", ""))
                
                # --- CRITICAL STEP FOR RAG ---
                # We format the text so the AI knows exactly what law it is reading
                full_rag_text = (
                    f"Law/Act: {act_name}\n"
                    f"Chapter: {chap_num} - {chap_title}\n"
                    f"Section: {sec_num}\n"
                    f"Title: {sec_title}\n"
                    f"Content: {sec_desc}"
                )
                
                # Create the database record
                db_record = LegalDocument(
                    act_name=act_name,
                    section_number=sec_num,
                    section_title=sec_title,
                    rag_text=full_rag_text
                )
                
                db.add(db_record)
                records_inserted += 1

                # Commit every 100 rows to avoid memory spikes
                if records_inserted % 100 == 0:
                    db.commit()

        # Commit any remaining rows for this file
        db.commit()
        print(f"✅ Successfully loaded {records_inserted} sections for {act_name}!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error loading {filename}: {str(e)}")

def main():
    if not os.path.exists(JSON_DIR):
        print(f"❌ Error: The directory does not exist: {JSON_DIR}")
        print("Please ensure your JSON files are exactly in: backend/app/scripts/data/raw/")
        return

    print(f"🚀 Starting Direct JSON Ingestion from: {JSON_DIR}")
    
    # Open the database connection
    db = SessionLocal()
    
    try:
        # Find all .json files in the directory
        json_files = [f for f in os.listdir(JSON_DIR) if f.endswith('.json')]
        
        if not json_files:
            print(f"⚠️ No JSON files found in {JSON_DIR}")
            return
            
        # Process each file one by one
        for file in json_files:
            filepath = os.path.join(JSON_DIR, file)
            process_and_load_json(filepath, db)
            
        print("\n🎉 ALL LAWS LOADED SUCCESSFULLY into Supabase!")
        
    finally:
        # Always close the connection
        db.close()

if __name__ == "__main__":
    main()
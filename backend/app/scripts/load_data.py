import json
import os
import sys

from sqlalchemy import text
from sqlalchemy.orm import Session

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.db.session import SessionLocal
from app.models import LegalDocument

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_DIR = os.path.join(CURRENT_DIR, "data", "raw")


def extract_all_sections(data, current_chapter="Unknown"):
    sections = []

    if isinstance(data, list):
        for item in data:
            sections.extend(extract_all_sections(item, current_chapter))
    elif isinstance(data, dict):
        chap = str(data.get("chapter", data.get("chapter_title", current_chapter)))
        desc = str(data.get("description", data.get("desc", data.get("section_desc", data.get("text", ""))))).strip()

        if desc and desc.lower() != "none":
            sec_num = str(data.get("number", data.get("section", data.get("Section", data.get("id", ""))))).strip()
            title = str(data.get("title", data.get("section_title", data.get("heading", "")))).strip()
            sections.append(
                {
                    "chapter": chap,
                    "section": sec_num,
                    "title": title,
                    "description": desc,
                }
            )

        for _, value in data.items():
            if isinstance(value, (dict, list)):
                sections.extend(extract_all_sections(value, chap))

    return sections


def process_and_load_json(filepath: str, db: Session):
    filename = os.path.basename(filepath)
    act_name = filename.replace(".json", "").upper()

    print(f"\nProcessing {act_name}...")

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list) and len(data) > 0 and "chapter,section,section_title,section_desc" in data[0]:
            print(f"Detected broken CSV-in-JSON format for {act_name}. Parsing manually...")
            records_inserted = 0
            last_sec_num = "Unknown"
            last_title = "Unknown"

            for item in data:
                val = item.get("chapter,section,section_title,section_desc", "")
                if not val.strip():
                    continue

                parts = val.split(",", 3)
                if len(parts) == 4 and parts[0].isdigit() and parts[1].isdigit():
                    last_sec_num = parts[1].strip()
                    last_title = parts[2].strip().strip('"')
                    desc = parts[3].strip().strip('"')
                else:
                    desc = val.strip().strip('"')

                full_rag_text = f"Law/Act: {act_name}\nSection: {last_sec_num}\nTitle: {last_title}\nContent: {desc}"
                db.add(
                    LegalDocument(
                        act_name=act_name,
                        section_number=last_sec_num,
                        section_title=last_title,
                        rag_text=full_rag_text,
                    )
                )
                records_inserted += 1
                if records_inserted % 100 == 0:
                    db.commit()

            db.commit()
            print(f"Successfully loaded {records_inserted} sections for {act_name}.")
            return

        extracted_sections = extract_all_sections(data)
        if not extracted_sections:
            print(f"Warning: could not find any descriptions/text in {filename}.")
            return

        records_inserted = 0
        for sec in extracted_sections:
            full_rag_text = (
                f"Law/Act: {act_name}\n"
                f"Chapter: {sec['chapter']}\n"
                f"Section: {sec['section']}\n"
                f"Title: {sec['title']}\n"
                f"Content: {sec['description']}"
            )

            db.add(
                LegalDocument(
                    act_name=act_name,
                    section_number=sec["section"],
                    section_title=sec["title"],
                    rag_text=full_rag_text,
                )
            )
            records_inserted += 1

            if records_inserted % 100 == 0:
                db.commit()

        db.commit()
        print(f"Successfully extracted and loaded {records_inserted} sections for {act_name}.")
    except Exception as e:
        db.rollback()
        print(f"Error loading {filename}: {str(e)}")


def main():
    if not os.path.exists(JSON_DIR):
        print(f"Error: directory not found: {JSON_DIR}")
        return

    print("Starting universal JSON ingestion...")
    db = SessionLocal()

    try:
        db.execute(text("TRUNCATE TABLE legal_documents RESTART IDENTITY;"))
        db.commit()
        print("Cleaned old database entries.")

        json_files = [f for f in os.listdir(JSON_DIR) if f.endswith(".json")]
        for file in json_files:
            process_and_load_json(os.path.join(JSON_DIR, file), db)

        print("\nAll JSON laws loaded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

import os
import re
import sys

from sqlalchemy import text
from sqlalchemy.orm import Session

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.db.session import SessionLocal
from app.models import LegalDocument

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(CURRENT_DIR, "data", "processed", "bns_clean.csv")


def load_bns_raw_text(filepath: str, db: Session):
    if not os.path.exists(filepath):
        print(f"Error: file not found at {filepath}")
        return

    print(f"Reading BNS raw text from {filepath}...")

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()

        chunks = re.split(r"(Section \d+[a-zA-Z]*:)", raw_text)
        records_inserted = 0

        for i in range(1, len(chunks) - 1, 2):
            sec_header = chunks[i].strip()
            sec_content = chunks[i + 1].strip()
            sec_num = sec_header.replace("Section", "").replace(":", "").strip()

            if "." in sec_content:
                parts = sec_content.split(".", 1)
                sec_title = parts[0].strip()
                content = parts[1].strip()
            else:
                sec_title = sec_content
                content = ""

            full_rag_text = (
                f"Law/Act: BNS\n"
                f"Chapter: Unknown\n"
                f"Section: {sec_num}\n"
                f"Title: {sec_title}\n"
                f"Content: {content}"
            )

            db.add(
                LegalDocument(
                    act_name="BNS",
                    section_number=sec_num,
                    section_title=sec_title,
                    rag_text=full_rag_text,
                )
            )
            records_inserted += 1

            if records_inserted % 100 == 0:
                db.commit()

        db.commit()
        print(f"Successfully extracted and loaded {records_inserted} BNS sections.")
    except Exception as e:
        db.rollback()
        print(f"Error loading BNS: {str(e)}")


def main():
    print("Starting BNS text extraction...")
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM legal_documents WHERE act_name = 'BNS';"))
        db.commit()
        load_bns_raw_text(FILE_PATH, db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

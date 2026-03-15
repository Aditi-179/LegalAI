import os
import pandas as pd
from sqlalchemy.orm import Session
import sys

# Add the parent directory to the path so we can import from the 'app' module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import LegalDocument # We need to create this model next

# Define the paths to your processed CSVs
# Adjust these paths if your 'data' folder is located differently
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_FILES = [
    os.path.join(BASE_DIR, "data", "processed", "ipc_clean.csv"),
    os.path.join(BASE_DIR, "data", "processed", "bns_clean.csv")
    # Add other CSVs here when you are ready (e.g., hma_clean.csv)
]

def load_csv_to_db(filepath: str, db: Session):
    if not os.path.exists(filepath):
        print(f"⚠️ Warning: File not found: {filepath}")
        return

    print(f"📥 Loading data from {filepath}...")
    try:
        df = pd.read_csv(filepath)
        
        # Keep track of how many rows we insert
        records_inserted = 0
        
        for index, row in df.iterrows():
            # Create a new database record
            db_record = LegalDocument(
                act_name=str(row.get('law_name', 'UNKNOWN')),
                section_number=str(row.get('section_number', '')),
                section_title=str(row.get('section_title', '')),
                rag_text=str(row.get('rag_text', ''))
            )
            db.add(db_record)
            records_inserted += 1

            # Commit in batches of 100 for better performance
            if records_inserted % 100 == 0:
                db.commit()
                print(f"   ...inserted {records_inserted} rows...")

        # Commit any remaining rows
        db.commit()
        print(f"✅ Successfully loaded {records_inserted} records from {os.path.basename(filepath)}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error loading {filepath}: {str(e)}")

def main():
    print("🚀 Starting Data Ingestion Process...")
    db = SessionLocal()
    try:
        for file in CSV_FILES:
            load_csv_to_db(file, db)
        print("🎉 All data loaded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
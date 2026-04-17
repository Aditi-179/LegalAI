import traceback
from app.db.session import SessionLocal
from app.models import LegalDocument

try:
    db = SessionLocal()
    docs = db.query(LegalDocument).all()
    print(f"Found {len(docs)} docs")
except Exception as e:
    traceback.print_exc()

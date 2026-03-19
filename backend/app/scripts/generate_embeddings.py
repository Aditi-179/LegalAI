import os
import sys

from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from tqdm import tqdm

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.db.session import SessionLocal
from app.models import LegalDocument

print("Loading AI model (this may take a minute the first time)...")
model = SentenceTransformer("all-mpnet-base-v2")
print("Model loaded successfully.")


def generate_and_store_embeddings(db: Session):
    print("Searching for documents without embeddings...")
    docs_to_embed = db.query(LegalDocument).filter(LegalDocument.embedding == None).all()

    if not docs_to_embed:
        print("All documents already have embeddings. Nothing to do.")
        return

    print(f"Found {len(docs_to_embed)} documents to process. Generating embeddings...")

    batch_size = 100
    for i in tqdm(range(0, len(docs_to_embed), batch_size)):
        batch = docs_to_embed[i : i + batch_size]
        texts = [doc.rag_text for doc in batch]
        embeddings = model.encode(texts)

        for doc, emb in zip(batch, embeddings):
            doc.embedding = emb.tolist()

        db.commit()

    print("All embeddings generated and saved successfully.")


def main():
    db = SessionLocal()
    try:
        generate_and_store_embeddings(db)
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

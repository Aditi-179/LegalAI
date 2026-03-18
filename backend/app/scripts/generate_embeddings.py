import os
import sys
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.database import SessionLocal
from app.models import LegalDocument

# Load the AI Model
# 'all-mpnet-base-v2' is highly rated for semantic search and outputs 768-dimensional vectors
print("🤖 Loading AI Model (This might take a minute to download the first time)...")
model = SentenceTransformer('all-mpnet-base-v2')
print("✅ Model loaded successfully!")

def generate_and_store_embeddings(db: Session):
    # 1. Fetch all documents that DON'T have an embedding yet
    print("🔍 Searching for documents without embeddings...")
    docs_to_embed = db.query(LegalDocument).filter(LegalDocument.embedding == None).all()
    
    if not docs_to_embed:
        print("🎉 All documents already have embeddings! Nothing to do.")
        return

    print(f"🚀 Found {len(docs_to_embed)} documents to process. Generating embeddings...")

    # 2. Process in batches to save RAM and Database locks
    batch_size = 100
    
    # We use tqdm for a nice progress bar in the terminal
    for i in tqdm(range(0, len(docs_to_embed), batch_size)):
        batch = docs_to_embed[i:i + batch_size]
        
        # Extract the text
        texts = [doc.rag_text for doc in batch]
        
        # Generate vectors (This is where the AI does the heavy lifting)
        embeddings = model.encode(texts)
        
        # Update the database objects
        for doc, emb in zip(batch, embeddings):
            # pgvector accepts standard python lists of floats
            doc.embedding = emb.tolist() 
            
        # Commit the batch to Supabase
        db.commit()

    print("✅ All embeddings generated and saved to Supabase successfully!")

def main():
    db = SessionLocal()
    try:
        generate_and_store_embeddings(db)
    except Exception as e:
        db.rollback()
        print(f"❌ An error occurred: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
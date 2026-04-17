from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models import LegalDocument

print("Loading embedding model (all-mpnet-base-v2) for search...")
model = SentenceTransformer("all-mpnet-base-v2")
print("Embedding model loaded.")


import math

def cosine_distance(v1, v2):
    if not v1 or not v2: return 1.0
    dot = sum(a*b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a*a for a in v1))
    mag2 = math.sqrt(sum(b*b for b in v2))
    if mag1 == 0 or mag2 == 0: return 1.0
    return 1.0 - (dot / (mag1 * mag2))

def hybrid_search(db: Session, query: str, top_k: int = 4):
    """
    Retrieves the most relevant legal documents for a given query.
    Calculates cosine distance in python memory to support SQLite.
    """
    try:
        query_embedding = model.encode(query).tolist()

        all_docs = db.query(LegalDocument).all()
        results = []
        for doc in all_docs:
            if doc.embedding is None:
                continue
            dist = cosine_distance(query_embedding, doc.embedding)
            results.append((doc, dist))
        
        results.sort(key=lambda x: x[1])
        results = results[:top_k]

        formatted_results = []
        for doc, distance in results:
            score = 1.0 - distance
            formatted_results.append(
                {
                    "content": doc.rag_text,
                    "act_name": doc.act_name,
                    "section": doc.section_number,
                    "title": doc.section_title,
                    "score": float(score),
                }
            )

        return formatted_results
    except Exception as e:
        print(f"Error during search: {str(e)}")
        return {"error": str(e)}

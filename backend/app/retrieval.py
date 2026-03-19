from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models import LegalDocument

print("Loading embedding model (all-mpnet-base-v2) for search...")
model = SentenceTransformer("all-mpnet-base-v2")
print("Embedding model loaded.")


def hybrid_search(db: Session, query: str, top_k: int = 4):
    """
    Retrieves the most relevant legal documents for a given query.
    Currently uses semantic vector search using pgvector.
    """
    try:
        query_embedding = model.encode(query).tolist()

        results = (
            db.query(
                LegalDocument,
                LegalDocument.embedding.cosine_distance(query_embedding).label("distance"),
            )
            .order_by("distance")
            .limit(top_k)
            .all()
        )

        formatted_results = []
        for doc, distance in results:
            score = 1.0 - (distance if distance is not None else 0.0)
            formatted_results.append(
                {
                    "content": doc.rag_text,
                    "act_name": doc.act_name,
                    "section": doc.section_number,
                    "title": doc.section_title,
                    "score": score,
                }
            )

        return formatted_results
    except Exception as e:
        print(f"Error during search: {str(e)}")
        return {"error": str(e)}

from __future__ import annotations

from sqlalchemy import or_
from sqlalchemy.orm import Session

# Model is lazy-loaded on first call to avoid blocking startup
_embedding_model = None


def _get_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading embedding model (all-mpnet-base-v2)...")
        _embedding_model = SentenceTransformer("all-mpnet-base-v2")
        print("Embedding model loaded.")
    return _embedding_model


def _keyword_fallback(db: Session, query: str, top_k: int) -> list[dict]:
    """
    Fallback search over the IpcBnsMapping table (always seeded, no pgvector needed).
    Simple word-overlap scoring.
    """
    from app.models.mapping import IpcBnsMapping

    query_lower = query.lower()
    words = [w for w in query_lower.split() if len(w) > 2]

    rows = db.query(IpcBnsMapping).all()
    scored: list[tuple[int, IpcBnsMapping]] = []
    for row in rows:
        haystack = f"{row.ipc_section} {row.bns_section} {row.title} {row.summary}".lower()
        score = sum(1 for w in words if w in haystack)
        if score:
            scored.append((score, row))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for _, row in scored[:top_k]:
        results.append({
            "content": f"{row.title}. {row.summary} {row.notes}",
            "act_name": "IPC/BNS Mapping",
            "section": f"IPC {row.ipc_section} → BNS {row.bns_section}",
            "title": row.title,
            "score": 0.5,
        })
    return results


def hybrid_search(db: Session, query: str, top_k: int = 4) -> list[dict]:
    """
    Semantic vector search using pgvector over legal_documents.
    Falls back to keyword search over IpcBnsMapping if pgvector is unavailable
    or the legal_documents table is empty.
    """
    # --- Try vector search first ---
    try:
        from app.models import LegalDocument

        model = _get_model()
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

        if results:
            return [
                {
                    "content": doc.rag_text,
                    "act_name": doc.act_name,
                    "section": doc.section_number,
                    "title": doc.section_title,
                    "score": round(1.0 - (distance or 0.0), 4),
                }
                for doc, distance in results
            ]

        # Vector table exists but is empty — fall through to keyword search
        print("⚠️  legal_documents table is empty, falling back to keyword search.")

    except Exception as exc:
        print(f"⚠️  Vector search unavailable ({exc}), falling back to keyword search.")

    # --- Keyword fallback ---
    try:
        return _keyword_fallback(db, query, top_k)
    except Exception as exc:
        print(f"⚠️  Keyword fallback also failed: {exc}")
        return []


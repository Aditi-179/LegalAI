import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.llm import generate_legal_response
from app.retrieval import hybrid_search


def test():
    db = SessionLocal()
    query = "My neighbor stole my motorcycle. What is the punishment?"
    try:
        print("Testing hybrid_search...")
        docs = hybrid_search(db, query, top_k=2)
        print("Retrieved docs:", [doc.get("title") for doc in docs])

        print("\nTesting LLM generation...")
        answer = generate_legal_response(query, docs)
        print("AI Answer:", answer[:100] + "...")
        print("\nSUCCESS!")
    except Exception as e:
        print("ERROR:", e)
    finally:
        db.close()


if __name__ == "__main__":
    test()

from features.draft_generator.service import generate_draft

data = {
    "name": "Aisha",
    "date": "10 April",
    "location": "Mumbai",
    "description": "My phone was stolen in a train"
}

result = generate_draft(data)
print(result)
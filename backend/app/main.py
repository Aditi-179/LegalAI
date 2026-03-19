from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict

from . import models
from .database import SessionLocal, engine
from .retrieval import hybrid_search
from .llm import generate_legal_response

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Indian Legal AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Model (optional: can remove if unused)
class QueryRequest(BaseModel):
    query: str
    top_k: int = 4

class ChatRequest(BaseModel):
    query: str
    chat_history: List[Dict] = []

@app.get("/")
def read_root():
    return {"message": "Welcome to the Indian Legal AI API"}

@app.get("/health")
def health_check():
    return {"status": "success", "message": "Backend is running!"}

@app.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        db.execute('SELECT 1')
        return {"status": "success", "message": "Database connection is healthy!"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}

# --- CHAT ENDPOINT (RAG + MEMORY) ---
@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    print(f"User asked: {req.query}")

    # 🔍 Retrieve relevant laws
    retrieved_laws = hybrid_search(db=db, query=req.query, top_k=4)

    if isinstance(retrieved_laws, dict) and "error" in retrieved_laws:
        raise HTTPException(status_code=500, detail=retrieved_laws["error"])

    # 🤖 Generate AI response with memory
    ai_answer = generate_legal_response(
        user_query=req.query,
        retrieved_contexts=retrieved_laws,
        chat_history=req.chat_history
    )

    return {
        "answer": ai_answer,
        "citations": retrieved_laws
    }
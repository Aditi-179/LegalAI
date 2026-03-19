from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from . import models
from .database import SessionLocal, engine
from .retrieval import hybrid_search
from .llm import generate_legal_response # <-- IMPORT THE NEW AI ENGINE

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

# Request Model
class QueryRequest(BaseModel):
    query: str
    top_k: int = 4 # Let's fetch the top 4 laws to give the AI more context

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

# --- THE NEW RAG ENDPOINT ---
from pydantic import BaseModel
from typing import List, Dict

class ChatRequest(BaseModel):
    query: str
    chat_history: List[Dict] = []

@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    print(f"User asked: {req.query}")

    # 🔍 Step 1: Retrieve relevant laws (RAG)
    retrieved_laws = hybrid_search(db=db, query=req.query, top_k=4)

    if isinstance(retrieved_laws, dict) and "error" in retrieved_laws:
        raise HTTPException(status_code=500, detail=retrieved_laws["error"])

    # 🤖 Step 2: Generate AI response WITH MEMORY
    ai_answer = generate_legal_response(
        user_query=req.query,
        retrieved_contexts=retrieved_laws,
        chat_history=req.chat_history
    )

    # 📦 Step 3: Return response + citations
    return {
        "answer": ai_answer,
        "citations": retrieved_laws
    }

    return {"answer": response}
def chat_with_legal_ai(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Full RAG Pipeline:
    1. Search database for laws (Hybrid Search)
    2. Send laws + query to Groq LLM
    3. Return AI answer + source laws
    """
    print(f"User asked: {request.query}")
    
    # 1. Retrieve the relevant laws
    retrieved_laws = hybrid_search(db=db, query=request.query, top_k=request.top_k)
    
    if isinstance(retrieved_laws, dict) and "error" in retrieved_laws:
        raise HTTPException(status_code=500, detail=retrieved_laws["error"])
        
    # 2. Generate the AI Response using Groq
    ai_answer = generate_legal_response(user_query=request.query, retrieved_contexts=retrieved_laws)
    
    # 3. Return both the English answer AND the raw citations
    return {
        "query": request.query,
        "answer": ai_answer,
        "citations": retrieved_laws # We send this so the frontend can display "Sources"
    }
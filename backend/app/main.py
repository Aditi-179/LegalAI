from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, get_db
from app.services.seed import seed_defaults

from app.retrieval import hybrid_search
from app.llm import generate_legal_response

@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        seed_defaults()
        print("✅ Database connected and initialized.")
    except Exception as exc:
        print(f"⚠️  Database startup failed — server will still run but DB features may be unavailable.")
        print(f"   Reason: {exc}")
    yield


app = FastAPI(
    title=settings.app_name,
    description="Backend services for LegalAI, including auth, legal Q&A, mapping, uploads, and drafting.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected server error.", "error": str(exc)},
    )


class ChatRequest(BaseModel):
    query: str
    chat_history: List[Dict] = []

@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "LegalAI backend is online."}


# --- CHAT ENDPOINT (RAG + MEMORY) ---
@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Direct chat endpoint (legacy/direct access) using the RAG pipeline.
    """
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

app.include_router(api_router, prefix="/api/v1")

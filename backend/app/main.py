from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict

from . import models
from .database import SessionLocal, engine
from .retrieval import hybrid_search
from .llm import generate_legal_response
=======
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.seed import seed_defaults
>>>>>>> origin/main


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_defaults()
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


<<<<<<< HEAD
# Request Model (optional: can remove if unused)
class QueryRequest(BaseModel):
    query: str
    top_k: int = 4

class ChatRequest(BaseModel):
    query: str
    chat_history: List[Dict] = []
=======
@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected server error.", "error": str(exc)},
    )
>>>>>>> origin/main


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "LegalAI backend is online."}


<<<<<<< HEAD
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
=======
app.include_router(api_router, prefix="/api/v1")
>>>>>>> origin/main

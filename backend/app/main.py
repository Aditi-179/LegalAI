from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

from features.draft_generator.routes import router as draft_router
from .llm import generate_legal_response


# ✅ Create app FIRST
app = FastAPI(title="Indian Legal AI API", version="1.0.0")


# ✅ Then include router
app.include_router(draft_router, prefix="/draft")


# ✅ Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Request model
class ChatRequest(BaseModel):
    query: str
    chat_history: List[Dict] = []


# ✅ Root
@app.get("/")
def root():
    return {"message": "LegalAI backend is online."}


# ✅ Chat endpoint
@app.post("/chat")
def chat(req: ChatRequest):
    print(f"User asked: {req.query}")

    ai_answer = generate_legal_response(
        user_query=req.query,
        retrieved_contexts=[],
        chat_history=req.chat_history
    )

    return {
        "answer": ai_answer,
        "citations": []
    }
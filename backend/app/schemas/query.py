from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str
    chat_history: list[dict] = []
    context_text: str | None = None


class QueryResponse(BaseModel):
    question: str
    answer: str
    contexts: list[str]
    response_time_ms: int


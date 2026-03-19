from pydantic import BaseModel


class HistoryItem(BaseModel):
    kind: str
    title: str
    summary: str
    created_at: str


class HistoryResponse(BaseModel):
    items: list[HistoryItem]


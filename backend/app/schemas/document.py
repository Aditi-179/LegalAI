from pydantic import BaseModel


class DocumentExplainResponse(BaseModel):
    filename: str
    explanation: str
    highlights: list[str]


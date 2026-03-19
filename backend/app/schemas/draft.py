from pydantic import BaseModel, Field


class DraftRequest(BaseModel):
    draft_type: str
    title: str
    parties: str = ""
    facts: str
    relief_sought: str = ""
    extra_instructions: str = ""
    facts_list: list[str] = Field(default_factory=list)


class DraftResponse(BaseModel):
    draft_type: str
    title: str
    content: str


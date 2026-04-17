from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DraftTypeEnum(str, Enum):
    FIR = "FIR"
    LEGAL_NOTICE = "LEGAL_NOTICE"
    AFFIDAVIT = "AFFIDAVIT"
    BAIL_APPLICATION = "BAIL_APPLICATION"

class DraftRequest(BaseModel):
    draft_type: DraftTypeEnum
    title: str
    parties: Optional[str] = "To be specified"
    facts: str
    relief_sought: Optional[str] = "To be determined"
    extra_instructions: Optional[str] = ""
    facts_list: List[str] = Field(default_factory=list)

class DraftResponse(BaseModel):
    draft_type: str
    title: str
    content: str

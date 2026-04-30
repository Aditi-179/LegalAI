from pydantic import BaseModel
from typing import List, Optional

class Scheme(BaseModel):
    scheme_name: str
    short_description: str
    eligibility: str
    benefits: str
    official_link: str

class SchemeSearchResponse(BaseModel):
    search_query: str
    schemes: List[Scheme]

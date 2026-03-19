from pydantic import BaseModel


class MappingResponse(BaseModel):
    input_code: str
    ipc_section: str
    bns_section: str
    title: str
    summary: str
    notes: str
    source: str


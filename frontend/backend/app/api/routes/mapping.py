from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mapping import MappingResponse
from app.services.mapping import search_mapping

router = APIRouter()


@router.get("", response_model=MappingResponse)
def map_section(
    code: str = Query(..., description="IPC or BNS section code"),
    db: Session = Depends(get_db),
) -> MappingResponse:
    return search_mapping(db, code)


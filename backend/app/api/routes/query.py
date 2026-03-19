from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.query import QueryRequest, QueryResponse
from app.services.query import handle_query
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=QueryResponse)
def submit_query(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> QueryResponse:
    return handle_query(db, current_user, payload)


from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.query import QueryRequest, QueryResponse
from app.services.query import handle_query, handle_query_stream
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=QueryResponse)
def submit_query(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> QueryResponse:
    return handle_query(db, current_user, payload)


@router.post("/stream")
def submit_query_stream(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return StreamingResponse(
        handle_query_stream(db, current_user, payload),
        media_type="text/event-stream"
    )


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.history import HistoryResponse
from app.services.history import build_history
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("", response_model=HistoryResponse)
def history(db: Session = Depends(get_db), current_user=Depends(get_current_user)) -> HistoryResponse:
    return build_history(db, current_user)


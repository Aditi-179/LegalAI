from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.draft import DraftRequest, DraftResponse
from app.services.drafting import generate_draft
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=DraftResponse)
def create_draft(
    payload: DraftRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DraftResponse:
    return generate_draft(db, current_user, payload)


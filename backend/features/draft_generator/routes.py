from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Reusing the existing dependency injection provided by LegalAI
from app.db.session import get_db
from app.utils.auth import get_current_user

from .schemas import DraftRequest, DraftResponse
from .service import generate_draft

router = APIRouter()

@router.post("", response_model=DraftResponse)
def create_draft_doc(
    payload: DraftRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DraftResponse:
    """
    Generate a structural draft (FIR, Legal Notice, etc) via templates.
    """
    return generate_draft(db, current_user, payload)

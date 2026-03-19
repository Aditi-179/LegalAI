from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentExplainResponse
from app.services.documents import explain_uploaded_document
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=DocumentExplainResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> DocumentExplainResponse:
    return await explain_uploaded_document(db, current_user, file)


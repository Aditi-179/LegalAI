from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.schemas.document import DocumentExplainResponse
from app.services.logging_service import log_event


def _read_pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ModuleNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF support requires the pypdf package to be installed.",
        ) from exc
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _build_explanation(text: str) -> tuple[str, list[str]]:
    clean_text = " ".join(text.split())
    excerpt = clean_text[:900]
    highlights = [
        "Identify the parties, dates, and any deadlines mentioned in the document.",
        "Check whether the document alleges a legal violation, requests compliance, or demands a response.",
        "Match any cited sections or clauses with the exact statute text before acting on them.",
    ]
    explanation = (
        "Plain-language explainer: "
        f"This document appears to discuss the following content: {excerpt or 'No readable text found.'} "
        "Treat this as a first-pass summary and verify with the original document."
    )
    return explanation, highlights


async def explain_uploaded_document(db: Session, user, file: UploadFile) -> DocumentExplainResponse:
    suffix = Path(file.filename or "upload.txt").suffix.lower()
    if suffix not in {".txt", ".pdf"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and TXT files are supported.")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / (file.filename or "document.txt")
    raw_bytes = await file.read()
    destination.write_bytes(raw_bytes)

    if suffix == ".pdf":
        extracted_text = _read_pdf_text(destination)
    else:
        extracted_text = raw_bytes.decode("utf-8", errors="ignore")

    explanation, highlights = _build_explanation(extracted_text)
    document = Document(
        user_id=user.id,
        filename=file.filename or "document.txt",
        content_type=file.content_type or "application/octet-stream",
        extracted_text=extracted_text,
        explanation=explanation,
    )
    db.add(document)
    db.commit()

    log_event(db, event_type="upload", message="Document explained", metadata={"user_id": user.id, "file": document.filename})

    return DocumentExplainResponse(filename=document.filename, explanation=explanation, highlights=highlights)

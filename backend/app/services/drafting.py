import json

from sqlalchemy.orm import Session

from app.models.draft import Draft
from app.schemas.draft import DraftRequest, DraftResponse
from app.services.logging_service import log_event


from app.llm import generate_legal_draft_ai


def generate_draft(db: Session, user, payload: DraftRequest) -> DraftResponse:
    content = generate_legal_draft_ai(payload.draft_type, payload.model_dump())
    record = Draft(
        user_id=user.id,
        draft_type=payload.draft_type,
        title=payload.title,
        inputs_json=json.dumps(payload.model_dump(), default=str),
        content=content,
    )
    db.add(record)
    db.commit()

    log_event(db, event_type="draft", message="Draft generated", metadata={"user_id": user.id, "draft_type": payload.draft_type})

    return DraftResponse(draft_type=payload.draft_type, title=payload.title, content=content)


import json

from sqlalchemy.orm import Session

from app.models.draft import Draft
from app.schemas.draft import DraftRequest, DraftResponse
from app.services.logging_service import log_event


def _render_draft(payload: DraftRequest) -> str:
    facts_block = "\n".join(f"- {fact}" for fact in payload.facts_list) if payload.facts_list else payload.facts
    return (
        f"{payload.title}\n\n"
        f"Document Type: {payload.draft_type}\n"
        f"Parties: {payload.parties or 'To be specified'}\n\n"
        "Facts\n"
        f"{facts_block}\n\n"
        "Relief / Request\n"
        f"{payload.relief_sought or 'To be completed based on legal review.'}\n\n"
        "Additional Instructions\n"
        f"{payload.extra_instructions or 'None provided.'}\n\n"
        "Verification\n"
        "This draft is a structured first draft and should be reviewed by a qualified legal professional before use."
    )


def generate_draft(db: Session, user, payload: DraftRequest) -> DraftResponse:
    content = _render_draft(payload)
    record = Draft(
        user_id=user.id,
        draft_type=payload.draft_type,
        title=payload.title,
        inputs_json=json.dumps(payload.model_dump()),
        content=content,
    )
    db.add(record)
    db.commit()

    log_event(db, event_type="draft", message="Draft generated", metadata={"user_id": user.id, "draft_type": payload.draft_type})

    return DraftResponse(draft_type=payload.draft_type, title=payload.title, content=content)


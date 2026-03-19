from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.draft import Draft
from app.models.query import QueryLog
from app.schemas.history import HistoryItem, HistoryResponse


def build_history(db: Session, user) -> HistoryResponse:
    items: list[HistoryItem] = []

    for query in db.query(QueryLog).filter(QueryLog.user_id == user.id).order_by(QueryLog.created_at.desc()).limit(10):
        items.append(
            HistoryItem(
                kind="query",
                title=query.question[:80],
                summary=query.answer[:140],
                created_at=query.created_at.isoformat(),
            )
        )

    for draft in db.query(Draft).filter(Draft.user_id == user.id).order_by(Draft.created_at.desc()).limit(10):
        items.append(
            HistoryItem(
                kind="draft",
                title=draft.title,
                summary=draft.content[:140],
                created_at=draft.created_at.isoformat(),
            )
        )

    for document in db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).limit(10):
        items.append(
            HistoryItem(
                kind="document",
                title=document.filename,
                summary=document.explanation[:140],
                created_at=document.created_at.isoformat(),
            )
        )

    items.sort(key=lambda item: item.created_at, reverse=True)
    return HistoryResponse(items=items[:20])


import json

from sqlalchemy.orm import Session

from app.models.log import LogEntry


def log_event(db: Session, event_type: str, message: str, level: str = "info", metadata: dict | None = None) -> None:
    entry = LogEntry(
        event_type=event_type,
        message=message,
        level=level,
        metadata_json=json.dumps(metadata or {}),
    )
    db.add(entry)
    db.commit()


from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.mapping import IpcBnsMapping

DEFAULT_MAPPINGS = [
    {
        "ipc_section": "420",
        "bns_section": "318",
        "title": "Cheating and dishonestly inducing delivery of property",
        "summary": "Handles cheating that results in wrongful delivery of property or valuable security.",
        "notes": "Keep factual documents, payment trail, and communication records ready before filing.",
    },
    {
        "ipc_section": "302",
        "bns_section": "101",
        "title": "Punishment for murder",
        "summary": "Deals with punishment where the legal ingredients of murder are satisfied.",
        "notes": "Always verify the latest statutory text and judicial interpretation before advising on applicability.",
    },
    {
        "ipc_section": "376",
        "bns_section": "64",
        "title": "Punishment for rape",
        "summary": "Maps rape-related punishment into the BNS structure with updated clause references.",
        "notes": "Sensitive matters should route through trained legal professionals and victim-support channels.",
    },
]


def seed_defaults() -> None:
    db: Session = SessionLocal()
    try:
        existing = db.query(IpcBnsMapping).count()
        if existing:
            return
        db.add_all(IpcBnsMapping(**mapping) for mapping in DEFAULT_MAPPINGS)
        db.commit()
    finally:
        db.close()


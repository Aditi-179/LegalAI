from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.mapping import IpcBnsMapping
from app.schemas.mapping import MappingResponse


def search_mapping(db: Session, code: str) -> MappingResponse:
    clean_code = code.strip().replace("IPC", "").replace("BNS", "").strip()
    mapping = (
        db.query(IpcBnsMapping)
        .filter(or_(IpcBnsMapping.ipc_section == clean_code, IpcBnsMapping.bns_section == clean_code))
        .first()
    )

    if not mapping:
        return MappingResponse(
            input_code=code,
            ipc_section=clean_code,
            bns_section="No direct structured match",
            title="Fallback required",
            summary="No direct IPC-BNS mapping was found in the structured table yet.",
            notes="Use the RAG assistant as a fallback and validate against the latest bare act.",
            source="fallback",
        )

    return MappingResponse(
        input_code=code,
        ipc_section=mapping.ipc_section,
        bns_section=mapping.bns_section,
        title=mapping.title,
        summary=mapping.summary,
        notes=mapping.notes,
        source="structured_mapping",
    )


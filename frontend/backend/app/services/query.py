import time

from sqlalchemy.orm import Session

from app.models.mapping import IpcBnsMapping
from app.models.query import QueryLog
from app.schemas.query import QueryRequest, QueryResponse
from app.services.logging_service import log_event


def _retrieve_contexts(db: Session, question: str) -> list[str]:
    question_lower = question.lower()
    contexts: list[str] = []
    for mapping in db.query(IpcBnsMapping).all():
        haystack = f"{mapping.ipc_section} {mapping.bns_section} {mapping.title} {mapping.summary}".lower()
        score = sum(1 for word in question_lower.split() if word in haystack)
        if score:
            contexts.append(
                f"IPC {mapping.ipc_section} -> BNS {mapping.bns_section}: {mapping.title}. {mapping.summary}"
            )
    if not contexts:
        contexts.append(
            "No direct structured context matched the question. Answer conservatively and recommend statutory verification."
        )
    return contexts[:3]


def _generate_answer(question: str, contexts: list[str]) -> str:
    return (
        "This is a grounded legal-assistant style response, not a substitute for a lawyer. "
        f"Based on the available context, your question was: '{question}'. "
        f"Relevant material: {' | '.join(contexts)}. "
        "Next step: confirm the exact section text, facts, dates, and jurisdiction before relying on this in practice."
    )


def handle_query(db: Session, user, payload: QueryRequest) -> QueryResponse:
    started = time.perf_counter()
    contexts = _retrieve_contexts(db, payload.question)
    answer = _generate_answer(payload.question, contexts)
    response_time_ms = int((time.perf_counter() - started) * 1000)

    record = QueryLog(
        user_id=user.id,
        question=payload.question,
        answer=answer,
        context="\n".join(contexts),
        response_time_ms=str(response_time_ms),
    )
    db.add(record)
    db.commit()

    log_event(
        db,
        event_type="query",
        message="Query processed",
        metadata={"user_id": user.id, "response_time_ms": response_time_ms},
    )

    return QueryResponse(
        question=payload.question,
        answer=answer,
        contexts=contexts,
        response_time_ms=response_time_ms,
    )


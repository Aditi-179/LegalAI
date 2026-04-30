import time
import json
from sqlalchemy.orm import Session
from typing import List, Dict

from app.models.query import QueryLog
from app.schemas.query import QueryRequest, QueryResponse
from app.services.logging_service import log_event
from app.retrieval import hybrid_search
from app.llm import generate_legal_response, generate_legal_response_stream

def handle_query_stream(db: Session, user, payload: QueryRequest):
    """
    Streaming handler for legal queries.
    """
    query_text = payload.question
    retrieved_contexts = hybrid_search(db=db, query=query_text, top_k=4)
    
    if payload.context_text:
        retrieved_contexts.insert(0, {
            "act_name": "Uploaded Document",
            "section": "Analysis",
            "title": "User Context",
            "content": payload.context_text
        })

    # Yield retrieved context first as a JSON chunk
    context_data = [f"{c['act_name']} Sec {c['section']}: {c['title']}\n{c['content']}" for c in retrieved_contexts]
    yield f"__CONTEXT__:{json.dumps(context_data)}\n"
    
    for chunk in generate_legal_response_stream(
        user_query=query_text,
        retrieved_contexts=retrieved_contexts,
        chat_history=payload.chat_history
    ):
        yield chunk

def handle_query(db: Session, user, payload: QueryRequest) -> QueryResponse:
    """
    Main handler for legal queries using the RAG pipeline.
    """
    started = time.perf_counter()
    
    # 🔍 1. Retrieve relevant laws using semantic search
    # Note: frontend sends 'question', backend expects 'query' in retrieval/llm
    query_text = payload.question
    retrieved_contexts = hybrid_search(db=db, query=query_text, top_k=4)
    
    # If the user provided a specific document context from the frontend (e.g. an uploaded doc)
    # we inject it into the retrieved contexts for the LLM.
    if payload.context_text:
        retrieved_contexts.insert(0, {
            "act_name": "Uploaded Document",
            "section": "Analysis",
            "title": "User Context",
            "content": payload.context_text
        })
    
    if isinstance(retrieved_contexts, dict) and "error" in retrieved_contexts:
        error_msg = f"Search error: {retrieved_contexts['error']}"
        return QueryResponse(
            question=query_text,
            answer=error_msg,
            contexts=[],
            response_time_ms=int((time.perf_counter() - started) * 1000)
        )

    # 🤖 2. Generate AI response with LLM (passing retrieved laws)
    # Note: handle_query doesn't currently support chat_history in payload
    # but we can pass an empty list for now to keep the API stable.
    ai_answer = generate_legal_response(
        user_query=query_text,
        retrieved_contexts=retrieved_contexts,
        chat_history=payload.chat_history 
    )
    
    response_time_ms = int((time.perf_counter() - started) * 1000)

    # 📝 3. Log the query in the database
    # Extract just the text content for the log context
    context_summary = "\n".join([f"{c['act_name']} Sec {c['section']}: {c['title']}" for c in retrieved_contexts])
    
    record = QueryLog(
        user_id=user.id,
        question=query_text,
        answer=ai_answer,
        context=context_summary,
        response_time_ms=str(response_time_ms),
    )
    db.add(record)
    db.commit()

    log_event(
        db,
        event_type="query",
        message="Query processed with RAG",
        metadata={"user_id": user.id, "response_time_ms": response_time_ms},
    )

    # 🎁 4. Format the final response
    # Map retrieved dicts to string list for the response schema
    contexts_list = [f"{c['act_name']} Sec {c['section']}: {c['title']}\n{c['content']}" for c in retrieved_contexts]

    return QueryResponse(
        question=query_text,
        answer=ai_answer,
        contexts=contexts_list,
        response_time_ms=response_time_ms,
    )

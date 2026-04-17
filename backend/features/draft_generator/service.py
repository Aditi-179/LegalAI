import os
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

# Using relative absolute imports based on LegalAI's structure
from app.models.draft import Draft
from app.services.logging_service import log_event
from app.retrieval import hybrid_search
from app.llm import client, MODEL_NAME
from .schemas import DraftRequest, DraftResponse, DraftTypeEnum

# Path to templates relative to this file
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")

def _load_template(draft_type: DraftTypeEnum) -> str:
    filename = ""
    if draft_type == DraftTypeEnum.FIR:
        filename = "fir_template.txt"
    elif draft_type == DraftTypeEnum.LEGAL_NOTICE:
        filename = "legal_notice_template.txt"
    elif draft_type == DraftTypeEnum.AFFIDAVIT:
        filename = "affidavit_template.txt"
    elif draft_type == DraftTypeEnum.BAIL_APPLICATION:
        filename = "bail_application_template.txt"
    else:
        # Fallback or generic
        return "GENERIC DOCUMENT\n\nTitle: {title}\nFacts: {facts}\nParties: {parties}\nRelief: {relief_sought}"

    filepath = os.path.join(TEMPLATES_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=500, detail=f"Template file {filename} missing from disk.")
        
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def generate_draft(db: Session, user, payload: DraftRequest) -> DraftResponse:
    # 1. Load the template
    template_str = _load_template(payload.draft_type)
    
    # 2. Format Facts
    facts_text = payload.facts
    if payload.facts_list:
        facts_text += "\n" + "\n".join(f"- {f}" for f in payload.facts_list)
        
    # 3. Create initial structured base draft
    try:
        base_draft = template_str.format(
            title=payload.title,
            parties=payload.parties,
            facts=facts_text,
            relief_sought=payload.relief_sought,
            extra_instructions=payload.extra_instructions
        )
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Template injection mapping error: missing {e}")

    # 4. RAG Integration: Retrieve relevant laws based on facts
    retrieved_docs = hybrid_search(db=db, query=facts_text, top_k=3)
    
    context_text = ""
    if retrieved_docs and not (isinstance(retrieved_docs, dict) and "error" in retrieved_docs):
        for idx, doc in enumerate(retrieved_docs):
            context_text += f"--- LAW {idx + 1} ---\n"
            context_text += f"Act: {doc.get('act_name', 'Unknown')}\n"
            context_text += f"Section: {doc.get('section', 'Unknown')}\n"
            context_text += f"Content: {doc.get('content', 'Unknown')}\n\n"
    else:
        context_text = "No specific laws found in the database."

    # 5. LLM Prompt + Draft Generation
    system_prompt = (
        "You are an expert Indian Legal AI Assistant specialized in drafting formal legal documents. "
        "Your objective is to refine and expand the provided base draft using accurate legal terminology, "
        "incorporating relevant provisions from the retrieved legal context if applicable. "
        "Ensure the final document strictly respects the provided structure and tone. "
        "Return ONLY the drafted legal document."
    )
    user_prompt = f"LEGAL CONTEXT:\n{context_text}\n\nBASE STRUCTURED DRAFT:\n{base_draft}\n\nPlease generate the professionally refined legal draft."

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )
        final_content = response.choices[0].message.content
    except Exception as e:
        # Fallback to the base draft if LLM fails
        final_content = base_draft + f"\n\n[AI Refinement Failed: {str(e)}]"

    # 6. Save to DB exactly like the original app.services.drafting did
    record = Draft(
        user_id=user.id,
        draft_type=payload.draft_type.value,
        title=payload.title,
        inputs_json=json.dumps(payload.model_dump()),
        content=final_content,
    )
    db.add(record)
    db.commit()

    # 7. Log the event
    log_event(db, event_type="draft", message=f"Generated {payload.draft_type.value} via modular generator with LLM", metadata={"user_id": user.id, "draft_type": payload.draft_type.value})

    # 8. Return response
    return DraftResponse(
        draft_type=payload.draft_type.value,
        title=payload.title,
        content=final_content
    )

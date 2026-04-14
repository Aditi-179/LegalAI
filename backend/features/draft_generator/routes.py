from fastapi import APIRouter
from features.draft_generator.service import generate_draft

router = APIRouter()

@router.post("/generate-draft")
def create_draft(data: dict):
    return generate_draft(data)
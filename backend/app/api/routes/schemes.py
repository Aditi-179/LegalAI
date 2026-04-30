from fastapi import APIRouter, HTTPException
from app.schemas.schemes import SchemeSearchResponse
from app.services.schemes import search_schemes

router = APIRouter()

@router.get("/search", response_model=SchemeSearchResponse)
def get_schemes(q: str):
    """
    Search for official Indian government schemes.
    """
    if not q:
        raise HTTPException(status_code=400, detail="Search query is required")
    
    try:
        results = search_schemes(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

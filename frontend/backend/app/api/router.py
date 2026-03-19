from fastapi import APIRouter

from app.api.routes import auth, draft, health, history, mapping, query, upload

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(mapping.router, prefix="/map", tags=["mapping"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(draft.router, prefix="/draft", tags=["draft"])
api_router.include_router(history.router, prefix="/history", tags=["history"])


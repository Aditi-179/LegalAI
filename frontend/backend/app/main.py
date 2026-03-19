from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.seed import seed_defaults


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_defaults()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Backend services for LegalAI, including auth, legal Q&A, mapping, uploads, and drafting.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected server error.", "error": str(exc)},
    )


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "LegalAI backend is online."}


app.include_router(api_router, prefix="/api/v1")


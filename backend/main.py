from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI App
app = FastAPI(
    title="Indian Legal AI Assistant API",
    description="Backend for the AI-powered legal platform mapping IPC/BNS and answering legal queries.",
    version="1.0.0"
)

# Setup CORS (Allows your Next.js frontend to communicate with this backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change "*" to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Indian Legal AI API"}

@app.get("/health")
def health_check():
    return {
        "status": "success",
        "message": "Backend is running perfectly!",
        "version": "1.0.0"
    }


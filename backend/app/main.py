from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import the new modules we created
from .app import models
from .database import SessionLocal, engine

# This will create the tables in the database if they don't exist
# (Though we already created them with the SQL script)
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title="Indian Legal AI Assistant API",
    description="Backend for the AI-powered legal platform mapping IPC/BNS and answering legal queries.",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

# --- NEW DATABASE TEST ROUTE ---
@app.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        # A simple query to test the connection
        db.execute('SELECT 1')
        return {"status": "success", "message": "Database connection is healthy!"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}

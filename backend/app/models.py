from sqlalchemy import Column, String, Text, DateTime, Integer, UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector # <-- NEW IMPORT
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(Text)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LegalDocument(Base):
    __tablename__ = "legal_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    act_name = Column(String(50), nullable=False)
    section_number = Column(String(50))
    section_title = Column(Text)
    rag_text = Column(Text, nullable=False)
    
    # --- NOW ACTIVATED ---
    # 768 dimensions matches the 'all-mpnet-base-v2' AI model we will use
    embedding = Column(Vector(768)) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
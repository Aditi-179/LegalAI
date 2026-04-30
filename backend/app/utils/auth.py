import base64
import hashlib
import hmac
import json
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Retrieves the current user. 
    DEMO MODE: If authentication fails, returns a default 'Demo User'.
    """
    
    # --- PROPER AUTH LOGIC ---
    if credentials:
        token = credentials.credentials
        try:
            if "." in token:
                encoded_payload, signature = token.split(".", maxsplit=1)
                expected_signature = hmac.new(
                    settings.jwt_secret_key.encode("utf-8"),
                    encoded_payload.encode("utf-8"),
                    hashlib.sha256,
                ).hexdigest()
                
                if hmac.compare_digest(signature, expected_signature):
                    payload = json.loads(base64.urlsafe_b64decode(encoded_payload.encode("utf-8")).decode("utf-8"))
                    user_id = payload.get("sub")
                    expires_at = datetime.fromtimestamp(int(payload.get("exp", 0)), tz=timezone.utc)
                    
                    if expires_at > datetime.now(timezone.utc):
                        user = db.query(User).filter(User.id == user_id).first()
                        if user:
                            return user
        except Exception:
            pass

    # --- DEMO AUTH FALLBACK ---
    # Look for or create a demo user to allow testing without real login
    demo_user = db.query(User).filter(User.email == "demo@example.com").first()
    if not demo_user:
        demo_user = User(
            name="Demo User", 
            email="demo@example.com", 
            password_hash="demo_password_not_hashed"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    
    return demo_user

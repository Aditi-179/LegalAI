import base64
import hashlib
import hmac
import json
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        encoded_payload, signature = token.split(".", maxsplit=1)
        expected_signature = hmac.new(
            settings.jwt_secret_key.encode("utf-8"),
            encoded_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Signature mismatch")
        payload = json.loads(base64.urlsafe_b64decode(encoded_payload.encode("utf-8")).decode("utf-8"))
        user_id = payload.get("sub")
        expires_at = datetime.fromtimestamp(int(payload.get("exp", 0)), tz=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            raise ValueError("Token expired")
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from exc

    user = db.query(User).filter(User.id == int(user_id)).first() if user_id else None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user

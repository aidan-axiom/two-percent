from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

COOKIE_NAME = "chef_session"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=settings.access_token_ttl_hours),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_current_user(
    chef_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not chef_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(chef_session, settings.secret_key, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user

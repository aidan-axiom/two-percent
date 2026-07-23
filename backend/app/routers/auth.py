from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import ApiKeyIn, LoginIn, RegisterIn, UserOut
from app.security import encrypt_key

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _default_provider() -> str | None:
    if settings.gemini_api_key:
        return "gemini"
    if settings.anthropic_api_key:
        return "claude"
    return None


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        own_key_provider=user.api_provider if user.api_key_encrypted else None,
        default_provider=_default_provider(),
    )


def _set_session_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(user_id),
        httponly=True,
        samesite="lax",
        max_age=settings.access_token_ttl_hours * 3600,
    )


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session_cookie(response, user.id)
    return _user_out(user)


@router.post("/login", response_model=UserOut)
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _set_session_cookie(response, user.id)
    return _user_out(user)


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return _user_out(user)


@router.put("/me/api-key", response_model=UserOut)
def set_api_key(
    body: ApiKeyIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.api_provider = body.provider
    user.api_key_encrypted = encrypt_key(body.api_key.strip())
    db.commit()
    db.refresh(user)
    return _user_out(user)


@router.delete("/me/api-key", response_model=UserOut)
def remove_api_key(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    user.api_provider = None
    user.api_key_encrypted = None
    db.commit()
    db.refresh(user)
    return _user_out(user)

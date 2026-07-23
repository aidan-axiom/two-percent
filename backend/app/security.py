"""Encryption for user-supplied API keys stored at rest."""

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


def _fernet() -> Fernet:
    digest = hashlib.sha256(settings.secret_key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_key(api_key: str) -> str:
    return _fernet().encrypt(api_key.encode()).decode()


def decrypt_key(encrypted: str) -> str | None:
    try:
        return _fernet().decrypt(encrypted.encode()).decode()
    except InvalidToken:
        return None

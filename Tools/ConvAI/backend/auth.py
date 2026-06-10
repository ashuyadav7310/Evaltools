import hmac
import os
import hashlib

from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

TRAINER_API_KEY = os.getenv("TRAINER_API_KEY", "").strip()


def hash_invite_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_invite_token_from_headers(
    authorization: str | None,
    x_invite_token: str | None,
) -> str:
    bearer_token = None
    if authorization and authorization.lower().startswith("bearer "):
        bearer_token = authorization[7:].strip()

    return (x_invite_token or bearer_token or "").strip()


def is_valid_trainer_token(
    authorization: str | None,
    x_admin_token: str | None,
) -> bool:
    if not TRAINER_API_KEY:
        return False

    bearer_token = None
    if authorization and authorization.lower().startswith("bearer "):
        bearer_token = authorization[7:].strip()

    provided_token = x_admin_token or bearer_token or ""
    return hmac.compare_digest(provided_token, TRAINER_API_KEY)


def require_trainer_access(
    authorization: str | None = Header(default=None),
    x_admin_token: str | None = Header(default=None),
) -> None:
    """Protect trainer-only routes with a shared secret if configured."""
    if not TRAINER_API_KEY:
        return

    if not is_valid_trainer_token(authorization=authorization, x_admin_token=x_admin_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

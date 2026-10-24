import hmac
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pineco.config import settings

JWT_SECRET = getattr(settings, "AUTH_SECRET", "pineco-ai-governance-jwt-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Secure PBKDF2-HMAC-SHA256 password hashing with random salt."""
    salt = secrets.token_hex(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"{salt}:{iterations}:{derived.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies plain password against stored salt:iterations:hash format."""
    try:
        parts = stored_hash.split(":")
        if len(parts) == 3:
            salt, iterations_str, derived_hex = parts
            iterations = int(iterations_str)
            check = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations)
            return hmac.compare_digest(check.hex(), derived_hex)
        elif len(parts) == 2:
            salt, derived_hex = parts
            check = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
            return hmac.compare_digest(check.hex(), derived_hex)
        return False
    except Exception:
        return False


# Fallback / benchmark enterprise users
DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "creator@pineco.internal": {
        "id": "usr-creator-sarah",
        "email": "creator@pineco.internal",
        "name": "Sarah Chen",
        "role": "creator",
        "title": "Content Marketing Specialist",
        "department": "Growth & Communications",
        "avatar": "SC",
    },
    "reviewer@pineco.internal": {
        "id": "usr-reviewer-elena",
        "email": "reviewer@pineco.internal",
        "name": "Elena Rostova",
        "role": "reviewer",
        "title": "Compliance & Legal Reviewer",
        "department": "Legal & Risk Governance",
        "avatar": "ER",
    },
    "manager@pineco.internal": {
        "id": "usr-manager-marcus",
        "email": "manager@pineco.internal",
        "name": "Marcus Vance",
        "role": "brand_manager",
        "title": "Head of Brand Governance",
        "department": "Global Brand Office",
        "avatar": "MV",
    },
    "admin@pineco.internal": {
        "id": "usr-admin-alex",
        "email": "admin@pineco.internal",
        "name": "Alex Thorne",
        "role": "admin",
        "title": "Enterprise Administrator",
        "department": "Platform Operations",
        "avatar": "AT",
    },
}


def create_jwt_token(user_data: Dict[str, Any]) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "name": user_data["name"],
        "role": user_data.get("role", "reviewer"),
        "title": user_data.get("title", "Governance Specialist"),
        "department": user_data.get("department", "Enterprise"),
        "workspace_id": user_data.get("workspace_id", settings.DEFAULT_WORKSPACE_ID),
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    import jwt
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Dict[str, Any]:
    import jwt
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
        )


async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
) -> Dict[str, Any]:
    """Extracts user from JWT token if present, otherwise returns default demo reviewer."""
    if auth and auth.credentials:
        return decode_jwt_token(auth.credentials)
    return DEMO_USERS["reviewer@pineco.internal"]

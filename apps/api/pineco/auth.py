import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pineco.config import settings

JWT_SECRET = getattr(settings, "AUTH_SECRET", "pineco-codeaxis-jwt-auth-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security_bearer = HTTPBearer(auto_error=False)

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
        "role": user_data["role"],
        "title": user_data["title"],
        "department": user_data.get("department", "Enterprise"),
        "workspace_id": settings.DEFAULT_WORKSPACE_ID,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Dict[str, Any]:
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
    """Extracts user from JWT token if present, otherwise returns default demo user."""
    if auth and auth.credentials:
        return decode_jwt_token(auth.credentials)
    # Default fallback demo user for effortless evaluation
    return DEMO_USERS["reviewer@pineco.internal"]

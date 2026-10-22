from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Security
from pydantic import BaseModel, EmailStr
from pineco.auth import DEMO_USERS, create_jwt_token, get_current_user_optional, security_bearer, decode_jwt_token
from fastapi.security import HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["Authentication & JWT"])


class LoginRequest(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    title: str
    department: str
    avatar: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


@router.get("/demo-accounts", response_model=List[UserProfileResponse])
def get_demo_accounts():
    """Returns the list of seeded demo enterprise accounts for 1-click evaluation."""
    return list(DEMO_USERS.values())


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Authenticates user and returns a signed JWT bearer token.
    Supports login via email, or 1-click role selection (creator, reviewer, brand_manager, admin).
    """
    matched_user = None

    if payload.email:
        email_clean = payload.email.strip().lower()
        matched_user = DEMO_USERS.get(email_clean)
        # Match by email prefix
        if not matched_user:
            for u in DEMO_USERS.values():
                if u["email"].startswith(email_clean.split("@")[0]):
                    matched_user = u
                    break

    if not matched_user and payload.role:
        for u in DEMO_USERS.values():
            if u["role"] == payload.role.lower():
                matched_user = u
                break

    # If still not matched, default to reviewer for easiest review demo
    if not matched_user:
        matched_user = DEMO_USERS["reviewer@pineco.internal"]

    token = create_jwt_token(matched_user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": matched_user,
    }


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
):
    """Returns the currently authenticated user extracted from the JWT token."""
    if not auth or not auth.credentials:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    payload = decode_jwt_token(auth.credentials)
    return {
        "id": payload.get("sub", ""),
        "email": payload.get("email", ""),
        "name": payload.get("name", ""),
        "role": payload.get("role", ""),
        "title": payload.get("title", ""),
        "department": payload.get("department", "Enterprise"),
        "avatar": "".join([p[0] for p in payload.get("name", "User").split()[:2]]).upper(),
    }

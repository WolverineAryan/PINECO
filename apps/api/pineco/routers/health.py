from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pineco.database import get_db
from pineco.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """Health readiness check verifying database connectivity and provider configuration."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    ai_configured = bool(settings.LLM_API_KEY)
    ai_status = f"configured ({settings.LLM_PROVIDER})" if ai_configured else "offline_fallback_mode"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "app_env": settings.APP_ENV,
        "database": db_status,
        "ai_provider": ai_status,
        "engine_version": "pineco-v1.0",
    }

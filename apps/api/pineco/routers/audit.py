from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from pineco.database import get_db
from pineco.config import settings
from pineco.models import AuditEvent, Submission
from pineco.schemas import AuditEventResponse

router = APIRouter(tags=["Audit Trail"])


@router.get("/submissions/{submission_id}/audit", response_model=List[AuditEventResponse])
def get_submission_audit_trail(
    submission_id: str,
    db: Session = Depends(get_db),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        return []

    # Get events matching the submission entity or related entities
    events = (
        db.query(AuditEvent)
        .filter(
            (AuditEvent.entity_id == submission_id)
            | (AuditEvent.metadata_json.contains(submission_id))
        )
        .order_by(AuditEvent.created_at.desc())
        .all()
    )
    return events


@router.get("/audit", response_model=List[AuditEventResponse])
def list_workspace_audit_trail(
    workspace_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID
    return (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == ws_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(limit)
        .all()
    )

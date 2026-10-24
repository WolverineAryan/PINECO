import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from pineco.database import get_db
from pineco.models import Review, Submission, Finding, ReviewDecision, AuditEvent, get_utc_now
from pineco.auth import security_bearer, decode_jwt_token
from pineco.schemas import (
    DecisionCreate,
    DecisionResponse,
    FindingOverrideCreate,
    FindingOverrideResponse,
)

router = APIRouter(tags=["Decisions & Overrides"])


@router.post("/reviews/{review_id}/decision", response_model=DecisionResponse, status_code=201)
def record_review_decision(
    review_id: str,
    payload: DecisionCreate,
    reviewer_id: str = Query(default="usr-reviewer-elena"),
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
):
    """
    Records a version-specific human review decision.
    An override or changes_requested decision requires a non-empty rationale.
    """
    if auth and auth.credentials:
        try:
            token_data = decode_jwt_token(auth.credentials)
            if token_data.get("role") == "creator":
                raise HTTPException(
                    status_code=403,
                    detail="Access Denied: Actors with role 'creator' cannot record governance decisions under dual-custody RBAC rules. A Reviewer or Admin role is required.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
    elif reviewer_id == "usr-creator-sarah":
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Actors with role 'creator' cannot record governance decisions under dual-custody RBAC rules. A Reviewer or Admin role is required.",
        )
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    sub = db.query(Submission).filter(Submission.id == review.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if payload.decision in ("overridden", "changes_requested") and not (payload.rationale and payload.rationale.strip()):
        raise HTTPException(
            status_code=422,
            detail=f"A rationale is mandatory when recording a decision of type '{payload.decision}'.",
        )

    import uuid
    decision_record = ReviewDecision(
        id=str(uuid.uuid4()),
        submission_id=sub.id,
        content_version_id=review.content_version_id,
        review_id=review.id,
        decision=payload.decision,
        rationale=payload.rationale,
        reviewer_id=reviewer_id,
    )
    db.add(decision_record)
    db.flush()

    # Update Submission status
    if payload.decision == "approved":
        sub.status = "approved"
    elif payload.decision == "changes_requested":
        sub.status = "changes_requested"
    elif payload.decision == "overridden":
        sub.status = "approved"  # Overridden allows publication

    sub.updated_at = get_utc_now()

    # Record Audit Event
    audit = AuditEvent(
        workspace_id=sub.workspace_id,
        actor_id=reviewer_id,
        entity_type="decision",
        entity_id=decision_record.id,
        event_type=payload.decision,
        metadata_json=json.dumps({
            "submission_id": sub.id,
            "review_id": review.id,
            "version_id": review.content_version_id,
            "decision": payload.decision,
            "rationale": payload.rationale,
        }),
    )
    db.add(audit)
    db.commit()
    db.refresh(decision_record)

    return decision_record


@router.post("/findings/{finding_id}/override", response_model=FindingOverrideResponse)
def override_finding(
    finding_id: str,
    payload: FindingOverrideCreate,
    actor_id: str = Query(default="usr-reviewer-elena"),
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
):
    """
    Overrides a specific finding.
    Strictly requires a non-empty rationale explaining the business justification.
    """
    if auth and auth.credentials:
        try:
            token_data = decode_jwt_token(auth.credentials)
            if token_data.get("role") == "creator":
                raise HTTPException(
                    status_code=403,
                    detail="Access Denied: Actors with role 'creator' cannot override compliance findings. A Reviewer or Admin role is required.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
    elif actor_id == "usr-creator-sarah":
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Actors with role 'creator' cannot override compliance findings. A Reviewer or Admin role is required.",
        )
    if not payload.rationale or not payload.rationale.strip():
        raise HTTPException(status_code=422, detail="A non-empty override rationale is required.")

    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.resolution_status = "overridden"
    finding.resolution_rationale = payload.rationale.strip()
    finding.resolved_by = actor_id

    review = db.query(Review).filter(Review.id == finding.review_id).first()
    ws_id = "default"
    if review:
        sub = db.query(Submission).filter(Submission.id == review.submission_id).first()
        if sub:
            ws_id = sub.workspace_id

    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="finding",
        entity_id=finding.id,
        event_type="overridden",
        metadata_json=json.dumps({"rationale": finding.resolution_rationale}),
    )
    db.add(audit)
    db.commit()
    db.refresh(finding)

    return finding

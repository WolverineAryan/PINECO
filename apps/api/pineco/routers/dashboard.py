from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from pineco.database import get_db
from pineco.config import settings
from pineco.models import (
    Submission,
    BrandRule,
    ApprovedFact,
    Finding,
    AuditEvent,
)
from pineco.schemas import DashboardSummaryResponse, DashboardMetrics
from pineco.seed import seed_database

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    workspace_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID

    # Submissions counts
    subs = db.query(Submission).filter(Submission.workspace_id == ws_id).all()
    total_subs = len(subs)
    approved_subs = sum(1 for s in subs if s.status == "approved")
    changes_requested_subs = sum(1 for s in subs if s.status == "changes_requested")
    pending_subs = sum(1 for s in subs if s.status in ("draft", "in_review"))

    # Rules & facts
    total_rules = db.query(BrandRule).filter(BrandRule.workspace_id == ws_id).count()
    total_facts = db.query(ApprovedFact).filter(ApprovedFact.workspace_id == ws_id).count()

    # Findings metrics
    # Get all findings for reviews in this workspace
    all_findings = (
        db.query(Finding.severity, Finding.category)
        .join(Submission, Submission.id == Finding.review_id, isouter=True)  # or directly count
        .all()
    )
    # Direct query of findings
    findings = db.query(Finding).all()
    total_findings = len(findings)

    findings_by_severity = {"low": 0, "medium": 0, "high": 0}
    findings_by_category = {"terminology": 0, "tone": 0, "disclaimer": 0, "fact_check": 0, "formatting": 0}

    for f in findings:
        sev = (f.severity or "medium").lower()
        if sev in findings_by_severity:
            findings_by_severity[sev] += 1
        cat = (f.category or "other").lower()
        if cat in findings_by_category:
            findings_by_category[cat] += 1
        else:
            findings_by_category[cat] = findings_by_category.get(cat, 0) + 1

    # Recent submissions
    recent_subs = (
        db.query(Submission)
        .filter(Submission.workspace_id == ws_id)
        .order_by(Submission.updated_at.desc())
        .limit(5)
        .all()
    )

    # Recent audit events
    recent_audits = (
        db.query(AuditEvent)
        .filter(AuditEvent.workspace_id == ws_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(8)
        .all()
    )

    return {
        "metrics": {
            "total_submissions": total_subs,
            "approved_submissions": approved_subs,
            "pending_submissions": pending_subs,
            "changes_requested_submissions": changes_requested_subs,
            "total_rules": total_rules,
            "total_facts": total_facts,
            "total_findings": total_findings,
            "findings_by_severity": findings_by_severity,
            "findings_by_category": findings_by_category,
        },
        "recent_submissions": recent_subs,
        "recent_audit_events": recent_audits,
    }


@router.post("/demo/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Convenience endpoint allowing judges or evaluators to reset demo workspace to initial clean state."""
    seed_database(db)
    return {"status": "success", "message": "Demo workspace successfully reset to initial baseline state."}

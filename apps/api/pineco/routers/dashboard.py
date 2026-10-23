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
    product_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID

    # 1. Submissions counts via SQL aggregation
    status_counts_q = db.query(Submission.status, func.count(Submission.id)).filter(Submission.workspace_id == ws_id)
    if product_id:
        status_counts_q = status_counts_q.filter(Submission.product_id == product_id)
    status_rows = status_counts_q.group_by(Submission.status).all()
    status_map = {row[0]: row[1] for row in status_rows}

    total_subs = sum(status_map.values())
    approved_subs = status_map.get("approved", 0)
    changes_requested_subs = status_map.get("changes_requested", 0)
    pending_subs = status_map.get("draft", 0) + status_map.get("in_review", 0)

    # 2. Rules & facts counts via SQL COUNT
    rules_q = db.query(func.count(BrandRule.id)).filter(BrandRule.workspace_id == ws_id)
    if product_id:
        rules_q = rules_q.filter((BrandRule.product_id == product_id) | (BrandRule.product_id.is_(None)))
    total_rules = rules_q.scalar() or 0

    facts_q = db.query(func.count(ApprovedFact.id)).filter(ApprovedFact.workspace_id == ws_id)
    if product_id:
        facts_q = facts_q.filter((ApprovedFact.product_id == product_id) | (ApprovedFact.product_id.is_(None)))
    total_facts = facts_q.scalar() or 0

    # 3. Findings metrics via SQL GROUP BY joining Review & Submission (scalable for large volume data)
    from pineco.models import Review
    findings_q = (
        db.query(Finding.severity, Finding.category, func.count(Finding.id))
        .join(Review, Finding.review_id == Review.id)
        .join(Submission, Review.submission_id == Submission.id)
        .filter(Submission.workspace_id == ws_id)
    )
    if product_id:
        findings_q = findings_q.filter(Submission.product_id == product_id)
    finding_rows = findings_q.group_by(Finding.severity, Finding.category).all()

    total_findings = sum(row[2] for row in finding_rows)
    findings_by_severity = {"low": 0, "medium": 0, "high": 0}
    findings_by_category = {"terminology": 0, "tone": 0, "disclaimer": 0, "fact_check": 0, "formatting": 0}

    for sev, cat, count in finding_rows:
        s = (sev or "medium").lower()
        if s in findings_by_severity:
            findings_by_severity[s] += count
        else:
            findings_by_severity[s] = count

        c = (cat or "other").lower()
        if c in findings_by_category:
            findings_by_category[c] += count
        else:
            findings_by_category[c] = count

    # Recent submissions
    recent_subs_q = db.query(Submission).filter(Submission.workspace_id == ws_id)
    if product_id:
        recent_subs_q = recent_subs_q.filter(Submission.product_id == product_id)
    recent_subs = recent_subs_q.order_by(Submission.updated_at.desc()).limit(5).all()

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

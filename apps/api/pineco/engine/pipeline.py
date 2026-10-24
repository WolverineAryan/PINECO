import json
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from pineco.models import (
    Submission,
    ContentVersion,
    Review,
    Finding,
    BrandRule,
    ApprovedFact,
    AuditEvent,
    get_utc_now,
)
from pineco.engine.deterministic import run_deterministic_rules
from pineco.engine.llm_adapter import llm_adapter

logger = logging.getLogger("pineco.engine.pipeline")


async def execute_review_pipeline(
    db: Session,
    submission_id: str,
    content_version_id: str,
    actor_id: str,
) -> Review:
    """
    Executes the end-to-end governance review pipeline:
    1. Validates content version and submission.
    2. Loads workspace rules and approved facts.
    3. Runs deterministic checks (prohibited terms, disclaimers).
    4. Calls LLM adapter with strict schema & database fact verification.
    5. Merges findings cleanly.
    6. Persists review, findings, and audit events.
    """
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise ValueError(f"Submission {submission_id} not found")

    version = db.query(ContentVersion).filter(ContentVersion.id == content_version_id).first()
    if not version:
        raise ValueError(f"ContentVersion {content_version_id} not found")

    # Create Review record in running state
    review = Review(
        submission_id=submission.id,
        content_version_id=version.id,
        status="running",
        engine_version="pineco-v1.0",
        started_at=get_utc_now(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Load workspace rules and candidate facts (scoped to submission's product folder if assigned)
    rules_q = db.query(BrandRule).filter(
        BrandRule.workspace_id == submission.workspace_id,
        BrandRule.enabled == True,
    )
    if submission.product_id:
        rules_q = rules_q.filter((BrandRule.product_id == submission.product_id) | (BrandRule.product_id.is_(None)))
    else:
        rules_q = rules_q.filter((BrandRule.product_id == "prod-pineco-core") | (BrandRule.product_id.is_(None)))
    rules = rules_q.all()

    facts_q = db.query(ApprovedFact).filter(
        ApprovedFact.workspace_id == submission.workspace_id,
    )
    if submission.product_id:
        facts_q = facts_q.filter((ApprovedFact.product_id == submission.product_id) | (ApprovedFact.product_id.is_(None)))
    else:
        facts_q = facts_q.filter((ApprovedFact.product_id == "prod-pineco-core") | (ApprovedFact.product_id.is_(None)))
    facts = facts_q.all()

    # Step 1: Run Deterministic Engine
    deterministic_findings = run_deterministic_rules(version.content_text, rules)

    # Step 2: Run AI Provider Adapter (tone, claims, fact alignment)
    ai_findings, warning_summary = await llm_adapter.analyze_content(
        content_text=version.content_text,
        channel=submission.channel,
        rules=rules,
        facts=facts,
    )

    # Step 3: Merge findings
    all_raw_findings = deterministic_findings + ai_findings

    # Persist findings to database
    db_findings = []
    has_high_severity = False

    for item in all_raw_findings:
        if item.get("severity") == "high":
            has_high_severity = True

        f_record = Finding(
            review_id=review.id,
            category=item.get("category", "other"),
            severity=item.get("severity", "medium"),
            confidence=item.get("confidence", 1.0),
            excerpt=item.get("excerpt", ""),
            start_offset=item.get("start_offset"),
            end_offset=item.get("end_offset"),
            explanation=item.get("explanation", ""),
            evidence_status=item.get("evidence_status", "unverified"),
            rule_id=item.get("rule_id"),
            fact_id=item.get("fact_id"),
            suggested_correction=item.get("suggested_correction"),
            resolution_status="open",
            source_origin=item.get("source_origin", "rule_engine"),
        )
        db.add(f_record)
        db_findings.append(f_record)

    # Determine Review final status
    final_status = "completed_with_warnings" if warning_summary else "completed"
    review.status = final_status
    review.completed_at = get_utc_now()
    review.warning_summary = warning_summary

    # Update Submission status
    submission.status = "changes_requested" if has_high_severity else "in_review"
    submission.current_version_id = version.id
    submission.updated_at = get_utc_now()

    # Record Audit Event
    audit = AuditEvent(
        workspace_id=submission.workspace_id,
        actor_id=actor_id,
        entity_type="review",
        entity_id=review.id,
        event_type="completed",
        metadata_json=json.dumps({
            "submission_id": submission.id,
            "version_number": version.version_number,
            "findings_count": len(all_raw_findings),
            "deterministic_count": len(deterministic_findings),
            "ai_count": len(ai_findings),
            "warning": warning_summary,
        }),
    )
    db.add(audit)

    db.commit()
    db.refresh(review)
    return review

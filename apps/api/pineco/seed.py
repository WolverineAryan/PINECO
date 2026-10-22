import hashlib
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from pineco.config import settings
from pineco.database import SessionLocal, Base, engine
from pineco.models import (
    Product,
    BrandRule,
    ApprovedFact,
    Submission,
    ContentVersion,
    Review,
    Finding,
    ReviewDecision,
    AuditEvent,
    User,
    get_utc_now,
)
from pineco.auth import hash_password, DEMO_USERS
from pineco.engine.deterministic import run_deterministic_rules


def calculate_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def seed_database(db: Session) -> None:
    """Populates repeatable seed data for demo workspace."""
    workspace_id = settings.DEFAULT_WORKSPACE_ID
    now = get_utc_now()

    # Clear existing demo workspace records to ensure clean repeatable state
    db.query(AuditEvent).filter(AuditEvent.workspace_id == workspace_id).delete()
    sub_ids = [s.id for s in db.query(Submission).filter(Submission.workspace_id == workspace_id).all()]
    if sub_ids:
        db.query(ReviewDecision).filter(ReviewDecision.submission_id.in_(sub_ids)).delete(synchronize_session=False)
        review_ids = [r.id for r in db.query(Review).filter(Review.submission_id.in_(sub_ids)).all()]
        if review_ids:
            db.query(Finding).filter(Finding.review_id.in_(review_ids)).delete(synchronize_session=False)
            db.query(Review).filter(Review.id.in_(review_ids)).delete(synchronize_session=False)
        db.query(ContentVersion).filter(ContentVersion.submission_id.in_(sub_ids)).delete(synchronize_session=False)
        db.query(Submission).filter(Submission.id.in_(sub_ids)).delete(synchronize_session=False)
    db.query(BrandRule).filter(BrandRule.workspace_id == workspace_id).delete()
    db.query(ApprovedFact).filter(ApprovedFact.workspace_id == workspace_id).delete()
    db.query(Product).filter(Product.workspace_id == workspace_id).delete()
    db.commit()

    # 0. Seed Demo Product (Folder)
    demo_product = Product(
        id="prod-demo-enterprise",
        workspace_id=workspace_id,
        name="Pineco Core Cloud",
        description="Flagship AI Brand Governance & Pre-Publication Compliance Platform",
        category="Enterprise Cloud",
        created_by=settings.DEFAULT_USER_ADMIN,
    )
    db.add(demo_product)

    # 0.1 Seed Default Users for Real JWT Auth
    for user_key, u_data in DEMO_USERS.items():
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            default_user = User(
                id=u_data["id"],
                workspace_id=workspace_id,
                email=u_data["email"],
                password_hash=hash_password("pineco2026!"),
                name=u_data["name"],
                role=u_data["role"],
                title=u_data.get("title", "Governance Specialist"),
                department=u_data.get("department", "Enterprise"),
            )
            db.add(default_user)
    db.commit()

    # 1. Seed Brand Rules
    rules = [
        BrandRule(
            id="rule-demo-001",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            name="Prohibited Absolute Claim: 'guaranteed results'",
            category="terminology",
            description="Brand policy prohibits absolute guarantees in marketing copy.",
            pattern="guaranteed results",
            preferred_replacement="proven approach",
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-demo-002",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            name="Prohibited Value Term: 'cheap'",
            category="terminology",
            description="Use value-oriented messaging rather than terms implying inferior quality.",
            pattern="cheap",
            preferred_replacement="cost-effective",
            severity="medium",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-demo-003",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            name="Mandatory Performance Disclaimer",
            category="disclaimer",
            description="All promotional and financial communications must include the standard forward-looking disclaimer.",
            pattern="Past performance is not indicative of future results",
            preferred_replacement=None,
            severity="high",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        BrandRule(
            id="rule-demo-004",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            name="Professional Non-Aggressive Tone",
            category="tone",
            description="Maintain an authoritative, transparent tone. Avoid aggressive countdowns and unsubstantiated leaps.",
            pattern=None,
            preferred_replacement=None,
            severity="medium",
            channel_scope="all",
            enabled=True,
            version=1,
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
    ]
    db.add_all(rules)
    db.commit()

    # 2. Seed Approved Facts
    facts = [
        ApprovedFact(
            id="fact-demo-001",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            statement="Pineco reduces compliance turnaround times by up to 68% across enterprise content teams.",
            source_title="Enterprise Benchmark & Value Report 2026",
            source_reference="REP-2026-68",
            source_url="https://docs.pineco.internal/reports/benchmark-2026",
            owner="Product Marketing",
            approval_status="approved",
            valid_from=now - timedelta(days=30),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-demo-002",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            statement="Pineco is strictly an advisory governance platform and does NOT provide automated legal or regulatory sign-off without certified human review.",
            source_title="Legal & Compliance Risk Charter v3.0",
            source_reference="LEG-POL-2026",
            source_url="https://docs.pineco.internal/legal/charter",
            owner="Office of General Counsel",
            approval_status="approved",
            valid_from=now - timedelta(days=60),
            valid_until=now + timedelta(days=730),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
        ApprovedFact(
            id="fact-demo-003",
            workspace_id=workspace_id,
            product_id="prod-demo-enterprise",
            statement="Pineco features deterministic rule evaluation, dual PostgreSQL/SQLite persistence, and server-side LLM provider adapters.",
            source_title="Pineco Technical Architecture Specification",
            source_reference="ENG-ARCH-001",
            source_url="https://docs.pineco.internal/architecture",
            owner="Platform Engineering",
            approval_status="approved",
            valid_from=now - timedelta(days=10),
            valid_until=now + timedelta(days=365),
            created_by=settings.DEFAULT_USER_MANAGER,
        ),
    ]
    db.add_all(facts)
    db.commit()

    # 3. Seed Sample Clean Submission (v1)
    clean_text = (
        "Our platform provides an accessible and cost-effective proven approach to enterprise brand governance. "
        "Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. "
        "Past performance is not indicative of future results."
    )
    clean_sub = Submission(
        id="sub-demo-clean",
        workspace_id=workspace_id,
        product_id="prod-demo-enterprise",
        title="Enterprise Brand Governance Launch Press Release",
        channel="press_release",
        created_by=settings.DEFAULT_USER_CREATOR,
        status="approved",
        created_at=now - timedelta(hours=3),
        updated_at=now - timedelta(hours=1),
    )
    db.add(clean_sub)
    db.commit()

    clean_v1 = ContentVersion(
        id="ver-demo-clean-v1",
        submission_id=clean_sub.id,
        version_number=1,
        content_text=clean_text,
        content_hash=calculate_sha256(clean_text),
        created_by=settings.DEFAULT_USER_CREATOR,
        created_at=now - timedelta(hours=3),
    )
    db.add(clean_v1)
    db.commit()

    clean_sub.current_version_id = clean_v1.id

    # Clean Review
    clean_review = Review(
        id="rev-demo-clean-01",
        submission_id=clean_sub.id,
        content_version_id=clean_v1.id,
        status="completed",
        engine_version="pineco-v1.0",
        started_at=now - timedelta(hours=2, minutes=55),
        completed_at=now - timedelta(hours=2, minutes=54),
    )
    db.add(clean_review)
    db.commit()

    # Clean Finding: Verified fact
    clean_finding = Finding(
        id="find-demo-clean-01",
        review_id=clean_review.id,
        category="fact_check",
        severity="low",
        confidence=0.98,
        excerpt="Pineco reduces compliance turnaround times by up to 68% across enterprise content teams.",
        explanation="Fact verified against approved benchmark source.",
        evidence_status="supported",
        fact_id="fact-demo-001",
        rule_id=None,
        resolution_status="accepted",
        source_origin="rule_engine",
    )
    db.add(clean_finding)

    # Clean Decision (Approved)
    clean_decision = ReviewDecision(
        id="dec-demo-clean-01",
        submission_id=clean_sub.id,
        content_version_id=clean_v1.id,
        review_id=clean_review.id,
        decision="approved",
        rationale="All mandatory guidelines passed and key metrics verified against 2026 Benchmark Report.",
        reviewer_id=settings.DEFAULT_USER_REVIEWER,
        created_at=now - timedelta(hours=1),
    )
    db.add(clean_decision)

    # 4. Seed Sample Violation Submission (Ready for review & revision)
    violation_text = (
        "Get guaranteed results with our cheap software! "
        "Pineco guarantees 100% automated regulatory sign-off without human review "
        "and immediately increases sales by 9000%! Sign up now before offer expires."
    )
    viol_sub = Submission(
        id="sub-demo-violation",
        workspace_id=workspace_id,
        product_id="prod-demo-enterprise",
        title="Q4 High-Growth Campaign Draft (Violations Sample)",
        channel="social",
        created_by=settings.DEFAULT_USER_CREATOR,
        status="changes_requested",
        created_at=now - timedelta(minutes=45),
        updated_at=now - timedelta(minutes=20),
    )
    db.add(viol_sub)
    db.commit()

    viol_v1 = ContentVersion(
        id="ver-demo-viol-v1",
        submission_id=viol_sub.id,
        version_number=1,
        content_text=violation_text,
        content_hash=calculate_sha256(violation_text),
        created_by=settings.DEFAULT_USER_CREATOR,
        created_at=now - timedelta(minutes=45),
    )
    db.add(viol_v1)
    db.commit()
    viol_sub.current_version_id = viol_v1.id

    viol_review = Review(
        id="rev-demo-viol-01",
        submission_id=viol_sub.id,
        content_version_id=viol_v1.id,
        status="completed",
        engine_version="pineco-v1.0",
        started_at=now - timedelta(minutes=40),
        completed_at=now - timedelta(minutes=39),
    )
    db.add(viol_review)
    db.commit()

    # Deterministic findings for violation
    f1 = Finding(
        id="find-demo-v1",
        review_id=viol_review.id,
        category="terminology",
        severity="high",
        confidence=1.0,
        excerpt="Get guaranteed results with our...",
        start_offset=4,
        end_offset=22,
        explanation="Prohibited absolute claim 'guaranteed results'. Policy prohibits unqualified promises.",
        evidence_status="contradicted",
        rule_id="rule-demo-001",
        suggested_correction="Replace 'guaranteed results' with 'proven approach'",
        resolution_status="open",
        source_origin="rule_engine",
    )
    f2 = Finding(
        id="find-demo-v2",
        review_id=viol_review.id,
        category="terminology",
        severity="medium",
        confidence=1.0,
        excerpt="...with our cheap software!...",
        start_offset=32,
        end_offset=37,
        explanation="Prohibited term 'cheap' lowers brand positioning.",
        evidence_status="contradicted",
        rule_id="rule-demo-002",
        suggested_correction="Replace 'cheap' with 'cost-effective'",
        resolution_status="open",
        source_origin="rule_engine",
    )
    f3 = Finding(
        id="find-demo-v3",
        review_id=viol_review.id,
        category="disclaimer",
        severity="high",
        confidence=1.0,
        excerpt="Missing required disclaimer: \"Past performance is not indicative of future results\"",
        explanation="Mandatory regulatory disclaimer is absent from promotional social copy.",
        evidence_status="contradicted",
        rule_id="rule-demo-003",
        suggested_correction="Add the required disclaimer: \"Past performance is not indicative of future results\"",
        resolution_status="open",
        source_origin="rule_engine",
    )
    f4 = Finding(
        id="find-demo-v4",
        review_id=viol_review.id,
        category="fact_check",
        severity="high",
        confidence=0.95,
        excerpt="Pineco guarantees 100% automated regulatory sign-off without human review",
        explanation="Directly contradicts Legal Risk Charter: Pineco is strictly advisory and NEVER gives automated legal sign-off.",
        evidence_status="contradicted",
        fact_id="fact-demo-002",
        suggested_correction="Remove claim of automated regulatory sign-off.",
        resolution_status="open",
        source_origin="llm",
    )
    f5 = Finding(
        id="find-demo-v5",
        review_id=viol_review.id,
        category="fact_check",
        severity="high",
        confidence=0.85,
        excerpt="...and immediately increases sales by 9000%!...",
        explanation="Unverified quantitative claim: '9000%' has no matching approved evidence in the database.",
        evidence_status="unverified",
        fact_id=None,
        suggested_correction="Provide approved benchmark study or delete exaggerated metric.",
        resolution_status="open",
        source_origin="llm",
    )
    db.add_all([f1, f2, f3, f4, f5])

    # 5. Seed Audit Events
    audits = [
        AuditEvent(
            workspace_id=workspace_id,
            actor_id=settings.DEFAULT_USER_MANAGER,
            entity_type="rule",
            entity_id="rule-demo-001",
            event_type="created",
            metadata_json=json.dumps({"name": "Prohibited Absolute Claim: 'guaranteed results'"}),
            created_at=now - timedelta(days=1),
        ),
        AuditEvent(
            workspace_id=workspace_id,
            actor_id=settings.DEFAULT_USER_CREATOR,
            entity_type="submission",
            entity_id=viol_sub.id,
            event_type="created",
            metadata_json=json.dumps({"title": viol_sub.title, "channel": viol_sub.channel}),
            created_at=now - timedelta(minutes=45),
        ),
        AuditEvent(
            workspace_id=workspace_id,
            actor_id="system-pipeline",
            entity_type="review",
            entity_id=viol_review.id,
            event_type="completed",
            metadata_json=json.dumps({"findings_count": 5, "severity_high": 4}),
            created_at=now - timedelta(minutes=39),
        ),
    ]
    db.add_all(audits)
    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_database(session)
    session.close()
    print("Pineco demo database seeded successfully.")

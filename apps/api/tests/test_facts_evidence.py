from datetime import datetime, timezone, timedelta
from pineco.models import ApprovedFact
from pineco.engine.llm_adapter import llm_adapter
from pineco.schemas import AIReviewResponseSchema, AIClaimOutput


def test_fact_id_integrity_and_rejection():
    """Verify that hallucinated/invented fact IDs are rejected and downgraded to unverified."""
    real_fact = ApprovedFact(
        id="fact-real-123",
        workspace_id="ws-test",
        statement="Pineco automates 68% of governance tasks.",
        source_title="Study 2026",
        source_reference="REF-01",
        owner="Marketing",
        approval_status="approved",
        valid_from=datetime.now(timezone.utc) - timedelta(days=1),
        valid_until=datetime.now(timezone.utc) + timedelta(days=100),
        created_by="tester",
    )

    schema = AIReviewResponseSchema(
        claims=[
            AIClaimOutput(
                claim_text="Pineco claims 99% accuracy.",
                evidence_status="supported",
                fact_ids=["fact-fake-999"],  # Invented fact ID not in database!
                explanation="Model claims this is verified.",
                confidence=0.9,
            ),
            AIClaimOutput(
                claim_text="Pineco automates 68% of governance tasks.",
                evidence_status="supported",
                fact_ids=["fact-real-123"],
                explanation="Verified by real study.",
                confidence=0.95,
            ),
        ],
        style_findings=[],
    )

    findings = llm_adapter._validate_and_convert_findings(schema, [real_fact])

    # First claim had invented fact ID -> must be downgraded to unverified!
    f1 = findings[0]
    assert f1["evidence_status"] == "unverified"
    assert f1["fact_id"] is None
    assert "Unverified: No matching approved database fact found" in f1["explanation"]

    # Second claim had legitimate fact ID -> remains supported
    f2 = findings[1]
    assert f2["evidence_status"] == "supported"
    assert f2["fact_id"] == "fact-real-123"

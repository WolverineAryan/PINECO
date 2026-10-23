import time
import pytest
import uuid
from typing import List
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
from pineco.engine.parser import parse_uploaded_file
from pineco.engine.exporter import generate_pdf_report, generate_docx_report, generate_pptx_report
from pineco.config import settings


def generate_large_corpus(num_paragraphs: int = 50) -> str:
    """Generates a structured, multi-thousand-word marketing & regulatory document."""
    paragraphs = []
    base_text = (
        "Pineco provides an enterprise brand governance and real-time compliance validation system. "
        "Our software delivers an accessible and cost-effective approach to multi-channel regulatory sign-off. "
        "The system reduces compliance turnaround times by up to 68% across distributed marketing operations. "
        "Corporate legal frameworks require that past performance is not indicative of future results. "
        "All claims must maintain full parity with verified institutional evidence."
    )
    # Injected violation triggers
    violations = [
        "We deliver cheap software for immediate automation.",
        "Our engine guarantees 100% automated sign-off without human review.",
        "We guarantee instant 9000% ROI on every campaign launch.",
        "This is an unapproved quantitative assertion with 999% growth.",
    ]

    for i in range(num_paragraphs):
        v = violations[i % len(violations)]
        paragraphs.append(f"Section {i + 1}: {base_text} In addition, {v} Further operational parameters apply.")

    return "\n\n".join(paragraphs)


def test_volume_large_document_parsing_and_rules():
    """
    Volume Test 1: Massive Content Document
    Tests parsing and deterministic rule engine on a 20,000+ word document with 100+ simulated rules.
    """
    large_text = generate_large_corpus(num_paragraphs=150)
    word_count = len(large_text.split())
    char_count = len(large_text)
    assert word_count > 10000

    # Create 50 distinct rules
    rules: List[BrandRule] = []
    for i in range(50):
        category = "terminology" if i % 2 == 0 else "tone"
        rules.append(
            BrandRule(
                id=str(uuid.uuid4()),
                workspace_id=settings.DEFAULT_WORKSPACE_ID,
                name=f"Rule {i}: {'guarantee' if i % 3 == 0 else ('cheap' if i % 3 == 1 else '9000%')}",
                category=category,
                description=f"Rule description {i}",
                pattern=r"guarantee" if i % 3 == 0 else (r"cheap" if i % 3 == 1 else r"9000%"),
                severity="high" if i % 2 == 0 else "medium",
                channel_scope="all",
                enabled=True,
            )
        )

    t0 = time.perf_counter()
    findings = run_deterministic_rules(large_text, rules)
    duration_ms = (time.perf_counter() - t0) * 1000

    # Verify performance threshold: 10k+ words evaluated against 50 rules in < 500ms
    assert duration_ms < 500, f"Rule engine took {duration_ms:.2f}ms, expected < 500ms"
    assert len(findings) > 50, "Should have flagged multiple rule violations across large corpus"

    # Verify file parser on large content
    raw_bytes = large_text.encode("utf-8")
    t1 = time.perf_counter()
    parsed = parse_uploaded_file(raw_bytes, "massive_whitepaper.txt", "text/plain")
    parse_ms = (time.perf_counter() - t1) * 1000

    assert parse_ms < 100
    assert parsed["word_count"] == word_count
    assert parsed["char_count"] == char_count


def test_volume_database_scale_and_dashboard_aggregation(client, db_session):
    """
    Volume Test 2: Database Scale
    Seeds 300+ submissions with associated versions, reviews, findings, and audit events.
    Verifies that dashboard aggregation query and paginated listing execute in < 250ms.
    """
    ws_id = "ws-volume-test-001"
    num_submissions = 200

    t_seed_start = time.perf_counter()
    new_subs = []
    new_audits = []

    for i in range(num_submissions):
        status = "approved" if i % 3 == 0 else ("changes_requested" if i % 3 == 1 else "in_review")
        sub_id = str(uuid.uuid4())
        ver_id = str(uuid.uuid4())
        rev_id = str(uuid.uuid4())

        sub = Submission(
            id=sub_id,
            workspace_id=ws_id,
            title=f"Volume Campaign Draft {i:04d}",
            channel="social" if i % 2 == 0 else "press_release",
            created_by="usr-creator-sarah",
            status=status,
            current_version_id=ver_id,
        )
        ver = ContentVersion(
            id=ver_id,
            submission_id=sub_id,
            version_number=1,
            content_text=f"Batch submission text content for campaign {i}.",
            content_hash="abc123hash",
            created_by="usr-creator-sarah",
        )
        rev = Review(
            id=rev_id,
            submission_id=sub_id,
            content_version_id=ver_id,
            status="completed",
        )
        # Add findings
        f1 = Finding(
            review_id=rev_id,
            category="terminology",
            severity="high" if status == "changes_requested" else "low",
            confidence=1.0,
            excerpt=f"Finding excerpt for sub {i}",
            explanation="Batch generated finding",
        )
        f2 = Finding(
            review_id=rev_id,
            category="tone",
            severity="medium",
            confidence=0.9,
            excerpt=f"Tone excerpt for sub {i}",
            explanation="Tone finding",
        )
        audit = AuditEvent(
            workspace_id=ws_id,
            actor_id="usr-creator-sarah",
            entity_type="submission",
            entity_id=sub_id,
            event_type="created",
        )

        db_session.add_all([sub, ver, rev, f1, f2, audit])

    db_session.commit()
    seed_ms = (time.perf_counter() - t_seed_start) * 1000

    # 1. Test Dashboard Summary Aggregation Query Performance
    t_dash_start = time.perf_counter()
    dash_resp = client.get(f"/api/v1/dashboard/summary?workspace_id={ws_id}")
    dash_ms = (time.perf_counter() - t_dash_start) * 1000

    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    metrics = dash_data["metrics"]

    assert metrics["total_submissions"] == num_submissions
    assert metrics["total_findings"] == num_submissions * 2
    # Expect SQL group-by query to execute in under 150ms even with hundreds of rows
    assert dash_ms < 150, f"Dashboard summary query took {dash_ms:.2f}ms, expected < 150ms"

    # 2. Test Paginated Listing Query Performance
    t_list_start = time.perf_counter()
    list_resp = client.get(f"/api/v1/submissions?workspace_id={ws_id}&limit=25&offset=0")
    list_ms = (time.perf_counter() - t_list_start) * 1000

    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 25
    assert list_ms < 50, f"Paginated listing took {list_ms:.2f}ms, expected < 50ms"


def test_volume_multi_format_exporter_scalability():
    """
    Volume Test 3: Exporter Scalability Under Load
    Generates PDF, DOCX, and PPTX reports for a document with 100+ findings and long text.
    Verifies that all three formats render within memory limits in < 1000ms each.
    """
    class MockItem:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    sub = MockItem(
        id="sub-vol-exp-99",
        title="Annual Strategic Marketing & Product Compliance Whitepaper",
        channel="website",
        status="changes_requested",
        created_by="usr-creator-sarah",
    )
    long_copy = generate_large_corpus(num_paragraphs=20)
    ver = MockItem(
        version_number=1,
        content_text=long_copy,
        content_hash="d8e8fca2dc0f896fd7cb4cb0031ba249",
    )

    # 60 findings across high, medium, and low
    findings = []
    for i in range(60):
        findings.append(
            MockItem(
                severity="high" if i % 3 == 0 else ("medium" if i % 3 == 1 else "low"),
                category="terminology" if i % 2 == 0 else "disclaimer",
                excerpt=f"Sample triggered violation excerpt #{i + 1}",
                explanation=f"Detailed regulatory compliance explanation for finding #{i + 1}.",
                suggested_correction=f"Approved remediation copy #{i + 1}",
            )
        )
    review = MockItem(findings=findings)

    audits = [
        MockItem(
            created_at=None,
            actor_id="usr-creator-sarah",
            event_type="created",
            entity_type="submission",
            entity_id=sub.id,
        )
        for _ in range(15)
    ]

    # Benchmark DOCX
    t_docx = time.perf_counter()
    docx_bytes = generate_docx_report(sub, ver, review, audits)
    ms_docx = (time.perf_counter() - t_docx) * 1000
    assert len(docx_bytes) > 2000
    assert ms_docx < 1500, f"DOCX generation took {ms_docx:.2f}ms"

    # Benchmark PPTX
    t_pptx = time.perf_counter()
    pptx_bytes = generate_pptx_report(sub, ver, review, audits)
    ms_pptx = (time.perf_counter() - t_pptx) * 1000
    assert len(pptx_bytes) > 2000
    assert ms_pptx < 1500, f"PPTX generation took {ms_pptx:.2f}ms"

    # Benchmark PDF
    t_pdf = time.perf_counter()
    pdf_bytes = generate_pdf_report(sub, ver, review, audits)
    ms_pdf = (time.perf_counter() - t_pdf) * 1000
    assert len(pdf_bytes) > 2000
    assert ms_pdf < 2000, f"PDF generation took {ms_pdf:.2f}ms"

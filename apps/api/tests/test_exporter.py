import pytest
from pineco.engine.exporter import generate_docx_report, generate_pptx_report, generate_pdf_report


class MockObj:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.fixture
def mock_submission_data():
    sub = MockObj(
        id="sub-test-export-101",
        title="Q4 High-Yield Enterprise Solution",
        channel="social",
        status="changes_requested",
        created_by="usr-creator-sarah",
    )
    ver = MockObj(
        version_number=1,
        content_text="Guaranteed results with our cheap software! We guarantee 100% automated regulatory sign-off.",
        content_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )
    findings = [
        MockObj(
            severity="high",
            category="terminology",
            excerpt="guarantee 100%",
            explanation="Unsubstantiated absolute guarantee prohibited by SEC/FTC guidelines.",
            suggested_correction="designed to automate compliance reviews",
        ),
        MockObj(
            severity="medium",
            category="tone",
            excerpt="cheap software",
            explanation="Brand tone guidelines require 'cost-effective' or 'accessible'.",
            suggested_correction="cost-effective platform",
        ),
    ]
    review = MockObj(findings=findings)
    audit_events = [
        MockObj(
            created_at=None,
            actor_id="usr-creator-sarah",
            event_type="created",
            entity_type="submission",
            entity_id="sub-test-export-101",
        )
    ]
    return sub, ver, review, audit_events


def test_generate_docx_report(mock_submission_data):
    sub, ver, review, audits = mock_submission_data
    docx_bytes = generate_docx_report(sub, ver, review, audits)
    assert len(docx_bytes) > 500
    assert docx_bytes[:4] == b"PK\x03\x04"  # standard ZIP/OOXML header


def test_generate_pptx_report(mock_submission_data):
    sub, ver, review, audits = mock_submission_data
    pptx_bytes = generate_pptx_report(sub, ver, review, audits)
    assert len(pptx_bytes) > 500
    assert pptx_bytes[:4] == b"PK\x03\x04"  # standard ZIP/OOXML header


def test_generate_pdf_report(mock_submission_data):
    sub, ver, review, audits = mock_submission_data
    pdf_bytes = generate_pdf_report(sub, ver, review, audits)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")


def test_export_submission_endpoints(client):
    # 1. Create a submission
    payload = {
        "title": "Export Test Campaign",
        "channel": "social",
        "content": "Our cheap tool gives guaranteed returns. No human needed.",
    }
    create_resp = client.post("/api/v1/submissions", json=payload)
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["id"]

    # 2. Trigger review
    client.post(f"/api/v1/submissions/{sub_id}/reviews")

    # 3. Test PDF export
    pdf_resp = client.get(f"/api/v1/submissions/{sub_id}/export?format=pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert "pineco-report" in pdf_resp.headers["content-disposition"]
    assert pdf_resp.content.startswith(b"%PDF")

    # 4. Test DOCX export
    docx_resp = client.get(f"/api/v1/submissions/{sub_id}/export?format=docx")
    assert docx_resp.status_code == 200
    assert "wordprocessingml" in docx_resp.headers["content-type"]
    assert docx_resp.content[:4] == b"PK\x03\x04"

    # 5. Test PPTX export
    pptx_resp = client.get(f"/api/v1/submissions/{sub_id}/export?format=pptx")
    assert pptx_resp.status_code == 200
    assert "presentationml" in pptx_resp.headers["content-type"]
    assert pptx_resp.content[:4] == b"PK\x03\x04"

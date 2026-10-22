def test_end_to_end_core_workflow(client):
    """
    Core End-to-End Workflow Acceptance Test:
    1. Inspect rules & facts
    2. Submit content (v1)
    3. Run review -> check findings
    4. Revise content into v2
    5. Re-run review on v2
    6. Record reviewer decision (approve)
    7. Inspect audit history
    """
    # 1. Inspect rules and facts
    resp = client.get("/api/v1/rules")
    assert resp.status_code == 200
    rules = resp.json()
    assert len(rules) >= 3

    resp = client.get("/api/v1/facts")
    assert resp.status_code == 200
    facts = resp.json()
    assert len(facts) >= 3

    # 2. Submit content with violations (v1)
    sub_payload = {
        "title": "Autonomous Campaign Submission",
        "channel": "social",
        "content": "Get guaranteed results with our cheap software!",
    }
    resp = client.post("/api/v1/submissions", json=sub_payload)
    assert resp.status_code == 201
    sub_data = resp.json()
    sub_id = sub_data["id"]
    v1_id = sub_data["current_version_id"]
    assert sub_data["status"] == "draft"

    # 3. Trigger Review on v1
    resp = client.post(f"/api/v1/submissions/{sub_id}/reviews?version_id={v1_id}")
    assert resp.status_code == 201
    review_v1 = resp.json()
    assert review_v1["status"] in ("completed", "completed_with_warnings")
    findings = review_v1["findings"]
    assert len(findings) >= 2  # Prohibited term 'guaranteed results', 'cheap', missing disclaimer
    
    # Check that submission status updated to changes_requested due to high severity findings
    resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert resp.status_code == 200
    assert resp.json()["status"] == "changes_requested"

    # 4. Revise content into v2 (fixing prohibited terms and adding required disclaimer)
    v2_payload = {
        "content": (
            "Our platform provides an accessible proven approach to brand governance. "
            "Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. "
            "Past performance is not indicative of future results."
        )
    }
    resp = client.post(f"/api/v1/submissions/{sub_id}/versions", json=v2_payload)
    assert resp.status_code == 201
    v2_data = resp.json()
    v2_id = v2_data["id"]
    assert v2_data["version_number"] == 2

    # Check that previous version v1 still exists unchanged
    resp = client.get(f"/api/v1/submissions/{sub_id}")
    detail = resp.json()
    assert len(detail["versions"]) == 2
    assert detail["current_version_id"] == v2_id

    # 5. Run review on v2
    resp = client.post(f"/api/v1/submissions/{sub_id}/reviews?version_id={v2_id}")
    assert resp.status_code == 201
    review_v2 = resp.json()
    review_v2_id = review_v2["id"]
    # In v2, violations are fixed
    v2_violations = [f for f in review_v2["findings"] if f["severity"] == "high" and f["evidence_status"] == "contradicted"]
    assert len(v2_violations) == 0

    # 6. Record reviewer decision (approve)
    decision_payload = {
        "decision": "approved",
        "rationale": "All prohibited terms resolved and verified evidence present in v2.",
    }
    resp = client.post(f"/api/v1/reviews/{review_v2_id}/decision", json=decision_payload)
    assert resp.status_code == 201
    dec = resp.json()
    assert dec["decision"] == "approved"
    assert dec["content_version_id"] == v2_id

    # Verify submission is now approved
    resp = client.get(f"/api/v1/submissions/{sub_id}")
    assert resp.json()["status"] == "approved"

    # 7. Inspect audit history
    resp = client.get(f"/api/v1/submissions/{sub_id}/audit")
    assert resp.status_code == 200
    audit_events = resp.json()
    event_types = [e["event_type"] for e in audit_events]
    assert "created" in event_types
    assert "approved" in event_types

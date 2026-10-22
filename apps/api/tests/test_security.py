def test_override_requires_non_empty_rationale(client):
    # Get seeded violation finding
    resp = client.get("/api/v1/submissions/sub-demo-violation")
    assert resp.status_code == 200
    rev = resp.json()["latest_review"]
    assert rev is not None
    assert len(rev["findings"]) > 0
    finding_id = rev["findings"][0]["id"]

    # Attempt override with empty rationale -> must be rejected with 422!
    resp = client.post(f"/api/v1/findings/{finding_id}/override", json={"rationale": ""})
    assert resp.status_code == 422

    # Attempt override with spaces only -> rejected
    resp = client.post(f"/api/v1/findings/{finding_id}/override", json={"rationale": "   "})
    assert resp.status_code == 422

    # Valid override with business rationale
    resp = client.post(
        f"/api/v1/findings/{finding_id}/override",
        json={"rationale": "Approved by VP Marketing under special campaign exemption #881."},
    )
    assert resp.status_code == 200
    res = resp.json()
    assert res["resolution_status"] == "overridden"
    assert "Approved by VP Marketing" in res["resolution_rationale"]


def test_decision_rationale_required_for_changes_requested(client):
    resp = client.get("/api/v1/submissions/sub-demo-violation")
    rev = resp.json()["latest_review"]
    review_id = rev["id"]

    # Attempt changes_requested without rationale -> rejected 422
    resp = client.post(
        f"/api/v1/reviews/{review_id}/decision",
        json={"decision": "changes_requested", "rationale": ""},
    )
    assert resp.status_code == 422


def test_validation_error_envelope(client):
    # Invalid submission payload (title too short)
    resp = client.post("/api/v1/submissions", json={"title": "a", "content": "valid content"})
    assert resp.status_code == 422
    data = resp.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "request_id" in data["error"]

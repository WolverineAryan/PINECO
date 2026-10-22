import pytest
from fastapi.testclient import TestClient


def test_agent_status_endpoint(client: TestClient):
    response = client.get("/api/v1/agent/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ACTIVE_STANDBY"
    assert "CRITICAL_LEGAL" in data["supported_warning_tiers"]
    assert "REGULATORY_SENSITIVITY" in data["supported_warning_tiers"]
    assert data["autonomous_remediation"] is True


def test_agent_scan_generates_warnings_and_remediation(client: TestClient):
    payload = {
        "text": "Get guaranteed results with our software. pineco delivers 99.9% uptime.",
        "channel": "press_release",
    }
    response = client.post("/api/v1/agent/scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "complete"
    assert len(data["warnings"]) >= 1
    # Check that prohibited term was caught
    warning_categories = [w["category"] for w in data["warnings"]]
    assert "CRITICAL_LEGAL" in warning_categories or "REGULATORY_SENSITIVITY" in warning_categories
    # Check that remediation rewrote the prohibited term
    assert "guaranteed results" not in data["remediated_text"]
    assert "proven approach" in data["remediated_text"]

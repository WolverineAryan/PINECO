from pineco.models import BrandRule
from pineco.engine.deterministic import run_deterministic_rules


def test_prohibited_term_detection():
    rule = BrandRule(
        id="test-rule-1",
        workspace_id="ws-test",
        name="Prohibited Term 'cheap'",
        category="terminology",
        description="Don't use cheap",
        pattern="cheap",
        preferred_replacement="cost-effective",
        severity="medium",
        channel_scope="all",
        enabled=True,
        version=1,
        created_by="tester",
    )
    content = "Our cheap product is very affordable."
    findings = run_deterministic_rules(content, [rule])

    assert len(findings) == 1
    assert findings[0]["category"] == "terminology"
    assert findings[0]["severity"] == "medium"
    assert findings[0]["suggested_correction"] == "Replace 'cheap' with 'cost-effective'"
    assert findings[0]["start_offset"] == 4
    assert findings[0]["end_offset"] == 9


def test_missing_required_disclaimer():
    rule = BrandRule(
        id="test-rule-disc",
        workspace_id="ws-test",
        name="Required Disclaimer",
        category="disclaimer",
        description="Must have disclaimer",
        pattern="Past performance is not indicative of future results",
        severity="high",
        channel_scope="all",
        enabled=True,
        version=1,
        created_by="tester",
    )
    # Content without the disclaimer
    content = "Here is our quarterly promotional update."
    findings = run_deterministic_rules(content, [rule])

    assert len(findings) == 1
    assert findings[0]["category"] == "disclaimer"
    assert findings[0]["severity"] == "high"
    assert "Missing required disclaimer" in findings[0]["excerpt"]

    # Now with the disclaimer present
    content_valid = "Here is our promotional update. Past performance is not indicative of future results."
    findings_valid = run_deterministic_rules(content_valid, [rule])
    assert len(findings_valid) == 0


def test_disabled_rules_ignored():
    rule = BrandRule(
        id="test-rule-disabled",
        workspace_id="ws-test",
        name="Disabled Rule",
        category="terminology",
        description="Testing disabled rule",
        pattern="forbidden",
        severity="high",
        channel_scope="all",
        enabled=False,
        version=1,
        created_by="tester",
    )
    findings = run_deterministic_rules("This is forbidden text.", [rule])
    assert len(findings) == 0

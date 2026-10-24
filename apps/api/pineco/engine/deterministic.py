import re
import unicodedata
from typing import List, Dict, Any, Optional
from pineco.models import BrandRule


def normalize_text(text: str) -> str:
    """Normalize unicode characters for consistent deterministic matching."""
    return unicodedata.normalize("NFKC", text)


def run_deterministic_rules(content_text: str, rules: List[BrandRule]) -> List[Dict[str, Any]]:
    """
    Executes deterministic checks:
    1. Prohibited terms and preferred terminology
    2. Required disclaimers / phrases
    Returns structured findings with exact offsets, rule references, and suggested corrections.
    """
    findings: List[Dict[str, Any]] = []
    normalized_content = normalize_text(content_text)
    lower_content = normalized_content.lower()

    for rule in rules:
        if not rule.enabled:
            continue

        category = rule.category.lower()

        # Check 1: Required Disclaimer / Mandatory Phrase
        if category == "disclaimer":
            phrase_to_find = rule.pattern or rule.description
            if not phrase_to_find:
                continue

            # Strip leading/trailing \b if stored as regex token
            clean_phrase = re.sub(r"^\\b|\\b$", "", phrase_to_find).strip()
            # Check if required disclaimer is present
            lower_phrase = normalize_text(clean_phrase).lower()
            # If the required phrase is NOT in the content, flag finding
            if lower_phrase not in lower_content:
                findings.append({
                    "category": "disclaimer",
                    "severity": rule.severity or "high",
                    "confidence": 1.0,
                    "excerpt": f"Missing required disclaimer: \"{clean_phrase}\"",
                    "start_offset": None,
                    "end_offset": None,
                    "explanation": f"Mandatory disclaimer requirement violated: '{rule.name}'. The content does not contain the required regulatory/brand disclaimer.",
                    "evidence_status": "contradicted",  # policy contradicted
                    "rule_id": rule.id,
                    "fact_id": None,
                    "suggested_correction": f"Add the required disclaimer: \"{clean_phrase}\"",
                    "source_origin": "rule_engine",
                })
            continue

        # Check 2: Prohibited Terms & Preferred Terminology
        pattern = rule.pattern or rule.name
        if not pattern:
            continue

        normalized_pattern = normalize_text(pattern).strip()
        # Clean pattern of leading/trailing \b if present
        clean_term = re.sub(r"^\\b|\\b$", "", normalized_pattern).strip()
        escaped_pattern = re.escape(clean_term)
        # Use regex to find all matches with exact character offsets
        try:
            matches = list(re.finditer(rf"\b{escaped_pattern}\b", normalized_content, re.IGNORECASE))
        except re.error:
            # Fallback to simple substring finditer if pattern has regex issues
            matches = []
            idx = 0
            lower_p = normalized_pattern.lower()
            while idx < len(lower_content):
                pos = lower_content.find(lower_p, idx)
                if pos == -1:
                    break
                # Mock a simple match object like tuple
                class SimpleMatch:
                    def __init__(self, s, e):
                        self._s = s
                        self._e = e
                    def start(self): return self._s
                    def end(self): return self._e
                    def group(self): return normalized_content[self._s:self._e]
                matches.append(SimpleMatch(pos, pos + len(lower_p)))
                idx = pos + len(lower_p)

        for match in matches:
            start_idx = match.start()
            end_idx = match.end()
            matched_text = match.group()

            # Provide context around the match for the excerpt
            ctx_start = max(0, start_idx - 30)
            ctx_end = min(len(normalized_content), end_idx + 30)
            prefix = "..." if ctx_start > 0 else ""
            suffix = "..." if ctx_end < len(normalized_content) else ""
            excerpt = f"{prefix}{normalized_content[ctx_start:ctx_end]}{suffix}"

            explanation = f"Use of prohibited term '{matched_text}' detected by rule '{rule.name}'."
            if rule.description:
                explanation += f" Guideline: {rule.description}"

            suggested = None
            if rule.preferred_replacement:
                suggested = f"Replace '{matched_text}' with '{rule.preferred_replacement}'"

            findings.append({
                "category": rule.category,
                "severity": rule.severity or "medium",
                "confidence": 1.0,
                "excerpt": excerpt,
                "start_offset": start_idx,
                "end_offset": end_idx,
                "explanation": explanation,
                "evidence_status": "contradicted",
                "rule_id": rule.id,
                "fact_id": None,
                "suggested_correction": suggested,
                "source_origin": "rule_engine",
            })

    return findings

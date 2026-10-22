from datetime import datetime
from typing import Optional, List, Literal, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Common Enums / Types
# -------------------------------------------------------------
RuleCategory = Literal["terminology", "tone", "disclaimer", "factual", "formatting"]
SeverityLevel = Literal["low", "medium", "high"]
EvidenceStatus = Literal["supported", "contradicted", "unverified", "needs_human_review"]
SubmissionStatus = Literal["draft", "in_review", "changes_requested", "approved", "review_failed"]
ReviewStatus = Literal["queued", "running", "completed", "completed_with_warnings", "failed"]
DecisionType = Literal["approved", "changes_requested", "overridden"]
FindingResolution = Literal["open", "accepted", "dismissed_with_reason", "overridden"]


# -------------------------------------------------------------
# Standard Error Envelope
# -------------------------------------------------------------
class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


# -------------------------------------------------------------
# Brand Rules Schemas
# -------------------------------------------------------------
class RuleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: RuleCategory = "terminology"
    description: str = Field(..., min_length=3)
    pattern: Optional[str] = None
    preferred_replacement: Optional[str] = None
    severity: SeverityLevel = "medium"
    channel_scope: str = "all"
    enabled: bool = True
    workspace_id: Optional[str] = None


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[RuleCategory] = None
    description: Optional[str] = None
    pattern: Optional[str] = None
    preferred_replacement: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    channel_scope: Optional[str] = None
    enabled: Optional[bool] = None


class RuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    name: str
    category: str
    description: str
    pattern: Optional[str] = None
    preferred_replacement: Optional[str] = None
    severity: str
    channel_scope: str
    enabled: bool
    version: int
    created_by: str
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------
# Approved Facts Schemas
# -------------------------------------------------------------
class FactCreate(BaseModel):
    statement: str = Field(..., min_length=5)
    source_title: str = Field(..., min_length=2, max_length=255)
    source_reference: str = Field(..., min_length=2, max_length=255)
    source_url: Optional[str] = None
    owner: str = Field(..., min_length=2, max_length=128)
    approval_status: str = "approved"
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    workspace_id: Optional[str] = None


class FactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    statement: str
    source_title: str
    source_reference: str
    source_url: Optional[str] = None
    owner: str
    approval_status: str
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    created_by: str
    created_at: datetime


# -------------------------------------------------------------
# Submissions & Content Versions Schemas
# -------------------------------------------------------------
class SubmissionCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    channel: str = Field(default="all", max_length=64)
    content: str = Field(..., min_length=3)
    workspace_id: Optional[str] = None


class VersionCreate(BaseModel):
    content: str = Field(..., min_length=3)


class ContentVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    version_number: int
    content_text: str
    content_hash: str
    created_by: str
    created_at: datetime


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    title: str
    channel: str
    created_by: str
    status: str
    current_version_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------
# Findings & Reviews Schemas
# -------------------------------------------------------------
class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    review_id: str
    category: str
    severity: str
    confidence: float
    excerpt: str
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    explanation: str
    evidence_status: str
    rule_id: Optional[str] = None
    fact_id: Optional[str] = None
    suggested_correction: Optional[str] = None
    resolution_status: str
    resolution_rationale: Optional[str] = None
    resolved_by: Optional[str] = None
    source_origin: str
    created_at: datetime
    rule: Optional[RuleResponse] = None
    fact: Optional[FactResponse] = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    content_version_id: str
    status: str
    engine_version: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_code: Optional[str] = None
    warning_summary: Optional[str] = None
    findings: List[FindingResponse] = []


class SubmissionDetailResponse(SubmissionResponse):
    versions: List[ContentVersionResponse] = []
    current_version: Optional[ContentVersionResponse] = None
    latest_review: Optional[ReviewResponse] = None


# -------------------------------------------------------------
# Decision & Override Schemas
# -------------------------------------------------------------
class DecisionCreate(BaseModel):
    decision: DecisionType  # approved, changes_requested, overridden
    rationale: Optional[str] = None  # required if decision is overridden or changes_requested


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    content_version_id: str
    review_id: str
    decision: str
    rationale: Optional[str] = None
    reviewer_id: str
    created_at: datetime


class FindingOverrideCreate(BaseModel):
    rationale: str = Field(..., min_length=5, description="A non-empty rationale explaining why this finding is overridden is required")


class FindingOverrideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    resolution_status: str
    resolution_rationale: Optional[str] = None
    resolved_by: Optional[str] = None


# -------------------------------------------------------------
# Audit & Dashboard Schemas
# -------------------------------------------------------------
class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    actor_id: str
    entity_type: str
    entity_id: str
    event_type: str
    metadata_json: Optional[str] = None
    created_at: datetime


class DashboardMetrics(BaseModel):
    total_submissions: int
    approved_submissions: int
    pending_submissions: int
    changes_requested_submissions: int
    total_rules: int
    total_facts: int
    total_findings: int
    findings_by_severity: Dict[str, int]
    findings_by_category: Dict[str, int]


class DashboardSummaryResponse(BaseModel):
    metrics: DashboardMetrics
    recent_submissions: List[SubmissionResponse]
    recent_audit_events: List[AuditEventResponse]


# -------------------------------------------------------------
# AI Structured Output Contract
# -------------------------------------------------------------
class AIClaimOutput(BaseModel):
    claim_text: str
    evidence_status: EvidenceStatus
    fact_ids: List[str] = []
    explanation: str
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    suggested_correction: Optional[str] = None


class AIStyleFindingOutput(BaseModel):
    category: Literal["tone", "messaging", "terminology", "other"]
    excerpt: str
    severity: SeverityLevel
    explanation: str
    suggested_correction: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class AIReviewResponseSchema(BaseModel):
    claims: List[AIClaimOutput] = []
    style_findings: List[AIStyleFindingOutput] = []

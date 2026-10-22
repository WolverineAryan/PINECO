import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from pineco.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(64), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), nullable=False, default="Software")
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)


class BrandRule(Base):
    __tablename__ = "brand_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(64), nullable=False, index=True)
    product_id = Column(String(64), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False, index=True)  # terminology, tone, disclaimer, factual
    description = Column(Text, nullable=False)
    pattern = Column(String(255), nullable=True)  # string or regex to match
    preferred_replacement = Column(String(255), nullable=True)
    severity = Column(String(32), nullable=False, default="medium")  # low, medium, high
    channel_scope = Column(String(64), nullable=False, default="all")  # all, social, press_release, website, blog
    enabled = Column(Boolean, nullable=False, default=True)
    version = Column(Integer, nullable=False, default=1)
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    findings = relationship("Finding", back_populates="rule")


class ApprovedFact(Base):
    __tablename__ = "approved_facts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(64), nullable=False, index=True)
    product_id = Column(String(64), nullable=True, index=True)
    statement = Column(Text, nullable=False)
    source_title = Column(String(255), nullable=False)
    source_reference = Column(String(255), nullable=False)
    source_url = Column(String(512), nullable=True)
    owner = Column(String(128), nullable=False)
    approval_status = Column(String(32), nullable=False, default="approved")  # approved, draft, deprecated, rejected
    valid_from = Column(DateTime(timezone=True), nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    findings = relationship("Finding", back_populates="fact")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(64), nullable=False, index=True)
    product_id = Column(String(64), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    channel = Column(String(64), nullable=False, default="all")
    created_by = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="draft")  # draft, in_review, changes_requested, approved, review_failed
    current_version_id = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    versions = relationship("ContentVersion", back_populates="submission", cascade="all, delete-orphan", order_by="ContentVersion.version_number")
    reviews = relationship("Review", back_populates="submission", cascade="all, delete-orphan")
    decisions = relationship("ReviewDecision", back_populates="submission", cascade="all, delete-orphan")


class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    content_text = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False)
    created_by = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    submission = relationship("Submission", back_populates="versions")
    reviews = relationship("Review", back_populates="content_version")
    decisions = relationship("ReviewDecision", back_populates="content_version")

    __table_args__ = (
        Index("idx_submission_version", "submission_id", "version_number", unique=True),
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    content_version_id = Column(String(36), ForeignKey("content_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="queued")  # queued, running, completed, completed_with_warnings, failed
    engine_version = Column(String(32), nullable=False, default="pineco-v1.0")
    started_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_code = Column(String(64), nullable=True)
    warning_summary = Column(Text, nullable=True)

    submission = relationship("Submission", back_populates="reviews")
    content_version = relationship("ContentVersion", back_populates="reviews")
    findings = relationship("Finding", back_populates="review", cascade="all, delete-orphan")
    decisions = relationship("ReviewDecision", back_populates="review")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    review_id = Column(String(36), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(64), nullable=False)  # terminology, tone, disclaimer, fact_check, formatting
    severity = Column(String(32), nullable=False)  # low, medium, high
    confidence = Column(Float, nullable=False, default=1.0)
    excerpt = Column(Text, nullable=False)
    start_offset = Column(Integer, nullable=True)
    end_offset = Column(Integer, nullable=True)
    explanation = Column(Text, nullable=False)
    evidence_status = Column(String(32), nullable=False, default="unverified")  # supported, contradicted, unverified, needs_human_review
    rule_id = Column(String(36), ForeignKey("brand_rules.id", ondelete="SET NULL"), nullable=True)
    fact_id = Column(String(36), ForeignKey("approved_facts.id", ondelete="SET NULL"), nullable=True)
    suggested_correction = Column(Text, nullable=True)
    resolution_status = Column(String(32), nullable=False, default="open")  # open, accepted, dismissed_with_reason, overridden
    resolution_rationale = Column(Text, nullable=True)
    resolved_by = Column(String(64), nullable=True)
    source_origin = Column(String(32), nullable=False, default="rule_engine")  # rule_engine, llm
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    review = relationship("Review", back_populates="findings")
    rule = relationship("BrandRule", back_populates="findings")
    fact = relationship("ApprovedFact", back_populates="findings")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    content_version_id = Column(String(36), ForeignKey("content_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    review_id = Column(String(36), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    decision = Column(String(32), nullable=False)  # approved, changes_requested, overridden
    rationale = Column(Text, nullable=True)
    reviewer_id = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    submission = relationship("Submission", back_populates="decisions")
    content_version = relationship("ContentVersion", back_populates="decisions")
    review = relationship("Review", back_populates="decisions")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=False)  # submission, version, review, decision, rule, fact, finding
    entity_id = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False)  # created, updated, reviewed, approved, changes_requested, overridden
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    __table_args__ = (
        Index("idx_audit_workspace_created", "workspace_id", "created_at"),
    )

import hashlib
import json
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload

from pineco.database import get_db
from pineco.config import settings
from pineco.models import Submission, ContentVersion, Review, Finding, AuditEvent, get_utc_now
from pineco.engine.parser import parse_uploaded_file
from pineco.engine.pipeline import execute_review_pipeline
from pineco.schemas import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionDetailResponse,
    VersionCreate,
    ContentVersionResponse,
    ReviewResponse,
)

router = APIRouter(prefix="/submissions", tags=["Submissions"])


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@router.get("", response_model=List[SubmissionResponse])
def list_submissions(
    workspace_id: Optional[str] = Query(default=None),
    product_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID
    query = db.query(Submission).filter(Submission.workspace_id == ws_id)
    if product_id:
        query = query.filter(Submission.product_id == product_id)
    if status:
        query = query.filter(Submission.status == status)
    return query.order_by(Submission.updated_at.desc()).all()


@router.post("", response_model=SubmissionDetailResponse, status_code=201)
def create_submission(
    payload: SubmissionCreate,
    actor_id: str = Query(default="usr-creator-sarah"),
    db: Session = Depends(get_db),
):
    ws_id = payload.workspace_id or settings.DEFAULT_WORKSPACE_ID
    submission = Submission(
        workspace_id=ws_id,
        product_id=payload.product_id,
        title=payload.title,
        channel=payload.channel,
        created_by=actor_id,
        status="draft",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Create immutable Version 1
    content_hash = hash_text(payload.content)
    version = ContentVersion(
        submission_id=submission.id,
        version_number=1,
        content_text=payload.content,
        content_hash=content_hash,
        created_by=actor_id,
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    submission.current_version_id = version.id
    db.commit()

    # Record Audit Event
    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="submission",
        entity_id=submission.id,
        event_type="created",
        metadata_json=json.dumps({"title": submission.title, "channel": submission.channel}),
    )
    db.add(audit)
    db.commit()

    return {
        "id": submission.id,
        "workspace_id": submission.workspace_id,
        "title": submission.title,
        "channel": submission.channel,
        "created_by": submission.created_by,
        "status": submission.status,
        "current_version_id": submission.current_version_id,
        "created_at": submission.created_at,
        "updated_at": submission.updated_at,
        "versions": [version],
        "current_version": version,
        "latest_review": None,
    }


@router.get("/{submission_id}", response_model=SubmissionDetailResponse)
def get_submission_detail(submission_id: str, db: Session = Depends(get_db)):
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.versions),
            joinedload(Submission.reviews).joinedload(Review.findings).joinedload(Finding.rule),
            joinedload(Submission.reviews).joinedload(Review.findings).joinedload(Finding.fact),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    versions_sorted = sorted(sub.versions, key=lambda v: v.version_number)
    current_ver = next((v for v in versions_sorted if v.id == sub.current_version_id), None)
    if not current_ver and versions_sorted:
        current_ver = versions_sorted[-1]

    # Find latest review
    latest_review = None
    if sub.reviews:
        sorted_reviews = sorted(sub.reviews, key=lambda r: r.started_at, reverse=True)
        latest_review = sorted_reviews[0]

    return {
        "id": sub.id,
        "workspace_id": sub.workspace_id,
        "title": sub.title,
        "channel": sub.channel,
        "created_by": sub.created_by,
        "status": sub.status,
        "current_version_id": sub.current_version_id,
        "created_at": sub.created_at,
        "updated_at": sub.updated_at,
        "versions": versions_sorted,
        "current_version": current_ver,
        "latest_review": latest_review,
    }


@router.post("/{submission_id}/versions", response_model=ContentVersionResponse, status_code=201)
def create_version_revision(
    submission_id: str,
    payload: VersionCreate,
    actor_id: str = Query(default="usr-creator-sarah"),
    db: Session = Depends(get_db),
):
    """
    Creates an immutable new version for an existing submission.
    Preserves prior versions and their findings intact.
    Resets approval status on the submission.
    """
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Determine next version number
    max_ver = (
        db.query(ContentVersion.version_number)
        .filter(ContentVersion.submission_id == submission_id)
        .order_by(ContentVersion.version_number.desc())
        .first()
    )
    next_ver_num = (max_ver[0] + 1) if max_ver else 1

    content_hash = hash_text(payload.content)
    version = ContentVersion(
        submission_id=sub.id,
        version_number=next_ver_num,
        content_text=payload.content,
        content_hash=content_hash,
        created_by=actor_id,
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    # Update submission pointer and status
    sub.current_version_id = version.id
    sub.status = "draft"  # Editing after approval resets approval
    sub.updated_at = get_utc_now()
    db.commit()

    # Audit revision
    audit = AuditEvent(
        workspace_id=sub.workspace_id,
        actor_id=actor_id,
        entity_type="version",
        entity_id=version.id,
        event_type="created",
        metadata_json=json.dumps({"submission_id": sub.id, "version_number": next_ver_num}),
    )
    db.add(audit)
    db.commit()

    return version


@router.post("/parse-file")
async def parse_file_endpoint(
    file: UploadFile = File(...),
    client_text: Optional[str] = Form(default=None),
):
    """
    Parses any uploaded file format (PDF, DOCX, TXT, MD, Images)
    and extracts text for brand governance scanning.
    """
    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_MB}MB.",
        )

    res = parse_uploaded_file(
        file_bytes=file_bytes,
        filename=file.filename or "uploaded_document",
        content_type=file.content_type,
        client_extracted_text=client_text,
    )
    return res


@router.post("/upload-and-scan", status_code=201)
async def upload_and_scan_endpoint(
    file: UploadFile = File(...),
    title: Optional[str] = Form(default=None),
    channel: str = Form(default="social"),
    product_id: Optional[str] = Form(default=None),
    workspace_id: Optional[str] = Form(default=None),
    extracted_text: Optional[str] = Form(default=None),
    actor_id: str = Form(default="usr-creator-sarah"),
    db: Session = Depends(get_db),
):
    """
    1-Click file upload: ingests PDF, Word Doc, TXT, or Image (OCR),
    creates an immutable versioned submission, and triggers brand compliance audit.
    """
    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_MB}MB.",
        )

    parse_result = parse_uploaded_file(
        file_bytes=file_bytes,
        filename=file.filename or "uploaded_document",
        content_type=file.content_type,
        client_extracted_text=extracted_text,
    )

    final_text = (extracted_text or parse_result.get("extracted_text") or "").strip()
    if not final_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text could be extracted from this file. For scanned images or PDFs, please ensure OCR text is provided.",
        )

    sub_title = (title or "").strip()
    if not sub_title:
        base_name = os.path.splitext(file.filename or "Document")[0]
        sub_title = f"{base_name.replace('_', ' ').replace('-', ' ').title()} (Audit)"

    ws_id = workspace_id or settings.DEFAULT_WORKSPACE_ID

    # 1. Create Submission
    submission = Submission(
        workspace_id=ws_id,
        product_id=product_id,
        title=sub_title,
        channel=channel,
        created_by=actor_id,
        status="draft",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # 2. Create Version 1
    content_hash = hash_text(final_text)
    version = ContentVersion(
        submission_id=submission.id,
        version_number=1,
        content_text=final_text,
        content_hash=content_hash,
        created_by=actor_id,
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    submission.current_version_id = version.id
    db.commit()

    # 3. Audit Event
    audit = AuditEvent(
        workspace_id=ws_id,
        actor_id=actor_id,
        entity_type="submission",
        entity_id=submission.id,
        event_type="created",
        metadata_json=json.dumps({
            "title": submission.title,
            "filename": file.filename,
            "file_type": parse_result.get("file_type"),
            "file_hash": parse_result.get("file_hash"),
            "word_count": parse_result.get("word_count"),
        }),
    )
    db.add(audit)
    db.commit()

    # 4. Run Review Pipeline
    review = await execute_review_pipeline(
        db=db,
        submission_id=submission.id,
        content_version_id=version.id,
        actor_id=actor_id,
    )

    return {
        "submission_id": submission.id,
        "version_id": version.id,
        "title": submission.title,
        "channel": submission.channel,
        "status": submission.status,
        "review_id": review.id,
        "review_status": review.status,
        "findings_count": len(review.findings),
        "file_type": parse_result.get("file_type"),
        "filename": file.filename,
        "extracted_text": final_text,
    }


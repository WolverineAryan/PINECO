from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from pineco.database import get_db
from pineco.models import Submission, Review, Finding
from pineco.schemas import ReviewResponse
from pineco.engine.pipeline import execute_review_pipeline

router = APIRouter(tags=["Reviews"])


@router.post("/submissions/{submission_id}/reviews", response_model=ReviewResponse, status_code=201)
async def trigger_submission_review(
    submission_id: str,
    version_id: Optional[str] = Query(default=None),
    actor_id: str = Query(default="usr-creator-sarah"),
    db: Session = Depends(get_db),
):
    """
    Executes the comprehensive brand governance pipeline:
    - Runs deterministic checks against enabled brand rules
    - Performs LLM fact-checking and claim verification
    - Verifies returned fact IDs against database records
    - Merges findings and returns status
    """
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    target_version_id = version_id or sub.current_version_id
    if not target_version_id:
        raise HTTPException(status_code=400, detail="No content version available for review")

    review = await execute_review_pipeline(
        db=db,
        submission_id=sub.id,
        content_version_id=target_version_id,
        actor_id=actor_id,
    )

    # Re-fetch with joined relations
    hydrated_review = (
        db.query(Review)
        .options(
            joinedload(Review.findings).joinedload(Finding.rule),
            joinedload(Review.findings).joinedload(Finding.fact),
        )
        .filter(Review.id == review.id)
        .first()
    )
    return hydrated_review


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_review_results(review_id: str, db: Session = Depends(get_db)):
    review = (
        db.query(Review)
        .options(
            joinedload(Review.findings).joinedload(Finding.rule),
            joinedload(Review.findings).joinedload(Finding.fact),
        )
        .filter(Review.id == review_id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

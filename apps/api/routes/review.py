import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from core.models import get_db, ReviewQueueItem, Scholarship, utc_now

router = APIRouter(prefix="/review-queue", tags=["Review Queue"])

class ReviewActionRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    reviewer: str = "Admin"
    decision_notes: Optional[str] = None

@router.get("")
def list_review_queue(db: Session = Depends(get_db)):
    items = db.query(ReviewQueueItem).join(Scholarship, ReviewQueueItem.scholarship_id == Scholarship.id)\
              .filter(ReviewQueueItem.status == "PENDING")\
              .order_by(desc(ReviewQueueItem.created_at)).all()

    result = []
    for r in items:
        result.append({
            "id": str(r.id),
            "scholarship_id": str(r.scholarship_id),
            "scholarship_name": r.scholarship.name if r.scholarship else "Unknown",
            "provider": r.scholarship.provider if r.scholarship else "Unknown",
            "official_source_url": r.scholarship.official_source_url if r.scholarship else "",
            "confidence_score": r.scholarship.confidence_score if r.scholarship else 0.0,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at,
        })
    return result


@router.post("/{item_id}/action")
def take_review_action(
    item_id: str,
    req: ReviewActionRequest,
    db: Session = Depends(get_db)
):
    try:
        r_uuid = uuid.UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    item = db.query(ReviewQueueItem).filter(ReviewQueueItem.id == r_uuid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")

    action = req.action.upper()
    if action not in ("APPROVE", "REJECT"):
        raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT")

    item.status = "APPROVED" if action == "APPROVE" else "REJECTED"
    item.reviewer = req.reviewer
    item.decision_notes = req.decision_notes
    item.resolved_at = utc_now()

    # If approved, elevate scholarship status to VERIFIED
    if action == "APPROVE" and item.scholarship:
        item.scholarship.status = "VERIFIED"

    db.commit()
    return {"status": "SUCCESS", "review_status": item.status, "scholarship_id": str(item.scholarship_id)}

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from core.models import get_db, Scholarship, Source, ChangeEvent
from apps.api.schemas.api_schemas import MetricsResponse, ChangeEventResponse

router = APIRouter(tags=["Metrics & Changes"])

@router.get("/metrics", response_model=MetricsResponse)
def get_system_metrics(db: Session = Depends(get_db)):
    total_disc = db.query(func.count(Scholarship.id)).scalar() or 0
    verified = db.query(func.count(Scholarship.id)).filter(Scholarship.status == "VERIFIED").scalar() or 0
    review_req = db.query(func.count(Scholarship.id)).filter(Scholarship.status == "REVIEW_REQUIRED").scalar() or 0
    expiring_soon = db.query(func.count(Scholarship.id)).filter(Scholarship.status == "EXPIRING_SOON").scalar() or 0
    expired = db.query(func.count(Scholarship.id)).filter(Scholarship.status == "EXPIRED").scalar() or 0
    
    # Active includes VERIFIED and EXTRACTED
    active = db.query(func.count(Scholarship.id)).filter(Scholarship.status.in_(["VERIFIED", "EXTRACTED"])).scalar() or 0

    avg_conf = db.query(func.avg(Scholarship.confidence_score)).scalar() or 0.0
    total_src = db.query(func.count(Source.id)).scalar() or 0
    total_changes = db.query(func.count(ChangeEvent.id)).scalar() or 0

    return MetricsResponse(
        total_discovered=total_disc,
        verified_count=verified,
        review_required_count=review_req,
        active_count=active,
        expiring_soon_count=expiring_soon,
        expired_count=expired,
        average_confidence=round(float(avg_conf), 1),
        total_sources=total_src,
        total_changes_detected=total_changes
    )


@router.get("/changes", response_model=List[ChangeEventResponse])
def get_recent_changes(db: Session = Depends(get_db)):
    changes = db.query(ChangeEvent).join(Scholarship, ChangeEvent.scholarship_id == Scholarship.id)\
                .order_by(desc(ChangeEvent.detected_at)).limit(50).all()

    return [
        ChangeEventResponse(
            id=str(c.id),
            scholarship_id=str(c.scholarship_id),
            scholarship_name=c.scholarship.name if c.scholarship else "Unknown",
            field_name=c.field_name,
            old_value=c.old_value,
            new_value=c.new_value,
            severity=c.severity,
            detected_at=c.detected_at,
        )
        for c in changes
    ]

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from core.models import get_db, Scholarship, Evidence, ScholarshipVersion, Source
from apps.api.schemas.api_schemas import (
    ScholarshipListItem,
    ScholarshipDetail,
    EvidenceItemResponse,
    VersionItemResponse,
)

router = APIRouter(prefix="/scholarships", tags=["Scholarships"])

@router.get("", response_model=List[ScholarshipListItem])
def list_scholarships(
    status: Optional[str] = Query(None, description="Filter by status: VERIFIED, EXTRACTED, REVIEW_REQUIRED, EXPIRING_SOON, EXPIRED"),
    source_type: Optional[str] = Query(None, description="Filter by source type: GOVERNMENT, UNIVERSITY, CORPORATE, FOUNDATION"),
    min_confidence: Optional[float] = Query(None, description="Minimum confidence score"),
    provider: Optional[str] = Query(None, description="Filter by provider name"),
    q: Optional[str] = Query(None, description="Search term for name or provider"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Scholarship).join(Source, Scholarship.source_id == Source.id)

    if status:
        query = query.filter(Scholarship.status == status.upper())
    if source_type:
        query = query.filter(Source.source_type == source_type.upper())
    if min_confidence is not None:
        query = query.filter(Scholarship.confidence_score >= min_confidence)
    if provider:
        query = query.filter(Scholarship.provider.ilike(f"%{provider}%"))
    if q:
        query = query.filter(or_(
            Scholarship.name.ilike(f"%{q}%"),
            Scholarship.provider.ilike(f"%{q}%")
        ))

    items = query.order_by(desc(Scholarship.confidence_score), desc(Scholarship.last_verified_at)).offset(offset).limit(limit).all()

    result = []
    for item in items:
        result.append(ScholarshipListItem(
            id=str(item.id),
            canonical_key=item.canonical_key,
            name=item.name,
            provider=item.provider,
            source_type=item.source.source_type if item.source else "UNKNOWN",
            amount=item.amount,
            currency=item.currency or "INR",
            benefit_description=item.benefit_description,
            opening_date=item.opening_date,
            closing_date=item.closing_date,
            official_source_url=item.official_source_url,
            application_url=item.application_url,
            status=item.status,
            confidence_score=item.confidence_score,
            last_verified_at=item.last_verified_at,
        ))
    return result


@router.get("/{scholarship_id}", response_model=ScholarshipDetail)
def get_scholarship(scholarship_id: str, db: Session = Depends(get_db)):
    try:
        s_uuid = uuid.UUID(scholarship_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    item = db.query(Scholarship).filter(Scholarship.id == s_uuid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    return ScholarshipDetail(
        id=str(item.id),
        canonical_key=item.canonical_key,
        name=item.name,
        provider=item.provider,
        source_type=item.source.source_type if item.source else "UNKNOWN",
        amount=item.amount,
        currency=item.currency or "INR",
        benefit_description=item.benefit_description,
        opening_date=item.opening_date,
        closing_date=item.closing_date,
        official_source_url=item.official_source_url,
        application_url=item.application_url,
        status=item.status,
        confidence_score=item.confidence_score,
        last_verified_at=item.last_verified_at,
        eligibility_json=item.eligibility_json or {},
        academic_requirements=item.academic_requirements or [],
        income_limit=item.income_limit,
        age_criteria=item.age_criteria,
        gender_criteria=item.gender_criteria,
        category_criteria=item.category_criteria or [],
        domicile_requirements=item.domicile_requirements or [],
        documents_required=item.documents_required or [],
        selection_process=item.selection_process,
        renewal_requirements=item.renewal_requirements,
        confidence_breakdown=item.confidence_breakdown or {},
        first_discovered_at=item.first_discovered_at,
        last_changed_at=item.last_changed_at,
    )


@router.get("/{scholarship_id}/history", response_model=List[VersionItemResponse])
def get_scholarship_history(scholarship_id: str, db: Session = Depends(get_db)):
    try:
        s_uuid = uuid.UUID(scholarship_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    versions = db.query(ScholarshipVersion).filter(
        ScholarshipVersion.scholarship_id == s_uuid
    ).order_by(desc(ScholarshipVersion.version_number)).all()

    return [
        VersionItemResponse(
            id=str(v.id),
            version_number=v.version_number,
            payload_json=v.payload_json,
            content_hash=v.content_hash,
            valid_from=v.valid_from,
            valid_until=v.valid_until,
        )
        for v in versions
    ]


@router.get("/{scholarship_id}/evidence", response_model=List[EvidenceItemResponse])
def get_scholarship_evidence(scholarship_id: str, db: Session = Depends(get_db)):
    try:
        s_uuid = uuid.UUID(scholarship_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

    items = db.query(Evidence).filter(Evidence.scholarship_id == s_uuid).all()
    return [
        EvidenceItemResponse(
            id=str(e.id),
            field_name=e.field_name,
            extracted_value=e.extracted_value,
            quote=e.quote,
            char_start=e.char_start,
            char_end=e.char_end,
            dom_selector=e.dom_selector,
            snapshot_hash=e.snapshot_hash,
            extracted_at=e.extracted_at,
        )
        for e in items
    ]

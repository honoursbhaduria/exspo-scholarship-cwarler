from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from core.models import get_db, Source
from apps.api.schemas.api_schemas import SourceResponse

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.get("", response_model=List[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(Source).order_by(Source.provider_name).all()
    return [
        SourceResponse(
            id=str(s.id),
            domain=s.domain,
            base_url=s.base_url,
            provider_name=s.provider_name,
            source_type=s.source_type,
            trust_level=s.trust_level,
            is_active=s.is_active,
            crawl_frequency_hours=s.crawl_frequency_hours,
            robots_allowed=s.robots_allowed,
            created_at=s.created_at,
        )
        for s in sources
    ]

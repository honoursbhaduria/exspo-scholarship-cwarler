from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ScholarshipListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    canonical_key: str
    name: str
    provider: str
    source_type: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = "INR"
    benefit_description: Optional[str] = None
    opening_date: Optional[date] = None
    closing_date: Optional[date] = None
    official_source_url: str
    application_url: Optional[str] = None
    status: str
    confidence_score: float
    last_verified_at: datetime

class ScholarshipDetail(ScholarshipListItem):
    eligibility_json: Dict[str, Any]
    academic_requirements: List[str]
    income_limit: Optional[float] = None
    age_criteria: Optional[Dict[str, Any]] = None
    gender_criteria: Optional[str] = None
    category_criteria: List[str] = []
    domicile_requirements: List[str] = []
    documents_required: List[str] = []
    selection_process: Optional[str] = None
    renewal_requirements: Optional[str] = None
    confidence_breakdown: Dict[str, Any]
    first_discovered_at: datetime
    last_changed_at: datetime

class EvidenceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    field_name: str
    extracted_value: str
    quote: str
    char_start: Optional[int] = None
    char_end: Optional[int] = None
    dom_selector: Optional[str] = None
    snapshot_hash: str
    extracted_at: datetime

class VersionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version_number: int
    payload_json: Dict[str, Any]
    content_hash: str
    valid_from: datetime
    valid_until: Optional[datetime] = None

class ChangeEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scholarship_id: str
    scholarship_name: Optional[str] = None
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    severity: str
    detected_at: datetime

class SourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    domain: str
    base_url: str
    provider_name: str
    source_type: str
    trust_level: str
    is_active: bool
    crawl_frequency_hours: int
    robots_allowed: bool
    created_at: datetime

class CrawlRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    pages_discovered: int
    pages_crawled: int
    records_extracted: int
    records_verified: int
    review_required: int
    changes_detected: int
    error_count: int

class MetricsResponse(BaseModel):
    total_discovered: int
    verified_count: int
    review_required_count: int
    active_count: int
    expiring_soon_count: int
    expired_count: int
    average_confidence: float
    total_sources: int
    total_changes_detected: int

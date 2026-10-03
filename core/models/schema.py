import uuid
from datetime import date, datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, Date, DateTime, 
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from core.models.base import Base, utc_now

class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    base_url = Column(Text, nullable=False)
    provider_name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False) # GOVERNMENT, UNIVERSITY, CORPORATE, FOUNDATION, AGGREGATOR
    trust_level = Column(String(30), nullable=False, default="OFFICIAL_PRIMARY") # OFFICIAL_PRIMARY, SECONDARY, UNTRUSTED_DISCOVERY
    is_active = Column(Boolean, nullable=False, default=True)
    crawl_frequency_hours = Column(Integer, nullable=False, default=24)
    robots_allowed = Column(Boolean, nullable=False, default=True)
    rate_limit_per_minute = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    pages = relationship("SourcePage", back_populates="source", cascade="all, delete-orphan")
    scholarships = relationship("Scholarship", back_populates="source")


class CrawlRun(Base):
    __tablename__ = "crawl_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(30), nullable=False, default="RUNNING") # RUNNING, COMPLETED, FAILED
    pages_discovered = Column(Integer, default=0)
    pages_crawled = Column(Integer, default=0)
    records_extracted = Column(Integer, default=0)
    records_verified = Column(Integer, default=0)
    review_required = Column(Integer, default=0)
    changes_detected = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    execution_metadata = Column(JSONB, default=dict)

    source_pages = relationship("SourcePage", back_populates="crawl_run")
    change_events = relationship("ChangeEvent", back_populates="crawl_run")


class SourcePage(Base):
    __tablename__ = "source_pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    crawl_run_id = Column(UUID(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="SET NULL"), nullable=True)
    url = Column(Text, nullable=False)
    canonical_url = Column(Text, unique=True, nullable=False, index=True)
    content_hash = Column(String(64), nullable=False, index=True)
    snapshot_path = Column(Text, nullable=False)
    http_status = Column(Integer, nullable=False, default=200)
    content_type = Column(String(100), nullable=False, default="text/html")
    title = Column(Text, nullable=True)
    last_crawled_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_changed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_accessible = Column(Boolean, nullable=False, default=True)
    failure_count = Column(Integer, nullable=False, default=0)

    source = relationship("Source", back_populates="pages")
    crawl_run = relationship("CrawlRun", back_populates="source_pages")
    evidence_items = relationship("Evidence", back_populates="source_page")


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_key = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    provider = Column(String(255), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    official_source_url = Column(Text, nullable=False)
    application_url = Column(Text, nullable=True)

    # Benefit
    amount = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    benefit_description = Column(Text, nullable=True)

    # Structured Eligibility
    eligibility_json = Column(JSONB, nullable=False, default=dict)
    academic_requirements = Column(JSONB, nullable=False, default=list)
    income_limit = Column(Float, nullable=True)
    age_criteria = Column(JSONB, nullable=True)
    gender_criteria = Column(String(50), nullable=True) # ALL, FEMALE_ONLY, MALE_ONLY, TRANSGENDER_INCLUSIVE
    category_criteria = Column(JSONB, nullable=False, default=list) # SC, ST, OBC, GENERAL, MINORITY
    domicile_requirements = Column(JSONB, nullable=False, default=list)

    # Dates
    opening_date = Column(Date, nullable=True)
    closing_date = Column(Date, nullable=True, index=True)

    # Metadata & Process
    documents_required = Column(JSONB, nullable=False, default=list)
    selection_process = Column(Text, nullable=True)
    renewal_requirements = Column(Text, nullable=True)

    # Operational status & deterministic scoring
    status = Column(String(30), nullable=False, default="DISCOVERED", index=True) 
    # DISCOVERED, EXTRACTED, VERIFIED, REVIEW_REQUIRED, EXPIRING_SOON, EXPIRED, NO_LONGER_VERIFIABLE
    confidence_score = Column(Float, nullable=False, default=0.0)
    confidence_breakdown = Column(JSONB, nullable=False, default=dict)

    first_discovered_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_verified_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_changed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    source = relationship("Source", back_populates="scholarships")
    evidence_items = relationship("Evidence", back_populates="scholarship", cascade="all, delete-orphan")
    versions = relationship("ScholarshipVersion", back_populates="scholarship", cascade="all, delete-orphan", order_by="desc(ScholarshipVersion.version_number)")
    change_events = relationship("ChangeEvent", back_populates="scholarship", cascade="all, delete-orphan", order_by="desc(ChangeEvent.detected_at)")
    review_items = relationship("ReviewQueueItem", back_populates="scholarship", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False, index=True)
    source_page_id = Column(UUID(as_uuid=True), ForeignKey("source_pages.id", ondelete="CASCADE"), nullable=True)
    field_name = Column(String(100), nullable=False, index=True) # closing_date, amount, eligibility, income_limit, application_url, etc.
    extracted_value = Column(Text, nullable=False)
    quote = Column(Text, nullable=False) # Verbatim exact text from source
    char_start = Column(Integer, nullable=True)
    char_end = Column(Integer, nullable=True)
    dom_selector = Column(Text, nullable=True)
    snapshot_hash = Column(String(64), nullable=False)
    extracted_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scholarship = relationship("Scholarship", back_populates="evidence_items")
    source_page = relationship("SourcePage", back_populates="evidence_items")


class ScholarshipVersion(Base):
    __tablename__ = "scholarship_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    payload_json = Column(JSONB, nullable=False)
    content_hash = Column(String(64), nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scholarship = relationship("Scholarship", back_populates="versions")

    __table_args__ = (
        UniqueConstraint("scholarship_id", "version_number", name="uq_scholarship_version"),
    )


class ChangeEvent(Base):
    __tablename__ = "change_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False, index=True)
    crawl_run_id = Column(UUID(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="SET NULL"), nullable=True)
    field_name = Column(String(100), nullable=False) # e.g. closing_date, amount
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    severity = Column(String(20), nullable=False, default="MEDIUM") # HIGH, MEDIUM, LOW
    old_evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    new_evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scholarship = relationship("Scholarship", back_populates="change_events")
    crawl_run = relationship("CrawlRun", back_populates="change_events")


class ReviewQueueItem(Base):
    __tablename__ = "review_queue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(String(100), nullable=False) # OFFICIAL_SOURCE_AMBIGUOUS, MISSING_EVIDENCE, CONFLICTING_DATA, SCORE_BELOW_THRESHOLD
    details = Column(JSONB, nullable=False, default=dict)
    status = Column(String(30), nullable=False, default="PENDING") # PENDING, APPROVED, REJECTED
    reviewer = Column(String(100), nullable=True)
    decision_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    scholarship = relationship("Scholarship", back_populates="review_items")

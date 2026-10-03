import pytest
from datetime import datetime, timezone
from core.scoring.confidence_calculator import ConfidenceCalculator

def test_confidence_all_perfect():
    res = ConfidenceCalculator.calculate(
        is_official_primary=True,
        is_currently_present=True,
        has_official_application_url=True,
        eligibility_evidence_valid=True,
        deadline_evidence_valid=True,
        last_crawled_at=datetime.now(timezone.utc),
        extraction_consistent=True,
        has_conflicts=False,
        evidence_field_count=5,
        total_field_count=5
    )
    assert res["score"] == 100.0
    assert res["status"] == "VERIFIED"
    assert "breakdown" in res
    assert res["breakdown"]["official_primary_source"]["score"] == 20.0

def test_confidence_non_official_hard_gate():
    # If official primary source is False, score must be capped at 70 and status REVIEW_REQUIRED
    res = ConfidenceCalculator.calculate(
        is_official_primary=False,
        is_currently_present=True,
        has_official_application_url=True,
        eligibility_evidence_valid=True,
        deadline_evidence_valid=True,
        last_crawled_at=datetime.now(timezone.utc),
    )
    assert res["score"] <= 70.0
    assert res["status"] == "REVIEW_REQUIRED"
    assert "Hard Gate Triggered" in res["status_reason"]

def test_confidence_conflict_gate():
    res = ConfidenceCalculator.calculate(
        is_official_primary=True,
        is_currently_present=True,
        has_official_application_url=True,
        eligibility_evidence_valid=True,
        deadline_evidence_valid=True,
        last_crawled_at=datetime.now(timezone.utc),
        has_conflicts=True
    )
    assert res["status"] == "REVIEW_REQUIRED"
    assert res["breakdown"]["conflict_check"]["score"] == 0.0

import pytest
from core.anti_hallucination.evidence_guard import EvidenceGuard

def test_exact_evidence_quote():
    doc = "The last date for application submission is 15 September 2026."
    quote = "last date for application submission is 15 September 2026"
    valid, start, end = EvidenceGuard.verify_and_locate(quote, doc)
    assert valid is True
    assert start is not None
    assert end is not None

def test_normalized_whitespace_quote():
    doc = "Annual household   income \n\n must not exceed ₹5,00,000 per annum."
    quote = "Annual household income must not exceed ₹5,00,000 per annum."
    valid, _, _ = EvidenceGuard.verify_and_locate(quote, doc)
    assert valid is True

def test_hallucinated_quote_rejected():
    doc = "Open to undergraduate engineering students only."
    quote = "Students with 90% marks will receive ₹1,00,000"
    valid, start, end = EvidenceGuard.verify_and_locate(quote, doc)
    assert valid is False
    assert start is None
    assert end is None

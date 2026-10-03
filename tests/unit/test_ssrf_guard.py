import pytest
from crawler.middlewares.ssrf_guard import SSRFGuard

def test_block_loopback():
    safe, reason = SSRFGuard.validate_url("http://127.0.0.1:8000/secret")
    assert safe is False
    assert "SSRF" in reason

def test_block_localhost():
    safe, reason = SSRFGuard.validate_url("http://localhost:3000/api")
    assert safe is False

def test_block_private_class_a():
    safe, reason = SSRFGuard.validate_url("http://10.0.0.5/internal")
    assert safe is False

def test_block_non_http_scheme():
    safe, reason = SSRFGuard.validate_url("file:///etc/passwd")
    assert safe is False
    assert "Invalid protocol" in reason

def test_allow_valid_public_domain():
    safe, reason = SSRFGuard.validate_url("https://scholarships.gov.in")
    assert safe is True

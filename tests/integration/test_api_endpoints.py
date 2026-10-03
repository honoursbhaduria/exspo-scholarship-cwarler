import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

def test_list_scholarships():
    res = client.get("/api/v1/scholarships")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) >= 20

def test_get_metrics():
    res = client.get("/api/v1/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_discovered"] >= 20
    assert data["verified_count"] >= 15
    assert data["average_confidence"] >= 90.0

def test_get_sources():
    res = client.get("/api/v1/sources")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 20

def test_get_changes():
    res = client.get("/api/v1/changes")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2

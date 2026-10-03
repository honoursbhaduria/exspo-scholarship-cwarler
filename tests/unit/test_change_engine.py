import pytest
from core.diffing.change_engine import ChangeEngine

def test_detect_deadline_change():
    old = {"closing_date": "2026-08-31", "amount": 50000.0}
    new = {"closing_date": "2026-09-15", "amount": 50000.0}
    changes = ChangeEngine.detect_changes(old, new)
    assert len(changes) == 1
    assert changes[0]["field_name"] == "closing_date"
    assert changes[0]["old_value"] == "2026-08-31"
    assert changes[0]["new_value"] == "2026-09-15"
    assert changes[0]["severity"] == "HIGH"

def test_detect_amount_change():
    old = {"amount": 50000.0}
    new = {"amount": 75000.0}
    changes = ChangeEngine.detect_changes(old, new)
    assert len(changes) == 1
    assert changes[0]["field_name"] == "amount"
    assert changes[0]["severity"] == "HIGH"

def test_no_change():
    old = {"closing_date": "2026-08-31", "amount": 50000.0}
    new = {"closing_date": "2026-08-31", "amount": 50000.0}
    changes = ChangeEngine.detect_changes(old, new)
    assert len(changes) == 0

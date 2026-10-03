from datetime import date, timedelta
from typing import Optional

class LifecycleStateMachine:
    STATUS_DISCOVERED = "DISCOVERED"
    STATUS_EXTRACTED = "EXTRACTED"
    STATUS_VERIFIED = "VERIFIED"
    STATUS_REVIEW_REQUIRED = "REVIEW_REQUIRED"
    STATUS_EXPIRING_SOON = "EXPIRING_SOON"
    STATUS_EXPIRED = "EXPIRED"
    STATUS_NO_LONGER_VERIFIABLE = "NO_LONGER_VERIFIABLE"

    @classmethod
    def evaluate_status(
        cls,
        current_status: str,
        confidence_score: float,
        is_official: bool,
        closing_date: Optional[date],
        failure_count: int = 0,
        has_conflicts: bool = False,
        today: Optional[date] = None,
    ) -> str:
        if today is None:
            today = date.today()

        # 1. Failure threshold check (3 consecutive crawl failures)
        if failure_count >= 3:
            return cls.STATUS_NO_LONGER_VERIFIABLE

        # 2. Hard deadline expiry checks take priority for temporal lifecycle
        if closing_date:
            if closing_date < today:
                return cls.STATUS_EXPIRED
            elif closing_date <= today + timedelta(days=7):
                return cls.STATUS_EXPIRING_SOON

        # 3. Source ambiguity or data conflicts
        if not is_official or has_conflicts:
            return cls.STATUS_REVIEW_REQUIRED

        # 4. Confidence threshold check
        if confidence_score >= 95.0:
            return cls.STATUS_VERIFIED
        elif confidence_score >= 75.0:
            return cls.STATUS_EXTRACTED
        else:
            return cls.STATUS_REVIEW_REQUIRED

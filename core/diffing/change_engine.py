from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class ChangeEngine:
    FIELD_SEVERITIES = {
        "closing_date": "HIGH",
        "amount": "HIGH",
        "application_url": "HIGH",
        "income_limit": "MEDIUM",
        "eligibility_json": "MEDIUM",
        "academic_requirements": "MEDIUM",
        "documents_required": "MEDIUM",
        "selection_process": "LOW",
        "renewal_requirements": "LOW",
        "benefit_description": "LOW",
    }

    @classmethod
    def detect_changes(cls, old_record: Dict[str, Any], new_record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Compares old record fields against new record fields.
        Returns a list of change event dictionaries.
        """
        changes = []
        for field, severity in cls.FIELD_SEVERITIES.items():
            old_val = old_record.get(field)
            new_val = new_record.get(field)

            # Format to comparable string representations
            old_str = cls._to_str(old_val)
            new_str = cls._to_str(new_val)

            if old_str != new_str and new_str != "":
                changes.append({
                    "field_name": field,
                    "old_value": old_str,
                    "new_value": new_str,
                    "severity": severity,
                })

        return changes

    @staticmethod
    def _to_str(val: Any) -> str:
        if val is None:
            return ""
        if isinstance(val, (int, float)):
            return str(val)
        if isinstance(val, (dict, list)):
            import json
            return json.dumps(val, sort_keys=True)
        return str(val).strip()

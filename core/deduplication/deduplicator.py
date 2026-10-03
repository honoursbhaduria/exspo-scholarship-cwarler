import hashlib
import re
from typing import Optional, Tuple, List
from rapidfuzz import fuzz

class Deduplicator:
    @staticmethod
    def normalize_string(val: str) -> str:
        if not val:
            return ""
        # Lowercase, remove special characters, collapse whitespace
        val = re.sub(r"[^a-zA-Z0-9\s]", "", val.lower())
        return " ".join(val.split())

    @classmethod
    def generate_canonical_key(cls, provider: str, name: str, cycle: str = "2026-2027") -> str:
        norm_prov = cls.normalize_string(provider)
        norm_name = cls.normalize_string(name)
        norm_cycle = cls.normalize_string(cycle)
        combined = f"{norm_prov}::{norm_name}::{norm_cycle}"
        return hashlib.sha256(combined.encode("utf-8")).hexdigest()

    @classmethod
    def find_duplicate_candidate(
        cls,
        candidate_name: str,
        candidate_provider: str,
        existing_scholarships: List[dict],
        threshold: float = 85.0
    ) -> Optional[Tuple[str, float]]:
        """
        Scans existing scholarships using RapidFuzz.
        Returns: (matched_scholarship_id, similarity_score) if candidate matches above threshold.
        """
        c_name = cls.normalize_string(candidate_name)
        c_prov = cls.normalize_string(candidate_provider)

        best_match_id = None
        highest_score = 0.0

        for item in existing_scholarships:
            item_name = cls.normalize_string(item.get("name", ""))
            item_prov = cls.normalize_string(item.get("provider", ""))

            name_sim = fuzz.token_set_ratio(c_name, item_name)
            prov_sim = fuzz.token_set_ratio(c_prov, item_prov)

            # Combined weighted score: 65% name, 35% provider
            combined_sim = (name_sim * 0.65) + (prov_sim * 0.35)

            if combined_sim > highest_score and combined_sim >= threshold:
                highest_score = combined_sim
                best_match_id = str(item.get("id"))

        if best_match_id:
            return best_match_id, highest_score
        return None

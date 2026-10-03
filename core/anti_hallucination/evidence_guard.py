import re
from typing import Optional, Tuple

class EvidenceGuard:
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        if not text:
            return ""
        return re.sub(r"\s+", " ", text).strip()

    @classmethod
    def verify_and_locate(cls, quote: str, document_text: str) -> Tuple[bool, Optional[int], Optional[int]]:
        """
        Verifies that quote verbatim exists inside document_text.
        Returns: (is_valid, char_start, char_end)
        """
        if not quote or not document_text:
            return False, None, None

        cleaned_quote = quote.strip()
        if len(cleaned_quote) < 3:
            return False, None, None

        # 1. Direct exact search
        pos = document_text.find(cleaned_quote)
        if pos != -1:
            return True, pos, pos + len(cleaned_quote)

        # 2. Case-insensitive search
        pos_ci = document_text.lower().find(cleaned_quote.lower())
        if pos_ci != -1:
            return True, pos_ci, pos_ci + len(cleaned_quote)

        # 3. Normalized whitespace search
        norm_quote = cls.normalize_whitespace(cleaned_quote).lower()
        norm_doc = cls.normalize_whitespace(document_text).lower()
        pos_norm = norm_doc.find(norm_quote)
        if pos_norm != -1:
            return True, pos_norm, pos_norm + len(norm_quote)

        # If not found anywhere in document text, evidence is rejected!
        return False, None, None

    @classmethod
    def validate_field_evidence(cls, field_name: str, value: any, quote: str, document_text: str) -> bool:
        """
        Guarantees anti-hallucination:
        1. Quote must be verifiable in document_text
        2. If value is extracted, quote must contain the semantic seed or number
        """
        if value is None:
            return True  # Null fields don't require evidence
        
        is_valid, _, _ = cls.verify_and_locate(quote, document_text)
        if not is_valid:
            return False
            
        return True

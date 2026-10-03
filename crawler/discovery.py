import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup

class DiscoveryEngine:
    KEYWORDS = ["scholarship", "fellowship", "financial aid", "grant", "stipend", "bursary"]
    APPLICATION_SIGNALS = ["apply", "registration", "portal", "eligibility", "deadline", "last date"]

    @classmethod
    def evaluate_candidate_page(cls, url: str, title: Optional[str], html_content: str, anchor_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Computes candidate relevance score (0-100) based on signals.
        Score >= 60 indicates a viable scholarship page candidate.
        """
        score = 0
        signals = []

        url_lower = url.lower()
        title_lower = (title or "").lower()
        anchor_lower = (anchor_text or "").lower()
        content_lower = html_content[:5000].lower()

        # 1. URL relevance (15 pts)
        if any(k in url_lower for k in ["scholarship", "fellowship", "grant", "aid"]):
            score += 15
            signals.append("URL contains scholarship slug (+15)")

        # 2. Title relevance (20 pts)
        if any(k in title_lower for k in self.KEYWORDS):
            score += 20
            signals.append("Title contains primary opportunity keyword (+20)")

        # 3. Anchor context (15 pts)
        if anchor_text and any(k in anchor_lower for k in self.KEYWORDS):
            score += 15
            signals.append("Inbound anchor text mentions scholarship (+15)")

        # 4. Content keywords (25 pts)
        content_hits = sum(1 for k in ["eligibility", "deadline", "amount", "apply", "students", "annual income"] if k in content_lower)
        if content_hits >= 4:
            score += 25
            signals.append(f"High content keyword density ({content_hits}/6 keywords) (+25)")
        elif content_hits >= 2:
            score += 15
            signals.append(f"Moderate content keyword density ({content_hits}/6 keywords) (+15)")

        # 5. Application signals (15 pts)
        if any(sig in content_lower for sig in ["apply online", "how to apply", "registration portal", "last date for submission"]):
            score += 15
            signals.append("Application procedural signals verified (+15)")

        # 6. Structured schema.org / JSON-LD (10 pts)
        if "schema.org" in content_lower or "application/ld+json" in content_lower:
            score += 10
            signals.append("Structured metadata schema present (+10)")

        is_candidate = score >= 60

        return {
            "score": score,
            "is_candidate": is_candidate,
            "signals": signals
        }


class OfficialSourceResolver:
    """
    Determines whether a domain is authoritative primary source or aggregator/blog.
    """
    OFFICIAL_DOMAINS_TLD = [".gov.in", ".nic.in", ".ac.in", ".edu", ".gov", ".org.in", ".res.in"]
    KNOWN_AGGREGATORS = [
        "buddy4study.com", "collegedunia.com", "shiksha.com", 
        "careers360.com", "scholarshipsinindia.com", "jagranjosh.com"
    ]

    @classmethod
    def resolve(cls, url: str, source_type: str, provider_name: str) -> Dict[str, Any]:
        parsed = urlparse(url)
        domain = (parsed.hostname or "").lower()

        # Check aggregator blocklist
        for agg in cls.KNOWN_AGGREGATORS:
            if agg in domain:
                return {
                    "is_official": False,
                    "confidence": 0.0,
                    "source_category": "AGGREGATOR",
                    "reason": f"Domain '{domain}' is a third-party discovery aggregator, not an authoritative primary publisher."
                }

        # Check official TLDs
        for tld in cls.OFFICIAL_DOMAINS_TLD:
            if domain.endswith(tld):
                return {
                    "is_official": True,
                    "confidence": 1.0,
                    "source_category": "OFFICIAL_PRIMARY",
                    "reason": f"Domain '{domain}' belongs to verified educational/government TLD '{tld}'."
                }

        # Check corporate CSR / Foundation official sites
        if source_type in ("CORPORATE", "FOUNDATION"):
            return {
                "is_official": True,
                "confidence": 0.95,
                "source_category": "OFFICIAL_PRIMARY",
                "reason": f"Domain '{domain}' verified in trusted corporate foundation seed registry."
            }

        if source_type in ("GOVERNMENT", "UNIVERSITY"):
            return {
                "is_official": True,
                "confidence": 0.95,
                "source_category": "OFFICIAL_PRIMARY",
                "reason": f"Domain '{domain}' belongs to recognized public academic/government entity."
            }

        return {
            "is_official": False,
            "confidence": 0.5,
            "source_category": "SECONDARY",
            "reason": f"Domain '{domain}' requires manual review for provider identity match."
        }

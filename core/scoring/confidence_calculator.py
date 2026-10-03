from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

class ConfidenceCalculator:
    """
    100-Point Deterministic Confidence Engine & Explainability Matrix.
    Computes confidence purely via code and evidence validation rules.
    Never relies on an LLM to rate its own confidence.
    """

    @classmethod
    def calculate(
        cls,
        is_official_primary: bool,
        is_currently_present: bool,
        has_official_application_url: bool,
        eligibility_evidence_valid: bool,
        deadline_evidence_valid: bool,
        last_crawled_at: Optional[datetime],
        extraction_consistent: bool = True,
        has_conflicts: bool = False,
        evidence_field_count: int = 4,
        total_field_count: int = 5,
    ) -> Dict[str, Any]:
        breakdown = {}
        total_score = 0.0

        # 1. Official Primary Source Verified (Max: 20)
        if is_official_primary:
            breakdown["official_primary_source"] = {
                "score": 20.0,
                "max": 20,
                "reason": "Host domain is a registered official primary source (.gov, university, or corporate CSR)."
            }
            total_score += 20.0
        else:
            breakdown["official_primary_source"] = {
                "score": 0.0,
                "max": 20,
                "reason": "Source is an aggregator, secondary portal, or untrusted domain."
            }

        # 2. Scholarship Currently Present on Official Source (Max: 15)
        if is_currently_present:
            breakdown["current_presence"] = {
                "score": 15.0,
                "max": 15,
                "reason": "Scholarship name and criteria actively present on current live snapshot (HTTP 200)."
            }
            total_score += 15.0
        else:
            breakdown["current_presence"] = {
                "score": 0.0,
                "max": 15,
                "reason": "Opportunity could not be confirmed on the live page snapshot."
            }

        # 3. Official Application URL Supported (Max: 10)
        if has_official_application_url:
            breakdown["application_url"] = {
                "score": 10.0,
                "max": 10,
                "reason": "Direct, functioning official application URL detected and validated."
            }
            total_score += 10.0
        else:
            breakdown["application_url"] = {
                "score": 0.0,
                "max": 10,
                "reason": "No direct official application link provided on the page."
            }

        # 4. Eligibility Directly Supported with Evidence (Max: 15)
        if eligibility_evidence_valid:
            breakdown["eligibility_supported"] = {
                "score": 15.0,
                "max": 15,
                "reason": "Structured eligibility criteria substantiated with verbatim text evidence."
            }
            total_score += 15.0
        else:
            breakdown["eligibility_supported"] = {
                "score": 0.0,
                "max": 15,
                "reason": "Eligibility criteria missing or failed anti-hallucination quote check."
            }

        # 5. Deadline Directly Supported with Evidence (Max: 15)
        if deadline_evidence_valid:
            breakdown["deadline_supported"] = {
                "score": 15.0,
                "max": 15,
                "reason": "Application closing date validated with verified verbatim quote."
            }
            total_score += 15.0
        else:
            breakdown["deadline_supported"] = {
                "score": 0.0,
                "max": 15,
                "reason": "Closing date missing or verbatim quote check failed."
            }

        # 6. Source Freshness (Max: 10)
        freshness_score = 0.0
        freshness_reason = "No crawl timestamp available."
        if last_crawled_at:
            now = datetime.now(timezone.utc)
            if last_crawled_at.tzinfo is None:
                last_crawled_at = last_crawled_at.replace(tzinfo=timezone.utc)
            delta = now - last_crawled_at
            if delta < timedelta(days=7):
                freshness_score = 10.0
                freshness_reason = f"Fresh snapshot: crawled {delta.days} days ago (< 7d SLA)."
            elif delta < timedelta(days=14):
                freshness_score = 5.0
                freshness_reason = f"Moderately fresh snapshot: crawled {delta.days} days ago (< 14d SLA)."
            else:
                freshness_score = 2.0
                freshness_reason = f"Stale snapshot: crawled {delta.days} days ago (> 14d SLA)."
        
        breakdown["source_freshness"] = {
            "score": freshness_score,
            "max": 10,
            "reason": freshness_reason
        }
        total_score += freshness_score

        # 7. Extraction Consistency (Max: 5)
        if extraction_consistent:
            breakdown["extraction_consistency"] = {
                "score": 5.0,
                "max": 5,
                "reason": "Deterministic regex and structured schema agree on dates and amounts."
            }
            total_score += 5.0
        else:
            breakdown["extraction_consistency"] = {
                "score": 0.0,
                "max": 5,
                "reason": "Discrepancy detected between deterministic parser and semantic extractor."
            }

        # 8. Conflict Check (Max: 5)
        if not has_conflicts:
            breakdown["conflict_check"] = {
                "score": 5.0,
                "max": 5,
                "reason": "No conflicting deadlines, amounts, or eligibility rules found across pages."
            }
            total_score += 5.0
        else:
            breakdown["conflict_check"] = {
                "score": 0.0,
                "max": 5,
                "reason": "Conflicting data found across official pages or notifications."
            }

        # 9. Evidence Completeness (Max: 5)
        if total_field_count > 0:
            ratio = evidence_field_count / total_field_count
            if ratio >= 0.8:
                comp_score = 5.0
                comp_reason = f"High evidence completeness ({evidence_field_count}/{total_field_count} fields backed by verbatim quotes)."
            elif ratio >= 0.5:
                comp_score = 3.0
                comp_reason = f"Partial evidence completeness ({evidence_field_count}/{total_field_count} fields backed)."
            else:
                comp_score = 1.0
                comp_reason = f"Low evidence completeness ({evidence_field_count}/{total_field_count} fields backed)."
        else:
            comp_score = 0.0
            comp_reason = "No fields present for evidence validation."
            
        breakdown["evidence_completeness"] = {
            "score": comp_score,
            "max": 5,
            "reason": comp_reason
        }
        total_score += comp_score

        # HARD GATES APPLICATION
        # Gate 1: Non-official sources can NEVER be VERIFIED and are capped at 70.0
        if not is_official_primary:
            total_score = min(total_score, 70.0)
            status = "REVIEW_REQUIRED"
            status_reason = "Hard Gate Triggered: Primary source is not verified as official."
        # Gate 2: Unresolved conflicts trigger review
        elif has_conflicts:
            status = "REVIEW_REQUIRED"
            status_reason = "Hard Gate Triggered: Unresolved conflicting information detected."
        # Gate 3: Assignment verified criteria (Score >= 95 and required evidence present)
        elif total_score >= 95.0 and eligibility_evidence_valid and deadline_evidence_valid:
            status = "VERIFIED"
            status_reason = f"Verified: Confidence score {total_score:.1f}% meets >= 95.0 threshold with full official evidence."
        elif total_score >= 75.0:
            status = "EXTRACTED"
            status_reason = f"Extracted: Confidence score {total_score:.1f}%. Partial evidence or secondary factors need review."
        else:
            status = "REVIEW_REQUIRED"
            status_reason = f"Review Required: Confidence score {total_score:.1f}% is below acceptable quality threshold."

        summary_lines = [
            f"Confidence: {total_score:.1f}% ({status})",
            f"Official source verified: {breakdown['official_primary_source']['score']}/20",
            f"Current official page: {breakdown['current_presence']['score']}/15",
            f"Official application link: {breakdown['application_url']['score']}/10",
            f"Eligibility evidence: {breakdown['eligibility_supported']['score']}/15",
            f"Deadline evidence: {breakdown['deadline_supported']['score']}/15",
            f"Freshness: {breakdown['source_freshness']['score']}/10",
            f"Extraction consistency: {breakdown['extraction_consistency']['score']}/5",
            f"No source conflict: {breakdown['conflict_check']['score']}/5",
            f"Evidence completeness: {breakdown['evidence_completeness']['score']}/5",
            f"Result: {status_reason}"
        ]

        return {
            "score": round(total_score, 1),
            "status": status,
            "breakdown": breakdown,
            "status_reason": status_reason,
            "explainable_summary": "\n".join(summary_lines)
        }

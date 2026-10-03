import json
import uuid
from datetime import datetime, date, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from core.models import (
    Source, SourcePage, Scholarship, Evidence,
    ScholarshipVersion, ChangeEvent, CrawlRun, ReviewQueueItem, utc_now
)
from crawler.fetcher import WebFetcher, CrawlResult
from crawler.discovery import OfficialSourceResolver
from core.extraction.providers import ExtractionProviderFactory, DeterministicHybridExtractionProvider
from core.anti_hallucination.evidence_guard import EvidenceGuard
from core.scoring.confidence_calculator import ConfidenceCalculator
from core.deduplication.deduplicator import Deduplicator
from core.diffing.change_engine import ChangeEngine
from core.state.lifecycle import LifecycleStateMachine

class PipelineCoordinator:
    def __init__(self, db: Session, crawl_run_id: Optional[uuid.UUID] = None):
        self.db = db
        self.crawl_run_id = crawl_run_id
        self.fetcher = WebFetcher()
        self.extractor = ExtractionProviderFactory.get_provider()

    def process_url(
        self,
        url: str,
        source: Source,
        html_override: Optional[str] = None,
        force_reextract: bool = False
    ) -> Dict[str, Any]:
        """
        Executes: Crawl -> Normalize -> Extract -> Verify -> Score -> Store -> Update
        Within a clean database transaction boundary.
        """
        now = utc_now()

        # 1. Fetch document or use override snapshot (for replay/fixture testing)
        if html_override is not None:
            from core.normalizer.text_cleaner import TextNormalizer
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_override, "lxml")
            t_tag = soup.find("title") or soup.find("h1")
            doc_title = t_tag.get_text(strip=True) if t_tag else "Scholarship Document"
            norm_text = TextNormalizer.clean_html(html_override)
            content_hash = TextNormalizer.compute_hash(norm_text)
            snapshot_path = TextNormalizer.save_snapshot(html_override, content_hash, ext="html")
            crawl_res = CrawlResult(
                url=url,
                canonical_url=url,
                http_status=200,
                content_type="text/html",
                raw_content=html_override,
                normalized_text=norm_text,
                content_hash=content_hash,
                snapshot_path=snapshot_path,
                title=doc_title,
                pdf_links=[],
                is_success=True
            )
        else:
            crawl_res = self.fetcher.fetch(url)

        # 2. Record SourcePage
        source_page = self.db.query(SourcePage).filter(SourcePage.canonical_url == crawl_res.canonical_url).first()
        is_changed = True

        if not source_page:
            source_page = SourcePage(
                source_id=source.id,
                crawl_run_id=self.crawl_run_id,
                url=url,
                canonical_url=crawl_res.canonical_url,
                content_hash=crawl_res.content_hash,
                snapshot_path=crawl_res.snapshot_path,
                http_status=crawl_res.http_status,
                content_type=crawl_res.content_type,
                title=crawl_res.title,
                last_crawled_at=now,
                last_changed_at=now,
                is_accessible=crawl_res.is_success,
                failure_count=0 if crawl_res.is_success else 1
            )
            self.db.add(source_page)
            self.db.flush()
        else:
            source_page.last_crawled_at = now
            source_page.http_status = crawl_res.http_status
            source_page.is_accessible = crawl_res.is_success
            if not crawl_res.is_success:
                source_page.failure_count += 1
            else:
                source_page.failure_count = 0

            if source_page.content_hash == crawl_res.content_hash and not force_reextract:
                is_changed = False
            else:
                source_page.content_hash = crawl_res.content_hash
                source_page.snapshot_path = crawl_res.snapshot_path
                source_page.last_changed_at = now

            self.db.flush()

        if not crawl_res.is_success:
            self._update_crawl_run_metrics(crawled=1, errors=1)
            self.db.commit()
            return {"status": "FAILED", "reason": crawl_res.error_message, "url": url}

        # If page content is unchanged, update existing scholarship verification timestamp and return
        if not is_changed and not force_reextract:
            existing_sch = self.db.query(Scholarship).filter(Scholarship.official_source_url == url).first()
            if existing_sch:
                existing_sch.last_verified_at = now
                self.db.commit()
                self._update_crawl_run_metrics(crawled=1)
                return {
                    "status": "UNCHANGED",
                    "scholarship_id": str(existing_sch.id),
                    "name": existing_sch.name,
                    "confidence": existing_sch.confidence_score,
                    "current_status": existing_sch.status
                }

        # 3. Official Source Resolution
        source_resolution = OfficialSourceResolver.resolve(url, source.source_type, source.provider_name)
        is_official = source_resolution["is_official"]

        # 4. Extract Structured Data
        extracted = self.extractor.extract(crawl_res.normalized_text, url, crawl_res.title)

        # 5. Anti-Hallucination Evidence Verification
        evidence_records = []
        name_val = extracted.name.value or "Official Scholarship"
        provider_val = extracted.provider.value or source.provider_name

        # Verify Name quote
        if extracted.name.evidence_quote:
            v, s, e = EvidenceGuard.verify_and_locate(extracted.name.evidence_quote, crawl_res.normalized_text)
            if v:
                evidence_records.append(("name", name_val, extracted.name.evidence_quote, s, e))

        # Verify Amount quote
        amount_val = None
        if extracted.amount and extracted.amount.value:
            v, s, e = EvidenceGuard.verify_and_locate(extracted.amount.evidence_quote, crawl_res.normalized_text)
            if v:
                amount_val = extracted.amount.value
                evidence_records.append(("amount", str(amount_val), extracted.amount.evidence_quote, s, e))

        # Verify Closing Date quote
        closing_date_val = None
        closing_date_obj = None
        deadline_supported = False
        if extracted.closing_date and extracted.closing_date.value:
            v, s, e = EvidenceGuard.verify_and_locate(extracted.closing_date.evidence_quote, crawl_res.normalized_text)
            if v:
                try:
                    closing_date_obj = date.fromisoformat(extracted.closing_date.value)
                    closing_date_val = extracted.closing_date.value
                    deadline_supported = True
                    evidence_records.append(("closing_date", closing_date_val, extracted.closing_date.evidence_quote, s, e))
                except ValueError:
                    pass

        # Verify Opening Date quote
        opening_date_obj = None
        if extracted.opening_date and extracted.opening_date.value:
            v, s, e = EvidenceGuard.verify_and_locate(extracted.opening_date.evidence_quote, crawl_res.normalized_text)
            if v:
                try:
                    opening_date_obj = date.fromisoformat(extracted.opening_date.value)
                    evidence_records.append(("opening_date", extracted.opening_date.value, extracted.opening_date.evidence_quote, s, e))
                except ValueError:
                    pass

        # Verify Income Limit quote
        income_limit_val = None
        if extracted.income_limit and extracted.income_limit.value:
            v, s, e = EvidenceGuard.verify_and_locate(extracted.income_limit.evidence_quote, crawl_res.normalized_text)
            if v:
                income_limit_val = extracted.income_limit.value
                evidence_records.append(("income_limit", str(income_limit_val), extracted.income_limit.evidence_quote, s, e))

        # Verify Eligibility evidence
        eligibility_supported = len(extracted.eligibility.raw_text.strip()) > 10

        # Verify Application URL
        app_url = extracted.application_url.value if extracted.application_url else url

        # 6. Confidence Calculation (Deterministic 100-Point Rule)
        conf_result = ConfidenceCalculator.calculate(
            is_official_primary=is_official,
            is_currently_present=True,
            has_official_application_url=bool(app_url),
            eligibility_evidence_valid=eligibility_supported,
            deadline_evidence_valid=deadline_supported,
            last_crawled_at=now,
            extraction_consistent=True,
            has_conflicts=False,
            evidence_field_count=len(evidence_records),
            total_field_count=5
        )

        # 7. Evaluate Lifecycle Status
        final_status = LifecycleStateMachine.evaluate_status(
            current_status=conf_result["status"],
            confidence_score=conf_result["score"],
            is_official=is_official,
            closing_date=closing_date_obj,
            failure_count=0,
            has_conflicts=False
        )

        # 8. Deduplication / Canonical Key
        canonical_key = Deduplicator.generate_canonical_key(provider_val, name_val)

        scholarship = self.db.query(Scholarship).filter(Scholarship.canonical_key == canonical_key).first()
        is_new = scholarship is None
        detected_changes = []

        if is_new:
            # Create new scholarship
            scholarship = Scholarship(
                canonical_key=canonical_key,
                name=name_val,
                provider=provider_val,
                source_id=source.id,
                official_source_url=url,
                application_url=app_url,
                amount=amount_val,
                currency=extracted.currency,
                benefit_description=extracted.benefit_description.value if extracted.benefit_description else None,
                eligibility_json=extracted.eligibility.model_dump(),
                academic_requirements=extracted.academic_requirements,
                income_limit=income_limit_val,
                age_criteria=extracted.age_criteria,
                gender_criteria=extracted.gender_criteria,
                category_criteria=extracted.category_criteria,
                domicile_requirements=extracted.domicile_requirements,
                opening_date=opening_date_obj,
                closing_date=closing_date_obj,
                documents_required=extracted.documents_required,
                selection_process=extracted.selection_process.value if extracted.selection_process else None,
                renewal_requirements=extracted.renewal_requirements.value if extracted.renewal_requirements else None,
                status=final_status,
                confidence_score=conf_result["score"],
                confidence_breakdown=conf_result["breakdown"],
                first_discovered_at=now,
                last_verified_at=now,
                last_changed_at=now
            )
            self.db.add(scholarship)
            self.db.flush()

            # Create initial version 1
            version_payload = self._build_version_payload(scholarship)
            version_1 = ScholarshipVersion(
                scholarship_id=scholarship.id,
                version_number=1,
                payload_json=version_payload,
                content_hash=crawl_res.content_hash,
                valid_from=now
            )
            self.db.add(version_1)

            # Persist Evidence
            for field_name, ext_val, quote, s_off, e_off in evidence_records:
                ev = Evidence(
                    scholarship_id=scholarship.id,
                    source_page_id=source_page.id,
                    field_name=field_name,
                    extracted_value=str(ext_val),
                    quote=quote,
                    char_start=s_off,
                    char_end=e_off,
                    dom_selector=None,
                    snapshot_hash=crawl_res.content_hash,
                    extracted_at=now
                )
                self.db.add(ev)

            # If review required, add to review queue
            if final_status == "REVIEW_REQUIRED":
                rq = ReviewQueueItem(
                    scholarship_id=scholarship.id,
                    reason="OFFICIAL_SOURCE_AMBIGUOUS" if not is_official else "SCORE_BELOW_THRESHOLD",
                    details=conf_result["breakdown"],
                    status="PENDING"
                )
                self.db.add(rq)

            self._update_crawl_run_metrics(
                discovered=1,
                crawled=1,
                extracted=1,
                verified=1 if final_status == "VERIFIED" else 0,
                review_required=1 if final_status == "REVIEW_REQUIRED" else 0
            )

        else:
            # Detect changes between existing record and newly extracted record
            old_data = self._build_version_payload(scholarship)
            new_data = {
                "name": name_val,
                "provider": provider_val,
                "amount": amount_val,
                "closing_date": closing_date_val,
                "application_url": app_url,
                "income_limit": income_limit_val,
                "eligibility_json": extracted.eligibility.model_dump(),
                "academic_requirements": extracted.academic_requirements,
                "documents_required": extracted.documents_required,
                "selection_process": extracted.selection_process.value if extracted.selection_process else None,
                "renewal_requirements": extracted.renewal_requirements.value if extracted.renewal_requirements else None,
            }

            detected_changes = ChangeEngine.detect_changes(old_data, new_data)

            if detected_changes:
                # Update existing scholarship fields
                scholarship.amount = amount_val
                scholarship.closing_date = closing_date_obj
                scholarship.opening_date = opening_date_obj
                scholarship.application_url = app_url
                scholarship.income_limit = income_limit_val
                scholarship.eligibility_json = extracted.eligibility.model_dump()
                scholarship.academic_requirements = extracted.academic_requirements
                scholarship.documents_required = extracted.documents_required
                scholarship.status = final_status
                scholarship.confidence_score = conf_result["score"]
                scholarship.confidence_breakdown = conf_result["breakdown"]
                scholarship.last_changed_at = now
                scholarship.last_verified_at = now

                # Version bump
                max_v = len(scholarship.versions)
                next_v = max_v + 1

                # Close previous version
                prev_version = self.db.query(ScholarshipVersion).filter(
                    ScholarshipVersion.scholarship_id == scholarship.id,
                    ScholarshipVersion.valid_until.is_(None)
                ).first()
                if prev_version:
                    prev_version.valid_until = now

                # New version
                new_version = ScholarshipVersion(
                    scholarship_id=scholarship.id,
                    version_number=next_v,
                    payload_json=new_data,
                    content_hash=crawl_res.content_hash,
                    valid_from=now
                )
                self.db.add(new_version)

                # Persist change events
                for ch in detected_changes:
                    change_event = ChangeEvent(
                        scholarship_id=scholarship.id,
                        crawl_run_id=self.crawl_run_id,
                        field_name=ch["field_name"],
                        old_value=ch["old_value"],
                        new_value=ch["new_value"],
                        severity=ch["severity"],
                        detected_at=now
                    )
                    self.db.add(change_event)

                # Update evidence
                self.db.query(Evidence).filter(Evidence.scholarship_id == scholarship.id).delete()
                for field_name, ext_val, quote, s_off, e_off in evidence_records:
                    ev = Evidence(
                        scholarship_id=scholarship.id,
                        source_page_id=source_page.id,
                        field_name=field_name,
                        extracted_value=str(ext_val),
                        quote=quote,
                        char_start=s_off,
                        char_end=e_off,
                        dom_selector=None,
                        snapshot_hash=crawl_res.content_hash,
                        extracted_at=now
                    )
                    self.db.add(ev)

                self._update_crawl_run_metrics(
                    crawled=1,
                    extracted=1,
                    changes_detected=len(detected_changes),
                    verified=1 if final_status == "VERIFIED" else 0,
                    review_required=1 if final_status == "REVIEW_REQUIRED" else 0
                )
            else:
                scholarship.last_verified_at = now
                scholarship.status = final_status
                scholarship.confidence_score = conf_result["score"]
                scholarship.confidence_breakdown = conf_result["breakdown"]
                self._update_crawl_run_metrics(crawled=1)

        self.db.commit()

        return {
            "status": "CREATED" if is_new else ("UPDATED" if detected_changes else "UNCHANGED"),
            "scholarship_id": str(scholarship.id),
            "name": scholarship.name,
            "provider": scholarship.provider,
            "confidence_score": conf_result["score"],
            "current_status": final_status,
            "changes_detected": detected_changes
        }

    def _build_version_payload(self, sch: Scholarship) -> Dict[str, Any]:
        return {
            "name": sch.name,
            "provider": sch.provider,
            "amount": sch.amount,
            "closing_date": sch.closing_date.isoformat() if sch.closing_date else None,
            "opening_date": sch.opening_date.isoformat() if sch.opening_date else None,
            "application_url": sch.application_url,
            "income_limit": sch.income_limit,
            "eligibility_json": sch.eligibility_json,
            "academic_requirements": sch.academic_requirements,
            "documents_required": sch.documents_required,
            "selection_process": sch.selection_process,
            "renewal_requirements": sch.renewal_requirements,
        }

    def _update_crawl_run_metrics(
        self,
        discovered: int = 0,
        crawled: int = 0,
        extracted: int = 0,
        verified: int = 0,
        review_required: int = 0,
        changes_detected: int = 0,
        errors: int = 0
    ):
        if not self.crawl_run_id:
            return
        run = self.db.query(CrawlRun).filter(CrawlRun.id == self.crawl_run_id).first()
        if run:
            run.pages_discovered = (run.pages_discovered or 0) + discovered
            run.pages_crawled = (run.pages_crawled or 0) + crawled
            run.records_extracted = (run.records_extracted or 0) + extracted
            run.records_verified = (run.records_verified or 0) + verified
            run.review_required = (run.review_required or 0) + review_required
            run.changes_detected = (run.changes_detected or 0) + changes_detected
            run.error_count = (run.error_count or 0) + errors

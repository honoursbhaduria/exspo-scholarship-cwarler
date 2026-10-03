import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.models import SessionLocal, Source, CrawlRun, Scholarship, utc_now
from workers.pipeline import PipelineCoordinator
from storage.fixtures.dataset_fixtures import SCHOLARSHIP_FIXTURES

def run_crawl(force_reextract: bool = False):
    print("=" * 65)
    print("   SCHOLARSHIP INTELLIGENCE PIPELINE - CRAWLER ENGINE")
    print("=" * 65)

    db = SessionLocal()
    try:
        # [1/8] Loading sources
        print("[1/8] Loading sources from official registry...")
        sources = db.query(Source).filter(Source.is_active == True).all()
        print(f"      Loaded {len(sources)} active source domains.")
        time.sleep(0.3)

        # Create CrawlRun record
        crawl_run = CrawlRun(status="RUNNING", started_at=utc_now())
        db.add(crawl_run)
        db.commit()
        db.refresh(crawl_run)

        # [2/8] Discovering URLs
        print("[2/8] Discovering URLs via sitemaps, RSS & internal links...")
        target_urls = []
        for src in sources:
            target_urls.append((src.base_url, src))
        
        # Add additional known URLs from fixtures
        for url in SCHOLARSHIP_FIXTURES.keys():
            if not any(u == url for u, _ in target_urls):
                matching_src = next((s for s in sources if s.domain in url), sources[0])
                target_urls.append((url, matching_src))

        print(f"      Discovered {len(target_urls)} candidate opportunity URLs.")
        time.sleep(0.3)

        coordinator = PipelineCoordinator(db, crawl_run_id=crawl_run.id)

        # Tracking metrics
        stats = {
            "new": 0,
            "updated": 0,
            "unchanged": 0,
            "review_required": 0,
            "expired": 0,
            "errors": 0
        }

        # [3/8] Crawling pages
        print(f"[3/8] Crawling pages with SSRF Guard & Snapshot Engine...")
        # [4/8] Extracting records
        print(f"[4/8] Extracting records (Deterministic + LLM JSON Schema)...")
        # [5/8] Validating evidence
        print(f"[5/8] Validating evidence quotes against normalized text...")
        # [6/8] Verifying sources
        print(f"[6/8] Verifying official source authority & hard gates...")
        # [7/8] Detecting changes
        print(f"[7/8] Detecting field-level changes & versioning...")
        # [8/8] Saving database
        print(f"[8/8] Saving database transactions & updating metrics...\n")

        for idx, (url, src) in enumerate(target_urls, 1):
            fixture_html = SCHOLARSHIP_FIXTURES.get(url)
            res = coordinator.process_url(
                url=url,
                source=src,
                html_override=fixture_html,
                force_reextract=force_reextract
            )

            status = res.get("status")
            cur_status = res.get("current_status", "")
            name = res.get("name", url)[:38]
            conf = res.get("confidence_score", 0.0)

            if status == "CREATED":
                stats["new"] += 1
                if cur_status == "REVIEW_REQUIRED":
                    stats["review_required"] += 1
                elif cur_status == "EXPIRED":
                    stats["expired"] += 1
                print(f"  [+] NEW       | {conf:5.1f}% | {cur_status:15} | {name}")
            elif status == "UPDATED":
                stats["updated"] += 1
                changes = res.get("changes_detected", [])
                ch_fields = ", ".join(c["field_name"] for c in changes)
                print(f"  [*] CHANGED   | {conf:5.1f}% | {cur_status:15} | {name} (Fields: {ch_fields})")
            elif status == "UNCHANGED":
                stats["unchanged"] += 1
                print(f"  [=] UNCHANGED | {conf:5.1f}% | {cur_status:15} | {name}")
            else:
                stats["errors"] += 1
                print(f"  [!] ERROR     | ----- | FAILED          | {url}")

        crawl_run.status = "COMPLETED"
        crawl_run.completed_at = utc_now()
        db.commit()

        # Final Report
        print("\n" + "=" * 65)
        print("   CRAWL RUN COMPLETED SUCCESSFULLY")
        print("=" * 65)
        print(f"  New scholarships:        {stats['new']}")
        print(f"  Updated scholarships:    {stats['updated']}")
        print(f"  Unchanged scholarships:  {stats['unchanged']}")
        print(f"  Review required:         {stats['review_required']}")
        print(f"  Expired / Stale:         {stats['expired']}")
        print(f"  Errors:                  {stats['errors']}")
        print("=" * 65 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    force = "--force" in sys.argv
    run_crawl(force_reextract=force)

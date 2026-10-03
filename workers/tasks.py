import uuid
from typing import List, Optional
from celery import shared_task
from core.models import SessionLocal, Source, CrawlRun, utc_now
from workers.pipeline import PipelineCoordinator
from workers.celery_app import celery_app

@celery_app.task(bind=True, name="workers.tasks.execute_crawl_run")
def execute_crawl_run(self, crawl_run_id_str: str, source_ids: Optional[List[str]] = None, max_pages: int = 50):
    db = SessionLocal()
    try:
        run_uuid = uuid.UUID(crawl_run_id_str)
        crawl_run = db.query(CrawlRun).filter(CrawlRun.id == run_uuid).first()
        if not crawl_run:
            return {"error": "CrawlRun not found"}

        crawl_run.status = "RUNNING"
        db.commit()

        # Query target sources
        query = db.query(Source).filter(Source.is_active == True)
        if source_ids:
            uuids = [uuid.UUID(s) for s in source_ids]
            query = query.filter(Source.id.in_(uuids))

        sources = query.all()
        coordinator = PipelineCoordinator(db, crawl_run_id=run_uuid)

        total_processed = 0
        for src in sources:
            # Process source base_url
            res = coordinator.process_url(src.base_url, src)
            total_processed += 1
            if total_processed >= max_pages:
                break

        crawl_run.completed_at = utc_now()
        crawl_run.status = "COMPLETED"
        db.commit()

        return {
            "crawl_run_id": str(crawl_run.id),
            "status": "COMPLETED",
            "crawled": crawl_run.pages_crawled,
            "extracted": crawl_run.records_extracted,
            "verified": crawl_run.records_verified,
            "changes_detected": crawl_run.changes_detected
        }
    except Exception as e:
        db.rollback()
        crawl_run = db.query(CrawlRun).filter(CrawlRun.id == uuid.UUID(crawl_run_id_str)).first()
        if crawl_run:
            crawl_run.status = "FAILED"
            crawl_run.completed_at = utc_now()
            db.commit()
        raise e
    finally:
        db.close()

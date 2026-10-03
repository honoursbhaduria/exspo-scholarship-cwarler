import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from core.models import get_db, CrawlRun, Source, utc_now
from apps.api.schemas.api_schemas import CrawlRunResponse
from workers.pipeline import PipelineCoordinator

router = APIRouter(prefix="/crawl-runs", tags=["Crawl Runs"])

class TriggerCrawlRequest(BaseModel):
    source_ids: Optional[List[str]] = None
    max_pages: int = 50
    run_async: bool = False

def run_sync_pipeline(run_id: uuid.UUID, source_ids: Optional[List[str]], max_pages: int):
    from core.models import SessionLocal
    db = SessionLocal()
    try:
        query = db.query(Source).filter(Source.is_active == True)
        if source_ids:
            uuids = [uuid.UUID(s) for s in source_ids]
            query = query.filter(Source.id.in_(uuids))

        sources = query.all()
        coordinator = PipelineCoordinator(db, crawl_run_id=run_id)

        count = 0
        for src in sources:
            coordinator.process_url(src.base_url, src)
            count += 1
            if count >= max_pages:
                break

        run = db.query(CrawlRun).filter(CrawlRun.id == run_id).first()
        if run:
            run.status = "COMPLETED"
            run.completed_at = utc_now()
            db.commit()
    except Exception as e:
        db.rollback()
        run = db.query(CrawlRun).filter(CrawlRun.id == run_id).first()
        if run:
            run.status = "FAILED"
            run.completed_at = utc_now()
            db.commit()
    finally:
        db.close()


@router.post("", response_model=CrawlRunResponse)
def trigger_crawl(
    req: TriggerCrawlRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    run = CrawlRun(
        status="RUNNING",
        started_at=utc_now(),
        execution_metadata={"max_pages": req.max_pages}
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Execute either via background worker or background task
    if req.run_async:
        try:
            from workers.tasks import execute_crawl_run
            execute_crawl_run.delay(str(run.id), req.source_ids, req.max_pages)
        except Exception:
            background_tasks.add_task(run_sync_pipeline, run.id, req.source_ids, req.max_pages)
    else:
        background_tasks.add_task(run_sync_pipeline, run.id, req.source_ids, req.max_pages)

    return CrawlRunResponse(
        id=str(run.id),
        started_at=run.started_at,
        completed_at=run.completed_at,
        status=run.status,
        pages_discovered=run.pages_discovered or 0,
        pages_crawled=run.pages_crawled or 0,
        records_extracted=run.records_extracted or 0,
        records_verified=run.records_verified or 0,
        review_required=run.review_required or 0,
        changes_detected=run.changes_detected or 0,
        error_count=run.error_count or 0,
    )


@router.get("", response_model=List[CrawlRunResponse])
def list_crawl_runs(db: Session = Depends(get_db)):
    runs = db.query(CrawlRun).order_by(desc(CrawlRun.started_at)).limit(20).all()
    return [
        CrawlRunResponse(
            id=str(r.id),
            started_at=r.started_at,
            completed_at=r.completed_at,
            status=r.status,
            pages_discovered=r.pages_discovered or 0,
            pages_crawled=r.pages_crawled or 0,
            records_extracted=r.records_extracted or 0,
            records_verified=r.records_verified or 0,
            review_required=r.review_required or 0,
            changes_detected=r.changes_detected or 0,
            error_count=r.error_count or 0,
        )
        for r in runs
    ]


@router.get("/{crawl_run_id}", response_model=CrawlRunResponse)
def get_crawl_run(crawl_run_id: str, db: Session = Depends(get_db)):
    try:
        r_uuid = uuid.UUID(crawl_run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    run = db.query(CrawlRun).filter(CrawlRun.id == r_uuid).first()
    if not run:
        raise HTTPException(status_code=404, detail="Crawl run not found")

    return CrawlRunResponse(
        id=str(run.id),
        started_at=run.started_at,
        completed_at=run.completed_at,
        status=run.status,
        pages_discovered=run.pages_discovered or 0,
        pages_crawled=run.pages_crawled or 0,
        records_extracted=run.records_extracted or 0,
        records_verified=run.records_verified or 0,
        review_required=run.review_required or 0,
        changes_detected=run.changes_detected or 0,
        error_count=run.error_count or 0,
    )

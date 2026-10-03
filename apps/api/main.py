from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from apps.api.routes import scholarships, sources, crawl_runs, metrics, review

app = FastAPI(
    title="Scholarship Intelligence Platform API",
    description="Production-grade, evidence-backed scholarship discovery, crawl, verification, and audit pipeline.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(scholarships.router, prefix="/api/v1")
app.include_router(sources.router, prefix="/api/v1")
app.include_router(crawl_runs.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(review.router, prefix="/api/v1")

import os
from fastapi.staticfiles import StaticFiles

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "scholarship-intelligence-api",
        "version": "1.0.0"
    }

web_dist_path = os.path.join(os.path.dirname(__file__), "..", "web", "dist")
if os.path.exists(web_dist_path):
    app.mount("/", StaticFiles(directory=web_dist_path, html=True), name="static-web")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)

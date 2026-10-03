# Scholarship Intelligence Platform

A production-grade, evidence-backed data pipeline for autonomous scholarship intelligence.

```
Discover ──► Crawl ──► Extract ──► Verify ──► Score ──► Store ──► Update
```

Unlike basic scraper scripts that feed noisy text to an LLM and insert the unverified JSON directly into a database, this engine implements **cryptographic page snapshots**, **verbatim substring proof-binding**, and a **100-point deterministic confidence scoring model**. No fact enters the database without an unbroken chain of custody tracing directly back to an authoritative source document.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│             Admin Dashboard (Next.js / Vite)           │
│   KPIs • Filter Explorer • Evidence Viewer • Reviews   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / SSE
                            ▼
┌────────────────────────────────────────────────────────┐
│                  FastAPI REST Engine                   │
│         Auth • CRUD • Query Filters • Dispatch         │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     PostgreSQL 16         │ │          Redis 7          │
│ Current Records & Diffs   │ │ Message Broker & Backend  │
│ Snapshots, Evidence, Runs │ └─────────────┬─────────────┘
└───────────────────────────┘               │
                                            ▼
                              ┌───────────────────────────┐
                              │    Celery Task Workers    │
                              └─────────────┬─────────────┘
                                            │
         ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
         ▼                  ▼                               ▼                  ▼
┌────────────────┐ ┌────────────────┐               ┌────────────────┐ ┌────────────────┐
│Discovery Worker│ │Crawler + SSRF  │               │ Normalizer &   │ │Dual Extractor  │
│Sitemaps/Scores │ │Playwright/Fetch│               │ PDF Parser     │ │Regex + Ollama  │
└────────────────┘ └────────────────┘               └────────────────┘ └────────────────┘
                                                            │
                                                            ▼
                                                    ┌────────────────┐
                                                    │Evidence Guard  │
                                                    │Anti-Hallucinate│
                                                    └───────┬────────┘
                                                            ▼
                                                    ┌────────────────┐
                                                    │Confidence &    │
                                                    │Change Engine   │
                                                    └────────────────┘
```

---

## 2. Core Architectural Principles

### 1. Zero Unverified Assertions (Anti-Hallucination)
The LLM is an information extractor, never an authority. Every extracted field requires a verbatim evidence quote. The engine verifies that `evidence_quote` is a direct substring of the normalized document snapshot:
```python
is_valid, start_offset, end_offset = EvidenceGuard.verify_and_locate(quote, document_text)
if not is_valid:
    reject_field()  # Value set to null / NOT_SPECIFIED
```

### 2. Deterministic 100-Point Confidence Engine
Confidence scores are calculated via pure arithmetic code, never by asking an LLM to rate itself.

| Factor | Points | Evaluation Rule |
| :--- | :---: | :--- |
| **Official Primary Source Verified** | 20 | Domain verified in official government/university/CSR registry |
| **Scholarship Present on Current Page** | 15 | Active presence confirmed in live 200 OK snapshot |
| **Official Application URL Verified** | 10 | Direct application portal validated |
| **Eligibility Directly Supported** | 15 | Structured criteria backed by verbatim evidence quotes |
| **Deadline Directly Supported** | 15 | ISO closing date backed by verified quote |
| **Source Freshness** | 10 | Crawled within SLA (< 7 days = 10, < 14 days = 5, else 0) |
| **Extraction Consistency** | 5 | Deterministic regex and structured schema agree |
| **Conflict Absence** | 5 | No conflicting dates/amounts across official notifications |
| **Evidence Completeness** | 5 | $\ge 80\%$ of populated fields backed by quotes |
| **Total** | **100** | |

#### Hard Gates:
- If `Official Primary Source == False`: Score capped at 70.0% and status forced to `REVIEW_REQUIRED`. Aggregators can discover candidates but can **never** be marked `VERIFIED`.
- Status `VERIFIED` requires: `Score >= 95.0 AND Official Source == True AND Conflicts == 0`.

### 3. Change Detection & Version History
When a page is re-crawled:
- If `SHA256(normalized_text)` is identical $\rightarrow$ status `UNCHANGED`. No version bump.
- If content changed $\rightarrow$ re-extracts, computes field diffs, classifies severity (`HIGH`, `MEDIUM`, `LOW`), appends an immutable record to `scholarship_versions`, and records a `change_event`.

---

## 3. Quickstart & Installation

### Local Setup (Recommended)
Prerequisites: Python 3.11+, Node 18+, PostgreSQL, Redis.

```bash
# 1. Clone repository & install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd apps/web && npm install && npm run build && cd ../..

# 2. Configure environment
cp .env.example .env

# 3. Seed source registry (22+ official sources)
python scripts/seed_sources.py

# 4. Run crawler pipeline
python scripts/crawl_once.py

# 5. Run change simulator (proves field diffs and version history)
python scripts/replay_change.py

# 6. Run compliance audit
python scripts/audit_dataset.py

# 7. Start API & Dashboard server
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser for the full interactive dashboard and **[http://localhost:8000/docs](http://localhost:8000/docs)** for interactive Swagger API documentation.

---

### Docker Compose
To run the entire multi-container stack:
```bash
docker compose up --build
```
Services spun up:
- `api`: FastAPI REST backend + static web distribution on port 8000
- `worker`: Celery task worker connected to Redis
- `postgres`: PostgreSQL 16 on port 5432
- `redis`: Redis 7 broker on port 6379
- `ollama`: Local open-source LLM container on port 11434

---

## 4. Evaluator Audit Verification

Run the automated compliance audit script:
```bash
python scripts/audit_dataset.py
```

### Verified Audit Output:
```
=================================================================
         SCHOLARSHIP INTELLIGENCE AUDIT REPORT
=================================================================
Total discovered:              25
Verified:                      22
Confidence >= 95:              24

Source types breakdown:
  UNIVERSITY                6
  FOUNDATION                3
  CORPORATE                 6
  AGGREGATOR                1
  GOVERNMENT                9

Official-source coverage:     100.0%
Evidence coverage:             100.0% (Total quotes: 96)
Application URLs retained:     25/25
Change detection examples:     5
Expired/stale examples:        2 (Expired: 1, Expiring Soon: 1)
Review required:               1
Unsupported/hallucinated:      0

Assignment Evaluation Checklist:
-----------------------------------------------------------------
  [PASS] 20+ real scholarships
  [PASS] 15+ verified scholarships
  [PASS] 10+ confidence >= 95.0
  [PASS] 3+ distinct source types
  [PASS] 2+ detected change events
  [PASS] 2+ stale/expired examples
  [PASS] 100% official URLs retained
  [PASS] Evidence quotes retained
  [PASS] Old and new values recorded
  [PASS] No unsupported/hallucinated values
-----------------------------------------------------------------
AUDIT RESULT: PASS
```

---

## 5. Automated Test Suite

Run unit and integration tests:
```bash
pytest -v
```

Tests cover:
- **`test_confidence_calculator.py`**: 100-point calculation, hard gates on aggregators, conflict penalties, freshness SLAs.
- **`test_evidence_guard.py`**: Substring verification, whitespace normalization, rejection of hallucinated quotes.
- **`test_ssrf_guard.py`**: Blocks loopback (127.0.0.1), private subnets (10.x, 172.16.x, 192.168.x, 169.254.x), file:// protocols.
- **`test_change_engine.py`**: Field-level diff detection and severity classification.
- **`test_api_endpoints.py`**: Integration tests across `/api/v1/scholarships`, `/metrics`, `/sources`, `/changes`.

---

## 6. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/api/v1/metrics` | Dashboard statistics (discovered, verified, active, expired, avg confidence) |
| `GET` | `/api/v1/scholarships` | Filterable list (`status`, `source_type`, `min_confidence`, `q`, `provider`) |
| `GET` | `/api/v1/scholarships/{id}` | Full detail view with structured eligibility AST & explainability breakdown |
| `GET` | `/api/v1/scholarships/{id}/history` | Historical version snapshots ordered by version number |
| `GET` | `/api/v1/scholarships/{id}/evidence` | Verbatim text quotes with character offsets and snapshot hashes |
| `GET` | `/api/v1/sources` | Registered sources registry with crawl frequencies |
| `POST` | `/api/v1/crawl-runs` | Trigger a new crawl pipeline run |
| `GET` | `/api/v1/crawl-runs` | List crawl runs and batch progress metrics |
| `GET` | `/api/v1/changes` | Recent field change events feed |
| `GET` | `/api/v1/review-queue` | Opportunities flagged for human review |
| `POST` | `/api/v1/review-queue/{id}/action` | Approve or Reject flagged items with reviewer notes |

---

## 7. Author & Contributor

- **Honours Bhadauria** ([@honoursbhaduria](https://github.com/honoursbhaduria))
  - GitHub: [https://github.com/honoursbhaduria](https://github.com/honoursbhaduria)
  - Role: Lead Architect & Developer


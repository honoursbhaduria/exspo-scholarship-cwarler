.PHONY: help setup seed crawl replay audit test run-api run-worker run-web clean docker-up docker-down

PYTHON = .venv/bin/python3
PIP = .venv/bin/pip
PYTEST = .venv/bin/pytest

help:
	@echo "Scholarship Intelligence Platform Commands:"
	@echo "  make setup       Install dependencies and build UI"
	@echo "  make seed        Seed trusted source registry"
	@echo "  make crawl       Run single crawler pass"
	@echo "  make replay      Simulate deadline/amount change events"
	@echo "  make audit       Run assignment compliance audit"
	@echo "  make test        Execute pytest test suite"
	@echo "  make run-api     Start FastAPI backend & UI on port 8000"
	@echo "  make run-worker  Start Celery asynchronous task worker"
	@echo "  make docker-up   Start all services via Docker Compose"
	@echo "  make docker-down Stop all Docker Compose services"

setup:
	python3 -m venv .venv
	$(PIP) install -r requirements.txt
	cd apps/web && npm install && npm run build

seed:
	$(PYTHON) scripts/seed_sources.py

crawl:
	$(PYTHON) scripts/crawl_once.py

replay:
	$(PYTHON) scripts/replay_change.py

audit:
	$(PYTHON) scripts/audit_dataset.py

test:
	$(PYTEST) -v

run-api:
	$(PYTHON) -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

run-worker:
	.venv/bin/celery -A workers.celery_app.celery_app worker -l info

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

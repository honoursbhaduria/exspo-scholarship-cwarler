# Multi-stage Dockerfile for Scholarship Intelligence Platform
FROM node:22-alpine AS web-builder
WORKDIR /app/web
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web/ ./
RUN npm run build

FROM python:3.13-slim AS backend
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY core/ /app/core/
COPY crawler/ /app/crawler/
COPY workers/ /app/workers/
COPY storage/ /app/storage/
COPY scripts/ /app/scripts/
COPY apps/api/ /app/apps/api/
COPY --from=web-builder /app/web/dist /app/apps/web/dist

EXPOSE 8000

CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]

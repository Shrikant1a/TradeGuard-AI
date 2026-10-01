# ==============================================================================
# TradeGuard AI - Production Dockerfile for FastAPI Backend & Background Worker
# Multi-purpose, slim, secure non-root container image.
# ==============================================================================

FROM python:3.11-slim-bookworm AS base

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install minimal OS dependencies for health checking and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user for production security
RUN groupadd --system --gid 10001 appgroup && \
    useradd --system --uid 10001 --gid appgroup --create-home --home-dir /home/appuser appuser

WORKDIR /app

# Step 1: Install Python dependencies with layer caching
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Step 2: Copy backend application source code
COPY . /app/backend

# Set proper non-root file ownership
RUN chown -R appuser:appgroup /app /home/appuser

# Switch to non-root user
USER appuser

# Expose HTTP API port
EXPOSE 8000

# Container liveness health check probing /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default execution starts the production Uvicorn ASGI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

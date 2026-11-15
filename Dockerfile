# ==============================================================================
# Production-Grade Dockerfile for E-Commerce FastAPI Application
# ==============================================================================
FROM python:3.12-slim

# Install curl for container HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root user and group
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -s /bin/sh appuser

WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app"

# Install Python dependencies from requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code, migrations, tests, and scripts
COPY --chown=appuser:appgroup alembic.ini .
COPY --chown=appuser:appgroup alembic ./alembic
COPY --chown=appuser:appgroup app ./app
COPY --chown=appuser:appgroup tests ./tests
COPY --chown=appuser:appgroup scripts ./scripts
COPY --chown=appuser:appgroup docker-entrypoint.sh /app/docker-entrypoint.sh

# Ensure entrypoint script is executable
RUN chmod +x /app/docker-entrypoint.sh

# Switch to non-privileged user for security compliance
USER appuser

EXPOSE 8000

# Built-in container health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]

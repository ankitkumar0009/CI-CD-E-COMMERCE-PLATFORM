#!/usr/bin/env bash
# ==============================================================================
# Service Rollback & Health Verification Script (Linux / macOS / Git Bash)
# ==============================================================================
set -euo pipefail

APP_CONTAINER="${API_CONTAINER:-ecommerce-api}"
TARGET_REVISION="${1:-"-1"}"  # Alembic revision to downgrade to, defaults to -1 (previous revision)
MAX_RETRIES=10
RETRY_DELAY=2

echo "=========================================================="
echo " Initiating Application & Database Rollback"
echo " Container Name   : ${APP_CONTAINER}"
echo " Alembic Target   : ${TARGET_REVISION}"
echo "=========================================================="

# Check if application container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${APP_CONTAINER}$"; then
    echo "ERROR: Application container '${APP_CONTAINER}' is not running." >&2
    echo "Attempting to restart with docker compose..."
    docker compose up -d api
    sleep 3
fi

# Step 1: Perform Alembic Migration Rollback if requested
if [ "${TARGET_REVISION}" != "none" ]; then
    echo "[1/3] Executing Alembic migration downgrade to '${TARGET_REVISION}'..."
    docker exec "${APP_CONTAINER}" alembic downgrade "${TARGET_REVISION}"
    echo "✅ Migration downgrade successful."
else
    echo "[1/3] Skipping database migration rollback."
fi

# Step 2: Restart application container to ensure clean state
echo "[2/3] Restarting application container..."
docker restart "${APP_CONTAINER}" >/dev/null

# Step 3: Verify Liveness and Readiness
echo "[3/3] Probing application health endpoints..."
ATTEMPT=1
HEALTHY=false

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "  Probe attempt $ATTEMPT of $MAX_RETRIES..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ready 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        HEALTHY=true
        break
    fi
    sleep $RETRY_DELAY
    ATTEMPT=$((ATTEMPT + 1))
done

if [ "$HEALTHY" = true ]; then
    echo "=========================================================="
    echo "✅ Rollback verified successfully! Service is HEALTHY & READY."
    echo "   Endpoint: http://localhost:8000/ready (HTTP 200)"
    echo "=========================================================="
    exit 0
else
    echo "==========================================================" >&2
    echo "❌ Rollback health verification failed after $MAX_RETRIES attempts." >&2
    echo "Recent container logs:" >&2
    docker logs --tail 30 "${APP_CONTAINER}" >&2
    echo "==========================================================" >&2
    exit 1
fi


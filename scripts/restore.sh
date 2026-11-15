#!/usr/bin/env bash
# ==============================================================================
# Database Restore Script for E-Commerce PostgreSQL Container (Linux / macOS / Git Bash)
# ==============================================================================
set -euo pipefail

CONTAINER_NAME="${POSTGRES_CONTAINER:-ecommerce-postgres}"
DB_NAME="${POSTGRES_DB:-ecommerce_db}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"

# If backup file argument is not provided, pick the newest .sql file in backups/
if [ $# -ge 1 ]; then
    BACKUP_FILE="$1"
else
    BACKUP_FILE=$(find "${BACKUP_DIR}" -name "*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- || true)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: No valid backup file specified or found in ${BACKUP_DIR}." >&2
    echo "Usage: $0 [path/to/backup.sql]" >&2
    exit 1
fi

echo "=========================================================="
echo " Starting Database Restore"
echo " Target Container : ${CONTAINER_NAME}"
echo " Database Name    : ${DB_NAME}"
echo " Source File      : ${BACKUP_FILE}"
echo "=========================================================="

# Check if PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: Container '${CONTAINER_NAME}' is not running." >&2
    echo "Please start the stack with: docker compose up -d" >&2
    exit 1
fi

# Terminate active client connections to avoid locking conflicts
echo "[1/3] Terminating existing connections to ${DB_NAME}..."
docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true

# Restore database from SQL dump
echo "[2/3] Restoring database schema and records from SQL dump..."
docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}" >/dev/null

# Verify restoration by querying table record counts
echo "[3/3] Verifying restored tables..."
PRODUCT_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ' || echo "0")
ORDER_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM orders;" 2>/dev/null | tr -d ' ' || echo "0")
USER_COUNT=$(docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM admin_users;" 2>/dev/null | tr -d ' ' || echo "0")

echo "=========================================================="
echo "✅ Database restore completed successfully!"
echo "   Products Count : ${PRODUCT_COUNT}"
echo "   Orders Count   : ${ORDER_COUNT}"
echo "   Admin Users    : ${USER_COUNT}"
echo "=========================================================="


#!/usr/bin/env bash
# ==============================================================================
# Database Backup Script for E-Commerce PostgreSQL Container (Linux / macOS / Git Bash)
# ==============================================================================
set -euo pipefail

CONTAINER_NAME="${POSTGRES_CONTAINER:-ecommerce-postgres}"
DB_NAME="${POSTGRES_DB:-ecommerce_db}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "=========================================================="
echo " Starting Database Backup"
echo " Target Container : ${CONTAINER_NAME}"
echo " Database Name    : ${DB_NAME}"
echo " Output File      : ${BACKUP_FILE}"
echo "=========================================================="

# Check if PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: Container '${CONTAINER_NAME}' is not running." >&2
    echo "Please start the stack with: docker compose up -d" >&2
    exit 1
fi

# Execute pg_dump inside container and stream to local backup file
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" --clean --if-exists --format=plain "${DB_NAME}" > "${BACKUP_FILE}"

# Verify backup file existence and size
if [ -s "${BACKUP_FILE}" ]; then
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup successfully created!"
    echo "   File : ${BACKUP_FILE}"
    echo "   Size : ${FILE_SIZE}"
else
    echo "❌ Backup failed or output file is empty." >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi


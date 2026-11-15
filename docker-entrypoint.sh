#!/bin/sh
set -e

echo "=========================================================="
echo " Starting E-Commerce API Service Container"
echo "=========================================================="

echo "[1/3] Running database migrations with Alembic..."
alembic upgrade head

echo "[2/3] Seeding initial database data..."
python scripts/seed_data.py

echo "[3/3] Launching Uvicorn server on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000


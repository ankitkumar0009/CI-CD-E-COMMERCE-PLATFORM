#!/usr/bin/env bash
# ==============================================================================
# Database Seeding Utility Script
# ==============================================================================

set -e

echo "Seeding database with sample products, categories, and initial admin users..."

if [ -f "backend/src/scripts/seed.js" ]; then
  cd backend && node src/scripts/seed.js
else
  echo "Seed script found at backend/src/scripts/seed.js"
fi

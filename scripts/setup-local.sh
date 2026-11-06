#!/usr/bin/env bash
# ==============================================================================
# CloudOps E-Commerce Platform - Local Setup Script (Linux / macOS / WSL)
# ==============================================================================

set -e

echo -e "\033[36m==========================================================\033[0m"
echo -e "\033[36m🚀 Setting up CloudOps Full-Stack Platform locally\033[0m"
echo -e "\033[36m==========================================================\033[0m"

# Verify toolchain
command -v node >/dev/null 2>&1 || { echo -e "\033[31m❌ Node.js is required but not installed.\033[0m" >&2; exit 1; }
echo -e "\033[32m✔ Node.js $(node -v) detected.\033[0m"

if command -v docker >/dev/null 2>&1; then
  echo -e "\033[32m✔ Docker $(docker --version) detected.\033[0m"
else
  echo -e "\033[33m⚠ Docker not detected. Standard Node execution mode recommended.\033[0m"
fi

echo ""
echo "Select execution option:"
echo "1) Full Containerized Stack (Docker Compose: Frontend, Backend, Mongo, Prometheus, Grafana)"
echo "2) Direct Native Run (Install npm dependencies and run Vite & Express directly)"
read -p "Enter choice [1 or 2]: " choice

if [ "$choice" == "1" ]; then
  echo -e "\033[36m🐳 Launching Docker Compose stack...\033[0m"
  docker compose up --build
else
  echo -e "\033[36m📦 Installing backend packages...\033[0m"
  cd backend && npm install
  cd ..

  echo -e "\033[36m📦 Installing frontend packages...\033[0m"
  cd frontend && npm install
  cd ..

  echo -e "\033[32m✅ Setup completed successfully!\033[0m"
  echo "Start backend:  cd backend && npm run dev"
  echo "Start frontend: cd frontend && npm run dev"
fi

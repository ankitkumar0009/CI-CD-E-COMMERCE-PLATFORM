@echo off
TITLE CloudOps Full-Stack Platform Launcher
echo ==============================================================================
echo 🚀 Starting CloudOps Full-Stack Platform (Backend + Frontend)
echo ==============================================================================

echo [1/3] Starting Backend API Server on http://localhost:5000 ...
start "CloudOps Backend API (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend React + Vite Server on http://localhost:3000 ...
start "CloudOps Frontend SPA (Port 3000)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo ==============================================================================
echo ✅ Both servers are now running!
echo    - Frontend UI:        http://localhost:3000
echo    - Backend API:       http://localhost:5000
echo    - Health Probe:      http://localhost:5000/health
echo    - Prometheus:        http://localhost:5000/metrics
echo    - DevOps Dashboard:  http://localhost:3000/devops
echo ==============================================================================
echo Press any key to exit this launcher window (servers will continue running).
pause >nul

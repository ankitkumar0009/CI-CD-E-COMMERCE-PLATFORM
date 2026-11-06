# ==============================================================================
# CloudOps E-Commerce Platform - PowerShell Launcher
# Usage: .\run-dev.ps1
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching CloudOps Full-Stack Platform" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend API on http://localhost:5000..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -PassThru

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend UI on http://localhost:3000..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Start-Sleep -Seconds 3

# Launch browser
Write-Host "Opening web browser at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n✅ Both servers are running!" -ForegroundColor Green
Write-Host "   Frontend SPA:     http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API:      http://localhost:5000" -ForegroundColor White
Write-Host "   DevOps Dashboard: http://localhost:3000/devops" -ForegroundColor White
Write-Host "   Prometheus:       http://localhost:5000/metrics" -ForegroundColor White


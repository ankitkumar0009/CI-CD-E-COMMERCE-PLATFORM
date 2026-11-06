# ==============================================================================
# CloudOps E-Commerce Platform - Local Setup Script (PowerShell)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Setting up CloudOps Full-Stack Platform locally" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✔ Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not detected. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✔ Found Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker not detected or daemon not running. Local containerization disabled." -ForegroundColor Yellow
}

# 3. Prompt user for setup mode
Write-Host "`nChoose your local run mode:" -ForegroundColor White
Write-Host "1) Run with Docker Compose (Full Stack: Frontend, Backend, Mongo, Prometheus, Grafana)" -ForegroundColor Yellow
Write-Host "2) Install npm dependencies & run directly via Node.js (Zero external deps mode)" -ForegroundColor Yellow
$choice = Read-Host "Enter option (1 or 2)"

if ($choice -eq "1") {
    Write-Host "`n🐳 Starting Full Stack with Docker Compose..." -ForegroundColor Cyan
    docker compose up --build
} else {
    Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location -Path "backend"
    npm install
    
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location -Path "../frontend"
    npm install
    
    Set-Location -Path ".."
    Write-Host "`n✅ Setup complete! Run the following commands in separate terminals:" -ForegroundColor Green
    Write-Host "Terminal 1 (Backend API):  cd backend; npm run dev" -ForegroundColor White
    Write-Host "Terminal 2 (Frontend UI):  cd frontend; npm run dev" -ForegroundColor White
}


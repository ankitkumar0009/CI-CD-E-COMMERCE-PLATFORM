<#
.SYNOPSIS
    Service Rollback & Health Verification Script (Windows PowerShell).
.DESCRIPTION
    Rolls back database migrations using Alembic inside the ecommerce-api container,
    restarts the service, and verifies health and readiness endpoints.
.EXAMPLE
    .\scripts\rollback.ps1
    .\scripts\rollback.ps1 -TargetRevision "-1"
    .\scripts\rollback.ps1 -SkipMigrationDowngrade
#>

param(
    [string]$AppContainer = "ecommerce-api",
    [string]$TargetRevision = "-1",
    [switch]$SkipMigrationDowngrade = $false,
    [int]$MaxRetries = 10,
    [int]$RetryDelaySec = 2
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Initiating Application & Database Rollback (PowerShell)" -ForegroundColor Cyan
Write-Host " Container Name : $AppContainer"
Write-Host " Alembic Target : $(if ($SkipMigrationDowngrade) { 'Skipped' } else { $TargetRevision })"
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if application container is running
$runningContainers = docker ps --format '{{.Names}}'
if ($runningContainers -notcontains $AppContainer) {
    Write-Host "Application container '$AppContainer' is not running. Starting via docker compose..." -ForegroundColor Yellow
    docker compose up -d api
    Start-Sleep -Seconds 3
}

# Step 1: Migration rollback if not skipped
if (-not $SkipMigrationDowngrade) {
    try {
        Write-Host "[1/3] Executing Alembic migration downgrade to '$TargetRevision'..."
        docker exec $AppContainer alembic downgrade $TargetRevision
        Write-Host " Migration downgrade completed." -ForegroundColor Green
    } catch {
        Write-Error "Alembic rollback failed: $_"
        exit 1
    }
} else {
    Write-Host "[1/3] Skipping database migration rollback."
}

# Step 2: Restart application container
Write-Host "[2/3] Restarting application container..."
docker restart $AppContainer | Out-Null

# Step 3: Health and readiness probe
Write-Host "[3/3] Probing application health endpoints..."
$healthy = $false

for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    Write-Host "  Probe attempt $attempt of $MaxRetries..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/ready" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Retry until timeout
    }
    Start-Sleep -Seconds $RetryDelaySec
}

if ($healthy) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Rollback verified successfully! Service is HEALTHY & READY." -ForegroundColor Green
    Write-Host "   Endpoint: http://localhost:8000/ready (HTTP 200)" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host " Rollback health verification failed after $MaxRetries attempts." -ForegroundColor Red
    Write-Host "Recent container logs:" -ForegroundColor Yellow
    docker logs --tail 30 $AppContainer
    Write-Host "==========================================================" -ForegroundColor Red
    exit 1
}


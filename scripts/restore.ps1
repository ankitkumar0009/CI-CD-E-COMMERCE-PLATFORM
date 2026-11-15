<#
.SYNOPSIS
    Database Restore Script for E-Commerce PostgreSQL Container (Windows PowerShell).
.DESCRIPTION
    Restores the ecommerce_db database from a specified or latest .sql backup file.
.EXAMPLE
    .\scripts\restore.ps1
    .\scripts\restore.ps1 -BackupFilePath "backups\backup_ecommerce_db_20261115_120000.sql"
#>

param(
    [string]$BackupFilePath = "",
    [string]$ContainerName = "ecommerce-postgres",
    [string]$DatabaseName = "ecommerce_db",
    [string]$DatabaseUser = "postgres"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectRoot "backups"

if ([string]::IsNullOrWhiteSpace($BackupFilePath)) {
    $latestBackup = Get-ChildItem -Path $BackupDir -Filter "*.sql" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($null -eq $latestBackup) {
        Write-Error "No backup files found in $BackupDir. Please specify -BackupFilePath or create a backup first."
        exit 1
    }
    $BackupFilePath = $latestBackup.FullName
} elseif (-not (Test-Path $BackupFilePath)) {
    Write-Error "Specified backup file does not exist: $BackupFilePath"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Database Restore (PowerShell)" -ForegroundColor Cyan
Write-Host " Target Container : $ContainerName"
Write-Host " Database Name    : $DatabaseName"
Write-Host " Source File      : $BackupFilePath"
Write-Host "==========================================================" -ForegroundColor Cyan

# Verify container is running
$runningContainers = docker ps --format '{{.Names}}'
if ($runningContainers -notcontains $ContainerName) {
    Write-Error "Container '$ContainerName' is not running. Please run 'docker compose up -d' first."
    exit 1
}

try {
    Write-Host "[1/3] Terminating active connections to $DatabaseName..."
    docker exec $ContainerName psql -U $DatabaseUser -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();" | Out-Null

    Write-Host "[2/3] Restoring database schema and records from SQL dump..."
    Get-Content -Path $BackupFilePath -Raw | docker exec -i $ContainerName psql -U $DatabaseUser -d $DatabaseName | Out-Null

    Write-Host "[3/3] Verifying restored tables..."
    $prodCount = (docker exec $ContainerName psql -U $DatabaseUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM products;").Trim()
    $orderCount = (docker exec $ContainerName psql -U $DatabaseUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM orders;").Trim()
    $userCount = (docker exec $ContainerName psql -U $DatabaseUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM admin_users;").Trim()

    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Database restore completed successfully!" -ForegroundColor Green
    Write-Host "   Products Count : $prodCount"
    Write-Host "   Orders Count   : $orderCount"
    Write-Host "   Admin Users    : $userCount"
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Error "Database restoration failed: $_"
    exit 1
}


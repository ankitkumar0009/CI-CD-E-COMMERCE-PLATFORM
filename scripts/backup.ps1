<#
.SYNOPSIS
    Database Backup Script for E-Commerce PostgreSQL Container (Windows PowerShell).
.DESCRIPTION
    Creates a timestamped SQL dump of the ecommerce_db database running inside
    the ecommerce-postgres Docker container.
#>

param(
    [string]$ContainerName = "ecommerce-postgres",
    [string]$DatabaseName = "ecommerce_db",
    [string]$DatabaseUser = "postgres"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectRoot "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "backup_${DatabaseName}_${Timestamp}.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Database Backup (PowerShell)" -ForegroundColor Cyan
Write-Host " Target Container : $ContainerName"
Write-Host " Database Name    : $DatabaseName"
Write-Host " Output File      : $BackupFile"
Write-Host "==========================================================" -ForegroundColor Cyan

# Verify container is running
$runningContainers = docker ps --format '{{.Names}}'
if ($runningContainers -notcontains $ContainerName) {
    Write-Error "Container '$ContainerName' is not running. Please run 'docker compose up -d' first."
    exit 1
}

# Run pg_dump inside container and redirect output
try {
    docker exec $ContainerName pg_dump -U $DatabaseUser --clean --if-exists --format=plain $DatabaseName | Out-File -FilePath $BackupFile -Encoding utf8
    
    $fileInfo = Get-Item $BackupFile
    if ($fileInfo.Length -gt 0) {
        $sizeKb = [math]::Round($fileInfo.Length / 1KB, 2)
        Write-Host " Backup successfully created!" -ForegroundColor Green
        Write-Host "   File : $BackupFile"
        Write-Host "   Size : $sizeKb KB"
    } else {
        Remove-Item $BackupFile -Force
        Write-Error "Backup file was created but is empty."
        exit 1
    }
} catch {
    Write-Error "Database backup failed: $_"
    exit 1
}


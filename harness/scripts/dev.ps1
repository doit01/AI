param(
    [switch]$NoDB,
    [switch]$NoBackend,
    [switch]$NoFrontend
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Harness Dev Environment ===" -ForegroundColor Cyan

# 1. Start PostgreSQL
if (-not $NoDB) {
    Write-Host "[1/3] Starting PostgreSQL..." -ForegroundColor Green
    docker compose -f "$root\demo\docker-compose.yml" up -d db
    Write-Host "  PostgreSQL ready on localhost:5432" -ForegroundColor Green
}

# 2. Start Backend
if (-not $NoBackend) {
    Write-Host "[2/3] Starting Backend (Spring Boot)..." -ForegroundColor Green
    $jb = Start-Job -ScriptBlock {
        param($d)
        Set-Location $d
        gradle bootRun
    } -ArgumentList "$root\demo\backend"
    Write-Host "  Backend starting on http://localhost:8080" -ForegroundColor Green
}

# 3. Start Frontend
if (-not $NoFrontend) {
    Write-Host "[3/3] Starting Frontend (Vite)..." -ForegroundColor Green
    $jf = Start-Job -ScriptBlock {
        param($d)
        Set-Location $d
        bun run dev
    } -ArgumentList "$root\demo\frontend"
    Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green
}

Write-Host "`n=== All services started ===" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Database: localhost:5432 (demo/postgres/postgres)" -ForegroundColor Yellow

# Keep running
Wait-Job -Job $jb, $jf -ErrorAction SilentlyContinue

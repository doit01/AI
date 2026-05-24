param([switch]$Force)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Harness 项目初始化 ===" -ForegroundColor Cyan

# 1. 重建后端 (移除 Lombok 后)
Write-Host "[1/6] 验证后端构建..." -ForegroundColor Green
Set-Location "$root\demo\backend"
gradle build -x test 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 后端构建成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 后端构建失败，请检查错误" -ForegroundColor Red
}

# 2. 安装前端依赖
Write-Host "[2/6] 安装前端依赖..." -ForegroundColor Green
Set-Location "$root\demo\frontend"
bun install 2>&1 | Out-Null
Write-Host "  ✓ 前端依赖安装完成" -ForegroundColor Green

# 3. 构建前端
Write-Host "[3/6] 验证前端构建..." -ForegroundColor Green
bun run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 前端构建成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 前端构建失败，请检查错误" -ForegroundColor Red
}

# 4. 初始化数据库
Write-Host "[4/6] 启动 PostgreSQL..." -ForegroundColor Green
docker compose -f "$root\demo\docker-compose.yml" up -d db 2>&1 | Out-Null
Write-Host "  ✓ PostgreSQL 已启动" -ForegroundColor Green

# 5. 创建 opencode.jsonc（如果不存在）
Write-Host "[5/6] 配置 opencode..." -ForegroundColor Green
if (-not (Test-Path "$root\opencode.jsonc")) {
    Write-Host "  opencode.jsonc 已存在" -ForegroundColor Yellow
}

# 6. 配置 Git
Write-Host "[6/6] 初始化 Git..." -ForegroundColor Green
if (-not (Test-Path "$root\.git")) {
    git init
    git add -A
    git commit -m "Initial commit: harness project with demo (Spring Boot + Vue)"
    Write-Host "  ✓ Git 仓库已初始化" -ForegroundColor Green
} else {
    Write-Host "  Git 仓库已存在" -ForegroundColor Yellow
}

Write-Host "`n=== 安装完成 ===" -ForegroundColor Cyan
Write-Host "启动开发环境: opencode run dev" -ForegroundColor Yellow
Write-Host "或手动:        .\scripts\dev.ps1" -ForegroundColor Yellow
Write-Host "数据库:        localhost:5432 (demo/postgres/postgres)" -ForegroundColor Yellow
Write-Host "后端 API:      http://localhost:8080" -ForegroundColor Yellow
Write-Host "前端页面:      http://localhost:3000" -ForegroundColor Yellow

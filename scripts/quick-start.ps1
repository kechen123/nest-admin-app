# 快速启动脚本（Windows PowerShell）

Write-Host "🚀 快速启动项目..." -ForegroundColor Cyan
Write-Host ""

# 检查 .env 文件
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  未找到 backend/.env 文件" -ForegroundColor Yellow
    Write-Host "请先创建 backend/.env 文件并配置数据库信息" -ForegroundColor Yellow
    exit 1
}

# 启动 MySQL
Write-Host "📦 启动 MySQL..." -ForegroundColor Cyan
npm run mysql:start

# 等待 MySQL 启动
Write-Host "⏳ 等待 MySQL 启动（约 15 秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 检查 MySQL 是否就绪
Write-Host "🔍 检查 MySQL 状态..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$mysqlReady = $false

while ($attempt -lt $maxAttempts) {
    $result = docker exec yl-mysql-dev mysqladmin ping -h localhost -uroot -proot 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL 已就绪" -ForegroundColor Green
        $mysqlReady = $true
        break
    }
    $attempt++
    Start-Sleep -Seconds 1
}

if (-not $mysqlReady) {
    Write-Host "❌ MySQL 启动超时，请检查日志: npm run mysql:logs" -ForegroundColor Red
    exit 1
}

# 初始化数据库
Write-Host "🗄️  初始化数据库..." -ForegroundColor Cyan
Set-Location backend
npm run db:init
Set-Location ..

Write-Host ""
Write-Host "✅ 启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  - 前端: http://localhost:4000"
Write-Host "  - 后端 API: http://localhost:3000/api"
Write-Host "  - Swagger: http://localhost:3000/api"
Write-Host ""
Write-Host "运行以下命令检查服务状态:" -ForegroundColor Cyan
Write-Host "  npm run health"


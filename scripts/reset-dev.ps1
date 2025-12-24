# 重置开发环境脚本（Windows PowerShell）

Write-Host "🧹 正在清理开发环境..." -ForegroundColor Cyan

# 停止并删除容器
Write-Host "停止并删除容器..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# 删除数据卷
Write-Host "删除数据卷..." -ForegroundColor Yellow
docker volume rm yl_mysql_data 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "数据卷已删除或不存在" -ForegroundColor Gray
}

# 询问是否删除镜像
$deleteImages = Read-Host "是否删除镜像？(y/N)"
if ($deleteImages -eq "y" -or $deleteImages -eq "Y") {
    Write-Host "删除镜像..." -ForegroundColor Yellow
    docker rmi yl-backend 2>$null
    docker rmi yl-web 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "镜像已删除或不存在" -ForegroundColor Gray
    }
}

Write-Host "✅ 清理完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以运行以下命令重新初始化：" -ForegroundColor Cyan
Write-Host "  1. npm run init          # 配置环境变量"
Write-Host "  2. npm run dev:up        # 启动服务"
Write-Host "  3. npm run backend:init-db  # 初始化数据库"


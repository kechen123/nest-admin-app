Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "开始导出 Docker 镜像" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 检查镜像是否存在
$backendExists = docker images | findstr yl-backend
$webExists = docker images | findstr yl-web

if (-not $backendExists) {
    Write-Host "错误: yl-backend:latest 镜像不存在，请先运行 npm run build" -ForegroundColor Red
    exit 1
}

if (-not $webExists) {
    Write-Host "错误: yl-web:latest 镜像不存在，请先运行 npm run build" -ForegroundColor Red
    exit 1
}

# 导出镜像
Write-Host "1. 导出后端镜像..." -ForegroundColor Yellow
docker save yl-backend:latest -o yl-backend.tar

Write-Host "2. 导出前端镜像..." -ForegroundColor Yellow
docker save yl-web:latest -o yl-web.tar

# 显示文件信息
Write-Host "3. 导出完成！文件信息：" -ForegroundColor Green
Get-ChildItem yl-*.tar | Format-Table Name, @{Label="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}, FullName

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "镜像导出完成！" -ForegroundColor Green
Write-Host "文件位置: $(Get-Location)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "上传到服务器后，使用以下命令加载：" -ForegroundColor Yellow
Write-Host "  docker load -i yl-backend.tar" -ForegroundColor White
Write-Host "  docker load -i yl-web.tar" -ForegroundColor White
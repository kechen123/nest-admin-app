# 修复 Git 历史中的敏感信息脚本
# 用于从 Git 历史中移除 .env 文件

Write-Host "🔒 修复 Git 历史中的敏感信息..." -ForegroundColor Cyan
Write-Host ""

# 检查是否在 Git 仓库中
if (-not (Test-Path ".git")) {
    Write-Host "❌ 错误: 当前目录不是 Git 仓库" -ForegroundColor Red
    exit 1
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  警告: 工作目录有未提交的更改" -ForegroundColor Yellow
    Write-Host "   建议先提交或暂存这些更改" -ForegroundColor Yellow
    $continue = Read-Host "   是否继续？(y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

Write-Host "📋 步骤 1: 检查 .env 文件是否被跟踪..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String "\.env$"
if ($envFiles) {
    Write-Host "   发现以下 .env 文件被跟踪:" -ForegroundColor Red
    $envFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor Red }
    Write-Host ""
} else {
    Write-Host "   ✅ .env 文件未被跟踪" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📋 步骤 2: 从 Git 索引中移除 .env 文件（保留本地文件）..." -ForegroundColor Yellow
git rm --cached backend/.env 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 已从索引中移除 backend/.env" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  backend/.env 不在索引中" -ForegroundColor Gray
}

# 检查根目录的 .env
git rm --cached .env 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 已从索引中移除 .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 步骤 3: 提交更改..." -ForegroundColor Yellow
Write-Host "   这将创建一个新的提交，从 Git 中移除 .env 文件" -ForegroundColor Gray
Write-Host ""

$commit = Read-Host "   是否提交更改？(y/N)"
if ($commit -eq "y" -or $commit -eq "Y") {
    git commit -m "chore: remove .env file from git tracking"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 更改已提交" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  没有需要提交的更改" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📋 步骤 4: 从 Git 历史中完全移除敏感信息（可选）..." -ForegroundColor Yellow
Write-Host "   ⚠️  警告: 这会重写 Git 历史，如果已经推送到远程，需要强制推送" -ForegroundColor Red
Write-Host "   ⚠️  警告: 如果其他人也在使用这个仓库，需要协调操作" -ForegroundColor Red
Write-Host ""
Write-Host "   选项:" -ForegroundColor Cyan
Write-Host "   1. 使用 git-filter-repo (推荐，需要安装)" -ForegroundColor White
Write-Host "   2. 使用 BFG Repo-Cleaner (需要安装)" -ForegroundColor White
Write-Host "   3. 手动使用 git filter-branch (不推荐)" -ForegroundColor White
Write-Host "   4. 跳过此步骤（如果只是从当前提交移除）" -ForegroundColor White
Write-Host ""

$choice = Read-Host "   选择操作 (1-4，默认4)"
if ($choice -eq "1") {
    Write-Host ""
    Write-Host "   使用 git-filter-repo 移除敏感信息..." -ForegroundColor Yellow
    Write-Host "   请先安装: pip install git-filter-repo" -ForegroundColor Cyan
    Write-Host "   然后运行:" -ForegroundColor Cyan
    Write-Host "   git filter-repo --path backend/.env --invert-paths" -ForegroundColor White
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "   使用 BFG Repo-Cleaner 移除敏感信息..." -ForegroundColor Yellow
    Write-Host "   请先下载: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Cyan
    Write-Host "   然后运行:" -ForegroundColor Cyan
    Write-Host "   java -jar bfg.jar --delete-files backend/.env" -ForegroundColor White
    Write-Host "   git reflog expire --expire=now --all && git gc --prune=now --aggressive" -ForegroundColor White
} elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "   ⚠️  不推荐使用 filter-branch，但可以执行:" -ForegroundColor Yellow
    Write-Host "   git filter-branch --force --index-filter `"git rm --cached --ignore-unmatch backend/.env`" --prune-empty --tag-name-filter cat -- --all" -ForegroundColor White
} else {
    Write-Host "   ✅ 跳过历史清理" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 步骤 5: 验证 .gitignore 配置..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env") {
        Write-Host "   ✅ .gitignore 已包含 .env 规则" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .gitignore 未包含 .env 规则，建议添加" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ 修复完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 后续步骤:" -ForegroundColor Cyan
Write-Host "   1. 如果修改了历史，需要强制推送到远程:" -ForegroundColor White
Write-Host "      git push --force-with-lease origin love-map" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. 确保 .env 文件在本地存在但不在 Git 中" -ForegroundColor White
Write-Host ""
Write-Host "   3. 如果使用 GitHub，可以访问以下链接允许推送（临时方案）:" -ForegroundColor White
Write-Host "      https://github.com/kechen123/nest-admin-app/security/secret-scanning/unblock-secret/38eQ6w5UkzZHOaijYMuUClPe6x1" -ForegroundColor Gray
Write-Host ""

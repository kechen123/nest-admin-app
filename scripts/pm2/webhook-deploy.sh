#!/bin/bash
# Webhook 自动部署脚本
# 配置到 Webhook 服务中，代码 push 后自动执行
# 使用方法: bash scripts/pm2/webhook-deploy.sh

set -e

# 配置变量
APP_DIR="${APP_DIR:-/opt/app/yl}"
BRANCH="${BRANCH:-main}"
LOG_FILE="/var/log/yl-deploy.log"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "开始自动部署..."

cd $APP_DIR || {
    log "错误: 应用目录不存在: $APP_DIR"
    exit 1
}

# 1. 拉取最新代码
log "[1/4] 拉取最新代码..."
if [ -d ".git" ]; then
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH
    git pull origin $BRANCH || git pull origin main || git pull origin master
    log "代码更新完成: $(git rev-parse --short HEAD)"
else
    log "警告: 不是 Git 仓库"
    exit 1
fi

# 2. 更新后端
log "[2/4] 更新后端..."
cd backend
pnpm install --production --frozen-lockfile 2>/dev/null || pnpm install --production
pnpm run build
log "后端构建完成"

# 3. 更新前端
log "[3/4] 更新前端..."
cd ../web
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm run build
log "前端构建完成"

# 4. 重启服务（零停机）
log "[4/4] 重启服务..."
cd ../backend

if pm2 list | grep -q "yl-backend"; then
    pm2 reload yl-backend
    log "服务已重新加载（零停机）"
else
    pm2 start ecosystem.config.js
    pm2 save
    log "服务已启动"
fi

# 重新加载 Nginx
if command -v nginx &> /dev/null && systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx 2>/dev/null || true
    log "Nginx 已重新加载"
fi

log "=========================================="
log "自动部署完成！"
log "服务状态:"
pm2 status | tee -a "$LOG_FILE"

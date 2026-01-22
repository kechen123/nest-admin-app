#!/bin/bash
# PM2 超快速部署脚本（适合已有环境）
# 使用方法: bash scripts/pm2/quick-deploy.sh

set -e

APP_DIR="${APP_DIR:-/opt/app/yl}"
BRANCH="${BRANCH:-main}"

echo "🚀 PM2 超快速部署..."

cd $APP_DIR

# 拉取代码
[ -d ".git" ] && git pull origin $BRANCH || git pull origin main || true

# 构建并重启
cd backend
pnpm install --production --frozen-lockfile 2>/dev/null || pnpm install --production
pnpm run build
pm2 reload yl-backend 2>/dev/null || pm2 start ecosystem.config.js

cd ../web
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm run build

echo "✅ 部署完成！"

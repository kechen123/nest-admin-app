#!/bin/bash
# PM2 快速更新部署脚本
# 使用方法: bash scripts/pm2/update.sh
# 功能：快速更新代码、重新构建、重启服务（零停机）

set -e

# 配置变量
APP_DIR="${APP_DIR:-/opt/app/yl}"
BACKEND_DIR="$APP_DIR/backend"
WEB_DIR="$APP_DIR/web"
BRANCH="${BRANCH:-main}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "PM2 快速更新部署"
echo "==========================================${NC}"

cd $APP_DIR

# 1. 拉取最新代码
echo -e "${YELLOW}[1/4] 拉取最新代码...${NC}"
if [ -d ".git" ]; then
    git pull origin $BRANCH || git pull origin main || git pull origin master
    echo -e "${GREEN}代码更新完成${NC}"
else
    echo "警告: 不是 Git 仓库，跳过代码拉取"
fi

# 2. 更新依赖（如果需要）
echo -e "${YELLOW}[2/4] 检查依赖更新...${NC}"
cd $BACKEND_DIR
if [ -f "pnpm-lock.yaml" ] && [ "pnpm-lock.yaml" -nt "node_modules" ]; then
    echo "更新后端依赖..."
    pnpm install --production --frozen-lockfile
fi

cd $WEB_DIR
if [ -f "pnpm-lock.yaml" ] && [ "pnpm-lock.yaml" -nt "node_modules" ]; then
    echo "更新前端依赖..."
    pnpm install --frozen-lockfile
fi

# 3. 重新构建
echo -e "${YELLOW}[3/4] 重新构建项目...${NC}"

cd $BACKEND_DIR
pnpm run build
echo "后端构建完成"

cd $WEB_DIR
pnpm run build
echo "前端构建完成"

# 4. 重启服务（零停机）
echo -e "${YELLOW}[4/4] 重启服务...${NC}"
cd $BACKEND_DIR

if pm2 list | grep -q "yl-backend"; then
    pm2 reload yl-backend
    echo -e "${GREEN}服务已重新加载（零停机）${NC}"
else
    pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}服务已启动${NC}"
fi

# 重新加载 Nginx（如果需要）
if command -v nginx &> /dev/null; then
    sudo systemctl reload nginx 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}=========================================="
echo "更新完成！"
echo "==========================================${NC}"
pm2 status

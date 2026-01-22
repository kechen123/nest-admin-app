#!/bin/bash

# 部署脚本 - Docker + Codeup Webhook 自动部署
# 使用方法：此脚本由 webhook 服务自动调用
# 注意：此脚本已存在于代码仓库中，首次部署后只需设置执行权限即可

set -e  # 遇到错误立即退出

# 配置变量
DEPLOY_PATH="/opt/app/yl"
LOG_FILE="/var/log/yl-deploy.log"
COMPOSE_FILE="docker-compose.prod.yml"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "开始自动部署..."

# 进入项目目录
cd "$DEPLOY_PATH" || {
    log "错误: 无法进入项目目录 $DEPLOY_PATH"
    exit 1
}

# 检查 Git 仓库状态
if [ ! -d ".git" ]; then
    log "错误: 当前目录不是 Git 仓库"
    exit 1
}

# 拉取最新代码
log "正在拉取最新代码..."
git fetch origin main || {
    log "错误: git fetch 失败"
    exit 1
}

# 获取当前分支和最新提交信息
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LATEST_COMMIT=$(git rev-parse origin/main)
CURRENT_COMMIT=$(git rev-parse HEAD)

log "当前分支: $CURRENT_BRANCH"
log "当前提交: $CURRENT_COMMIT"
log "最新提交: $LATEST_COMMIT"

# 检查是否有更新
if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    log "代码已是最新，无需部署"
    exit 0
fi

# 切换到 main 分支（如果不在）
if [ "$CURRENT_BRANCH" != "main" ]; then
    log "切换到 main 分支..."
    git checkout main || {
        log "错误: 无法切换到 main 分支"
        exit 1
    }
fi

# 拉取代码
log "正在合并最新代码..."
git pull origin main || {
    log "错误: git pull 失败"
    exit 1
}

# 检查 docker-compose 文件是否存在
if [ ! -f "$COMPOSE_FILE" ]; then
    log "错误: 找不到 $COMPOSE_FILE 文件"
    exit 1
fi

# 停止旧容器（优雅停止）
log "正在停止旧容器..."
docker compose -f "$COMPOSE_FILE" down || {
    log "警告: 停止旧容器时出现错误，继续执行..."
}

# 重新构建并启动服务
log "正在重新构建和启动服务..."
docker compose -f "$COMPOSE_FILE" up -d --build || {
    log "错误: Docker Compose 启动失败"
    exit 1
}

# 等待服务启动
log "等待服务启动..."
sleep 10

# 检查服务状态
log "检查服务状态..."
docker compose -f "$COMPOSE_FILE" ps

# 验证服务健康
log "验证服务健康状态..."
HEALTH_CHECK=$(docker compose -f "$COMPOSE_FILE" ps --format json | jq -r '.[] | select(.Service=="backend") | .Health' 2>/dev/null || echo "unknown")

if [ "$HEALTH_CHECK" = "healthy" ] || [ "$HEALTH_CHECK" = "unknown" ]; then
    log "✅ 部署成功！"
    log "最新提交: $(git log -1 --oneline)"
    log "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
else
    log "⚠️  警告: 服务健康检查未通过，请手动检查"
fi

log "=========================================="
log ""

exit 0

#!/bin/bash

# 部署脚本 - Docker + Codeup Webhook 自动部署
# 使用方法：此脚本由 webhook 服务自动调用
# 注意：此脚本已存在于代码仓库中，首次部署后只需设置执行权限即可

set -e  # 遇到错误立即退出

# 配置变量
DEPLOY_PATH="/opt/app/yl"
LOG_FILE="/var/log/yl-deploy.log"
COMPOSE_FILE="docker-compose.prod.yml"
BRANCH="main"

# 排除的文件/目录模式（这些文件的修改不会触发部署）
EXCLUDE_PATTERNS=(
    "docs/"
    "uniapp-mobile/"
    "test/"
    ".gitignore"
    "README.md"
    "*.md"
)

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
fi

# 拉取最新代码
log "正在拉取最新代码..."
git fetch origin "$BRANCH" || {
    log "错误: git fetch 失败"
    exit 1
}

# 获取当前分支和最新提交信息
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LATEST_COMMIT=$(git rev-parse "origin/$BRANCH")
CURRENT_COMMIT=$(git rev-parse HEAD)

log "当前分支: $CURRENT_BRANCH"
log "当前提交: $CURRENT_COMMIT"
log "最新提交: $LATEST_COMMIT"

# 检查是否有更新
if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    log "代码已是最新，无需部署"
    exit 0
fi

# 检查最新提交修改的文件
log "检查最新提交修改的文件..."
# 获取两个提交之间的所有修改文件
CHANGED_FILES=$(git diff --name-only "$CURRENT_COMMIT" "$LATEST_COMMIT" 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
    log "无法获取修改文件列表，继续部署..."
else
    log "修改的文件列表:"
    echo "$CHANGED_FILES" | while IFS= read -r file; do
        [ -n "$file" ] && log "  - $file"
    done
    
    # 检查是否所有修改的文件都在排除列表中
    SKIP_DEPLOY=true
    NEED_DEPLOY_FILES=""
    
    while IFS= read -r file; do
        if [ -z "$file" ]; then
            continue
        fi
        
        # 检查文件是否匹配排除模式
        MATCHED=false
        for pattern in "${EXCLUDE_PATTERNS[@]}"; do
            # 支持前缀匹配（如 docs/）和完整匹配（如 .gitignore）
            if [[ "$file" == "$pattern" ]] || [[ "$file" == "$pattern"* ]] || [[ "$file" == *"/$pattern" ]] || [[ "$file" == *"/$pattern"* ]]; then
                MATCHED=true
                break
            fi
        done
        
        # 如果文件不匹配任何排除模式，则需要部署
        if [ "$MATCHED" = false ]; then
            SKIP_DEPLOY=false
            if [ -z "$NEED_DEPLOY_FILES" ]; then
                NEED_DEPLOY_FILES="$file"
            else
                NEED_DEPLOY_FILES="$NEED_DEPLOY_FILES, $file"
            fi
        fi
    done <<< "$CHANGED_FILES"
    
    # 如果所有文件都在排除列表中，跳过部署
    if [ "$SKIP_DEPLOY" = true ]; then
        log "所有修改的文件都在排除列表中，跳过部署"
        log "排除的文件: $(echo "$CHANGED_FILES" | tr '\n' ', ')"
        exit 0
    else
        log "需要部署的文件: $NEED_DEPLOY_FILES"
    fi
fi

# 切换到目标分支（如果不在）
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    log "切换到 $BRANCH 分支..."
    git checkout "$BRANCH" || {
        log "错误: 无法切换到 $BRANCH 分支"
        exit 1
    }
fi

# 拉取代码
log "正在合并最新代码..."
git pull origin "$BRANCH" || {
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

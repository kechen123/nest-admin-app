#!/bin/bash
# Git + 服务器构建部署脚本
# 使用方法: ./scripts/deploy.sh [backend|web|all]

set -e  # 遇到错误立即退出

SERVICE=${1:-all}  # 默认部署所有服务

echo "=========================================="
echo "开始部署服务: $SERVICE"
echo "=========================================="

# 检查是否在项目目录
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 拉取最新代码
echo "1. 拉取最新代码..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    # 获取当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD)
    echo "   当前分支: $CURRENT_BRANCH"
    git pull origin "$CURRENT_BRANCH" || git pull origin main || git pull origin master
else
    echo "   警告: 当前目录不是 Git 仓库，跳过代码拉取"
fi

# 检查是否有未提交的更改
if [ -n "$(git status -s 2>/dev/null)" ]; then
    echo "   警告: 工作目录有未提交的更改"
fi

# 根据参数决定部署哪些服务
case $SERVICE in
    backend)
        echo "2. 重新构建后端服务..."
        docker-compose -f docker-compose.prod.yml up -d --build backend
        echo "3. 等待服务启动..."
        sleep 3
        echo "4. 查看后端日志..."
        docker-compose -f docker-compose.prod.yml logs --tail=50 backend
        ;;
    web)
        echo "2. 重新构建前端服务..."
        docker-compose -f docker-compose.prod.yml up -d --build web
        echo "3. 等待服务启动..."
        sleep 3
        echo "4. 查看前端日志..."
        docker-compose -f docker-compose.prod.yml logs --tail=50 web
        ;;
    all|*)
        echo "2. 重新构建所有服务..."
        docker-compose -f docker-compose.prod.yml up -d --build
        echo "3. 等待服务启动..."
        sleep 5
        echo "4. 查看服务状态..."
        docker-compose -f docker-compose.prod.yml ps
        echo "5. 查看最新日志..."
        docker-compose -f docker-compose.prod.yml logs --tail=50
        ;;
esac

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "查看状态: docker-compose -f docker-compose.prod.yml ps"
echo "重启服务: docker-compose -f docker-compose.prod.yml restart"


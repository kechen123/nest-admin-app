#!/bin/bash
# 快速启动脚本（Linux/Mac）

set -e

echo "🚀 快速启动项目..."
echo ""

# 检查 .env 文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  未找到 backend/.env 文件"
    echo "请先创建 backend/.env 文件并配置数据库信息"
    exit 1
fi

# 启动 MySQL
echo "📦 启动 MySQL..."
npm run mysql:start

# 等待 MySQL 启动
echo "⏳ 等待 MySQL 启动（约 15 秒）..."
sleep 15

# 检查 MySQL 是否就绪
echo "🔍 检查 MySQL 状态..."
for i in {1..30}; do
    if docker exec yl-mysql-dev mysqladmin ping -h localhost -uroot -proot > /dev/null 2>&1; then
        echo "✅ MySQL 已就绪"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MySQL 启动超时，请检查日志: npm run mysql:logs"
        exit 1
    fi
    sleep 1
done

# 初始化数据库
echo "🗄️  初始化数据库..."
cd backend && npm run db:init && cd ..

echo ""
echo "✅ 启动完成！"
echo ""
echo "访问地址:"
echo "  - 前端: http://localhost:4000"
echo "  - 后端 API: http://localhost:3000/api"
echo "  - Swagger: http://localhost:3000/api"
echo ""
echo "运行以下命令检查服务状态:"
echo "  npm run health"


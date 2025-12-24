#!/bin/bash
# 重置开发环境脚本（Linux/Mac）

echo "🧹 正在清理开发环境..."

# 停止并删除容器
echo "停止并删除容器..."
docker-compose -f docker-compose.dev.yml down

# 删除数据卷
echo "删除数据卷..."
docker volume rm yl_mysql_data 2>/dev/null || echo "数据卷已删除或不存在"

# 删除镜像（可选）
read -p "是否删除镜像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "删除镜像..."
    docker rmi yl-backend yl-web 2>/dev/null || echo "镜像已删除或不存在"
fi

echo "✅ 清理完成！"
echo ""
echo "现在可以运行以下命令重新初始化："
echo "  1. npm run init          # 配置环境变量"
echo "  2. npm run dev:up        # 启动服务"
echo "  3. npm run backend:init-db  # 初始化数据库"


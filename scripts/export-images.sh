#!/bin/bash
# 镜像导出脚本
# 使用方法: ./scripts/export-images.sh

set -e

echo "=========================================="
echo "开始导出 Docker 镜像"
echo "=========================================="

# 检查镜像是否存在
if ! docker images | grep -q "yl-backend.*latest"; then
    echo "错误: yl-backend:latest 镜像不存在，请先运行 npm run build"
    exit 1
fi

if ! docker images | grep -q "yl-web.*latest"; then
    echo "错误: yl-web:latest 镜像不存在，请先运行 npm run build"
    exit 1
fi

# 导出镜像
echo "1. 导出后端镜像..."
docker save yl-backend:latest -o yl-backend.tar

echo "2. 导出前端镜像..."
docker save yl-web:latest -o yl-web.tar

# 显示文件信息
echo "3. 导出完成！文件信息："
ls -lh yl-*.tar

# 询问是否压缩
read -p "是否要压缩文件？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "4. 正在压缩..."
    if command -v gzip &> /dev/null; then
        gzip -k yl-backend.tar
        gzip -k yl-web.tar
        echo "压缩完成！"
        ls -lh yl-*.tar.gz
    else
        echo "警告: gzip 未安装，跳过压缩"
    fi
fi

echo "=========================================="
echo "镜像导出完成！"
echo "文件位置: $(pwd)"
echo "=========================================="
echo "上传到服务器后，使用以下命令加载："
echo "  docker load -i yl-backend.tar"
echo "  docker load -i yl-web.tar"


#!/bin/bash
# 从 backend/.env 读取环境变量并运行 docker-compose 命令
# 用法: ./scripts/load-env-and-run.sh <docker-compose命令>
# 例如: ./scripts/load-env-and-run.sh "docker-compose -f docker-compose.dev.yml up -d"

ENV_FILE="backend/.env"

if [ -f "$ENV_FILE" ]; then
    # 读取 .env 文件并导出环境变量
    # 跳过注释行和空行，处理引号
    set -a
    source <(grep -v '^#' "$ENV_FILE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed "s/^\([^=]*\)=\(.*\)$/\1='\2'/")
    set +a
else
    echo "Warning: $ENV_FILE not found" >&2
fi

# 执行命令
exec "$@"


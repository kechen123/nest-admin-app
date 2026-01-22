#!/bin/bash
# Nginx 自动配置脚本
# 使用方法: bash scripts/pm2/setup-nginx.sh

set -e

# 配置变量
APP_DIR="${APP_DIR:-/opt/app/yl}"
WEB_DIR="$APP_DIR/web"
NGINX_SITE="/etc/nginx/sites-available/yl"
NGINX_ENABLED="/etc/nginx/sites-enabled/yl"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "Nginx 自动配置"
echo "==========================================${NC}"

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 读取域名（可选）
echo -e "${YELLOW}请输入域名（直接回车使用 IP 访问）:${NC}"
read -r DOMAIN

if [ -z "$DOMAIN" ]; then
    SERVER_NAME="_"
    echo "将使用 IP 访问"
else
    SERVER_NAME="$DOMAIN www.$DOMAIN"
    echo "域名: $SERVER_NAME"
fi

# 创建 Nginx 配置
echo -e "${YELLOW}创建 Nginx 配置文件...${NC}"

cat > $NGINX_SITE << EOF
# 上游服务器配置
upstream backend {
    server localhost:3000;
    keepalive 64;
}

# HTTP 服务器配置
server {
    listen 80;
    server_name $SERVER_NAME;

    # 隐藏 Nginx 版本
    server_tokens off;

    # 日志配置
    access_log /var/log/nginx/yl-access.log;
    error_log /var/log/nginx/yl-error.log;

    # 前端静态文件
    location / {
        root $WEB_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传
    location /uploads {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 启用配置
if [ -d "/etc/nginx/sites-enabled" ]; then
    ln -sf $NGINX_SITE $NGINX_ENABLED
else
    # CentOS/RHEL 系统
    echo "include $NGINX_SITE;" >> /etc/nginx/nginx.conf
fi

# 测试配置
echo -e "${YELLOW}测试 Nginx 配置...${NC}"
if nginx -t; then
    echo -e "${GREEN}配置测试通过${NC}"
    systemctl reload nginx
    echo -e "${GREEN}Nginx 配置完成并已重新加载${NC}"
else
    echo -e "${RED}Nginx 配置测试失败，请检查配置${NC}"
    exit 1
fi

echo -e "${GREEN}=========================================="
echo "Nginx 配置完成！"
echo "==========================================${NC}"

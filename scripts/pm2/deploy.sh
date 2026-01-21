#!/bin/bash
# PM2 一键部署脚本
# 使用方法: bash scripts/pm2/deploy.sh
# 功能：拉取代码、安装依赖、构建、配置 PM2、启动服务

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
APP_DIR="${APP_DIR:-/opt/app/yl}"
BACKEND_DIR="$APP_DIR/backend"
WEB_DIR="$APP_DIR/web"
BRANCH="${BRANCH:-main}"

echo -e "${BLUE}=========================================="
echo "PM2 一键部署脚本"
echo "==========================================${NC}"

# 检查是否在项目目录或应用目录
if [ -f "package.json" ]; then
    # 在项目根目录
    PROJECT_ROOT=$(pwd)
    echo -e "${YELLOW}检测到项目根目录: $PROJECT_ROOT${NC}"
    
    # 如果应用目录不存在，创建并复制文件
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${YELLOW}创建应用目录: $APP_DIR${NC}"
        sudo mkdir -p $APP_DIR
        sudo chown -R $USER:$USER $APP_DIR
        echo -e "${YELLOW}复制项目文件到应用目录...${NC}"
        rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' \
            $PROJECT_ROOT/ $APP_DIR/
    fi
    cd $APP_DIR
elif [ -f "$APP_DIR/package.json" ]; then
    # 在应用目录
    cd $APP_DIR
    PROJECT_ROOT=$(dirname "$APP_DIR")
else
    echo -e "${RED}错误: 未找到项目文件，请先运行 setup-server.sh 或手动创建应用目录${NC}"
    exit 1
fi

# 1. 拉取最新代码
echo -e "${YELLOW}[1/6] 拉取最新代码...${NC}"
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "$BRANCH")
    echo "当前分支: $CURRENT_BRANCH"
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH
    git pull origin $BRANCH || git pull origin main || git pull origin master
    echo -e "${GREEN}代码拉取完成${NC}"
else
    echo -e "${YELLOW}警告: 不是 Git 仓库，跳过代码拉取${NC}"
fi

# 2. 检查环境变量
echo -e "${YELLOW}[2/6] 检查环境变量配置...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        echo -e "${YELLOW}创建环境变量文件...${NC}"
        cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env
        chmod 600 $BACKEND_DIR/.env
        echo -e "${RED}⚠️  请编辑 $BACKEND_DIR/.env 文件，配置数据库和 JWT_SECRET${NC}"
        echo "按 Enter 继续（将使用默认配置，不推荐）..."
        read
    else
        echo -e "${RED}错误: 未找到 .env.example 文件${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}环境变量文件已存在${NC}"
fi

# 3. 安装依赖
echo -e "${YELLOW}[3/6] 安装依赖...${NC}"
cd $BACKEND_DIR
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --production --frozen-lockfile
else
    pnpm install --production
fi

cd $WEB_DIR
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi
echo -e "${GREEN}依赖安装完成${NC}"

# 4. 构建项目
echo -e "${YELLOW}[4/6] 构建项目...${NC}"

# 构建后端
cd $BACKEND_DIR
echo "构建后端..."
pnpm run build
echo -e "${GREEN}后端构建完成${NC}"

# 构建前端
cd $WEB_DIR
echo "构建前端..."
pnpm run build
echo -e "${GREEN}前端构建完成${NC}"

# 5. 创建 PM2 配置文件
echo -e "${YELLOW}[5/6] 配置 PM2...${NC}"
cd $BACKEND_DIR

# 创建日志目录
mkdir -p logs

# 生成 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yl-backend',
    script: './dist/main.js',
    cwd: '$BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOF

chmod 644 ecosystem.config.js
echo -e "${GREEN}PM2 配置完成${NC}"

# 6. 启动/重启服务
echo -e "${YELLOW}[6/6] 启动服务...${NC}"

# 检查服务是否已运行
if pm2 list | grep -q "yl-backend"; then
    echo "服务已存在，执行零停机重启..."
    pm2 reload yl-backend
else
    echo "首次启动服务..."
    pm2 start ecosystem.config.js
    pm2 save
fi

# 等待服务启动
sleep 3

# 显示服务状态
echo ""
echo -e "${GREEN}=========================================="
echo "部署完成！"
echo "==========================================${NC}"
echo ""
pm2 status
echo ""
echo -e "${BLUE}常用命令：${NC}"
echo "  查看日志: pm2 logs yl-backend"
echo "  重启服务: pm2 restart yl-backend"
echo "  停止服务: pm2 stop yl-backend"
echo "  查看状态: pm2 status"
echo "  监控: pm2 monit"
echo ""

# 7. 配置 Nginx（可选）
echo -e "${YELLOW}是否配置 Nginx？(y/n)${NC}"
read -t 5 -n 1 nginx_choice || nginx_choice="n"
if [ "$nginx_choice" = "y" ] || [ "$nginx_choice" = "Y" ]; then
    echo "配置 Nginx..."
    bash $APP_DIR/scripts/pm2/setup-nginx.sh || echo "Nginx 配置脚本未找到，请手动配置"
fi

echo -e "${GREEN}部署流程全部完成！${NC}"

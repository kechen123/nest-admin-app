#!/bin/bash
# PM2 部署 - 服务器环境初始化脚本
# 使用方法: bash scripts/pm2/setup-server.sh
# 此脚本会自动安装 Node.js, pnpm, PM2, MySQL, Nginx 等必要环境

set -e

echo "=========================================="
echo "PM2 部署 - 服务器环境初始化"
echo "=========================================="

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "无法检测操作系统，请手动安装环境"
    exit 1
fi

echo "检测到操作系统: $OS $VER"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 1. 更新系统
echo -e "${YELLOW}[1/8] 更新系统包...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y curl wget git build-essential
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
    yum update -y
    yum install -y curl wget git gcc gcc-c++ make
fi

# 2. 安装 Node.js 20
echo -e "${YELLOW}[2/8] 安装 Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo "Node.js 版本过低，需要升级到 20+"
        if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
        fi
    else
        echo "Node.js 已安装: $(node -v)"
    fi
fi

# 3. 安装 pnpm
echo -e "${YELLOW}[3/8] 安装 pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
else
    echo "pnpm 已安装: $(pnpm -v)"
fi

# 4. 安装 PM2
echo -e "${YELLOW}[4/8] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
else
    echo "PM2 已安装: $(pm2 -v)"
fi

# 5. 安装 MySQL
echo -e "${YELLOW}[5/8] 安装 MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y mysql-server
        systemctl start mysql
        systemctl enable mysql
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
        yum install -y mysql-server
        systemctl start mysqld
        systemctl enable mysqld
    fi
    echo -e "${GREEN}MySQL 已安装，请运行 mysql_secure_installation 进行安全配置${NC}"
else
    echo "MySQL 已安装: $(mysql --version)"
fi

# 6. 安装 Nginx
echo -e "${YELLOW}[6/8] 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y nginx
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "rocky" ]; then
        yum install -y nginx
    fi
    systemctl start nginx
    systemctl enable nginx
else
    echo "Nginx 已安装: $(nginx -v 2>&1)"
fi

# 7. 配置防火墙
echo -e "${YELLOW}[7/8] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "UFW 防火墙规则已添加"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "Firewalld 防火墙规则已添加"
fi

# 8. 创建应用目录
echo -e "${YELLOW}[8/8] 创建应用目录...${NC}"
APP_DIR="/opt/app/yl"
mkdir -p $APP_DIR
if [ -n "$SUDO_USER" ]; then
    chown -R $SUDO_USER:$SUDO_USER $APP_DIR
fi

echo -e "${GREEN}=========================================="
echo "服务器环境初始化完成！"
echo "==========================================${NC}"
echo ""
echo "下一步："
echo "1. 运行: bash scripts/pm2/deploy.sh"
echo "2. 或手动配置环境变量后运行部署脚本"
echo ""

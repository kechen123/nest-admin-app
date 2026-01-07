# pnpm 打包部署指南

本文档详细介绍如何使用 pnpm 方式部署项目到生产环境，适用于不使用 Docker 的传统部署场景。

## 📋 目录

- [前置要求](#前置要求)
- [部署架构](#部署架构)
- [服务器准备](#服务器准备)
- [项目部署](#项目部署)
- [服务管理](#服务管理)
- [Nginx 配置](#nginx-配置)
- [数据库配置](#数据库配置)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [故障排查](#故障排查)

---

## 前置要求

### 1. 服务器环境要求

**操作系统：**
- Linux（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- Windows Server（需要额外配置）
- macOS（开发测试环境）

**硬件要求：**
- CPU: 2 核及以上
- 内存: 4GB 及以上（推荐 8GB）
- 磁盘: 20GB 及以上可用空间

### 2. 软件安装

#### 安装 Node.js

**使用 NodeSource 安装（推荐）：**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x 或更高
npm --version
```

**或使用 nvm（Node Version Manager）：**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node --version
```

#### 安装 pnpm

```bash
# 使用 npm 安装（推荐）
npm install -g pnpm

# 或使用独立安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
pnpm --version
```

#### 安装 MySQL

**Ubuntu/Debian：**
```bash
# 更新软件包索引
sudo apt-get update

# 安装 MySQL
sudo apt-get install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 运行安全配置脚本
sudo mysql_secure_installation
```

**CentOS/RHEL：**
```bash
# 安装 MySQL
sudo yum install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时 root 密码
sudo grep 'temporary password' /var/log/mysqld.log

# 运行安全配置
sudo mysql_secure_installation
```

**验证 MySQL 安装：**
```bash
mysql --version
sudo systemctl status mysql  # 或 mysqld
```

#### 安装 Nginx

**Ubuntu/Debian：**
```bash
sudo apt-get update
sudo apt-get install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**CentOS/RHEL：**
```bash
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**验证 Nginx 安装：**
```bash
nginx -v
sudo systemctl status nginx
```

#### 安装 PM2（进程管理工具，推荐）

```bash
# 使用 npm 全局安装
npm install -g pm2

# 验证安装
pm2 --version

# 设置 PM2 开机自启
pm2 startup
# 按照提示执行命令
pm2 save
```

### 3. 网络要求

确保服务器开放以下端口：
- **80** - HTTP 访问（必需）
- **443** - HTTPS 访问（推荐）
- **3000** - 后端 API（可选，如果使用 Nginx 反向代理则不需要对外开放）

**配置防火墙：**
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # 如果需要直接访问后端
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

## 部署架构

### 架构说明

```
┌─────────────────┐
│   用户浏览器     │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│   Nginx (80)    │  ← 反向代理服务器
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ 前端   │ │  后端    │
│ (静态) │ │ (3000)   │
└────────┘ └────┬─────┘
                │
                ▼
         ┌──────────┐
         │  MySQL   │
         │  (3306)  │
         └──────────┘
```

### 服务说明

- **Nginx**: 反向代理服务器，处理 HTTP 请求，转发到前端或后端
- **前端**: Vue 3 应用，构建后为静态文件，由 Nginx 直接服务
- **后端**: NestJS 应用，运行在 Node.js 上，监听 3000 端口
- **MySQL**: 数据库服务器，存储应用数据

---

## 服务器准备

### 1. 创建应用目录

```bash
# 创建应用目录
sudo mkdir -p /opt/app/yl
cd /opt/app/yl

# 设置目录权限（根据实际用户调整）
sudo chown -R $USER:$USER /opt/app/yl
```

### 2. 准备数据库

#### 创建数据库和用户

```bash
# 登录 MySQL
sudo mysql -u root -p

# 在 MySQL 中执行以下命令
CREATE DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_db_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**⚠️ 重要提示：**
- 将 `your_database_name`、`your_db_user`、`your_strong_password` 替换为实际值
- 密码建议包含大小写字母、数字和特殊字符，长度至少 16 位

---

## 项目部署

### 步骤 1：获取项目代码

#### 方法 A：从 Git 仓库克隆（推荐）

```bash
cd /opt/app
git clone <your-repo-url> yl
cd yl
```

#### 方法 B：上传项目文件

使用 SCP、SFTP 或云存储工具上传项目文件到 `/opt/app/yl`。

### 步骤 2：安装依赖

```bash
cd /opt/app/yl

# 安装根目录依赖（如果有）
pnpm install

# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../web
pnpm install
```

### 步骤 3：配置环境变量

#### 后端环境变量配置

```bash
cd /opt/app/yl/backend

# 复制示例文件
cp .env.example .env

# 编辑环境变量
vim .env  # 或使用 nano、vi 等编辑器
```

**后端环境变量配置示例（backend/.env）：**
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_strong_password
DB_DATABASE=your_database_name

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your_jwt_secret_key_here_change_this

# CORS 配置
CORS_ORIGIN=http://your-domain.com,http://www.your-domain.com

# 其他配置...
```

#### 前端环境变量配置

```bash
cd /opt/app/yl/web

# 创建环境变量文件
cat > .env.production << EOF
VITE_API_BASE_URL=http://your-domain.com/api
VITE_APP_TITLE=Your App Name
EOF
```

**前端环境变量说明：**
- `VITE_API_BASE_URL`: 后端 API 地址（使用域名，不要使用 localhost）
- `VITE_APP_TITLE`: 应用标题

### 步骤 4：构建项目

#### 构建后端

```bash
cd /opt/app/yl/backend

# 构建项目
pnpm run build

# 验证构建结果
ls -la dist/
# 应该看到 main.js 等文件
```

#### 构建前端

```bash
cd /opt/app/yl/web

# 构建项目
pnpm run build

# 验证构建结果
ls -la dist/
# 应该看到 index.html 和 assets/ 目录
```

### 步骤 5：初始化数据库

```bash
cd /opt/app/yl/backend

# 初始化数据库
pnpm run db:init
```

**如果初始化失败，可以手动执行 SQL：**
```bash
# 登录 MySQL
mysql -u your_db_user -p your_database_name

# 执行初始化 SQL
source database/init.sql

# 退出
EXIT;
```

### 步骤 6：创建必要的目录

```bash
# 创建上传文件目录
mkdir -p /opt/app/yl/backend/uploads
chmod 755 /opt/app/yl/backend/uploads

# 创建日志目录（如果需要）
mkdir -p /opt/app/yl/backend/logs
chmod 755 /opt/app/yl/backend/logs
```

---

## 服务管理

### 使用 PM2 管理后端服务（推荐）

#### 创建 PM2 配置文件

```bash
cd /opt/app/yl/backend

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yl-backend',
    script: './dist/main.js',
    cwd: '/opt/app/yl/backend',
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
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
```

#### 启动服务

```bash
cd /opt/app/yl/backend

# 启动服务
pm2 start ecosystem.config.js

# 查看服务状态
pm2 status

# 查看日志
pm2 logs yl-backend

# 设置开机自启
pm2 startup
pm2 save
```

#### PM2 常用命令

```bash
# 查看所有服务
pm2 list

# 查看服务详情
pm2 show yl-backend

# 重启服务
pm2 restart yl-backend

# 停止服务
pm2 stop yl-backend

# 删除服务
pm2 delete yl-backend

# 查看日志
pm2 logs yl-backend
pm2 logs yl-backend --lines 100  # 查看最近 100 行

# 监控服务
pm2 monit

# 重新加载（零停机重启）
pm2 reload yl-backend
```

### 使用 systemd 管理后端服务（可选）

#### 创建 systemd 服务文件

```bash
sudo vim /etc/systemd/system/yl-backend.service
```

**服务文件内容：**
```ini
[Unit]
Description=YL Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/opt/app/yl/backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

**启动服务：**
```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start yl-backend

# 设置开机自启
sudo systemctl enable yl-backend

# 查看状态
sudo systemctl status yl-backend

# 查看日志
sudo journalctl -u yl-backend -f
```

---

## Nginx 配置

### 创建 Nginx 配置文件

```bash
sudo vim /etc/nginx/sites-available/yl
```

**配置文件内容：**
```nginx
# 上游服务器配置
upstream backend {
    server localhost:3000;
    keepalive 64;
}

# HTTP 服务器配置
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # 替换为您的域名

    # 日志配置
    access_log /var/log/nginx/yl-access.log;
    error_log /var/log/nginx/yl-error.log;

    # 前端静态文件
    location / {
        root /opt/app/yl/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传
    location /uploads {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }

    # 健康检查（可选）
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 启用配置

```bash
# 创建符号链接（Ubuntu/Debian）
sudo ln -s /etc/nginx/sites-available/yl /etc/nginx/sites-enabled/

# CentOS/RHEL 直接编辑主配置文件
sudo vim /etc/nginx/nginx.conf
# 在 http 块中添加: include /etc/nginx/sites-available/yl;

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

### HTTPS 配置（推荐）

**使用 Let's Encrypt 免费证书：**

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu/Debian
sudo yum install -y certbot python3-certbot-nginx      # CentOS/RHEL

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 证书会自动续期，也可以手动测试
sudo certbot renew --dry-run
```

---

## 数据库配置

### 数据库优化配置

编辑 MySQL 配置文件：

```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf  # Ubuntu/Debian
sudo vim /etc/my.cnf                          # CentOS/RHEL
```

**推荐配置：**
```ini
[mysqld]
# 字符集配置
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 性能优化
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
max_connections=200
query_cache_size=64M
query_cache_type=1

# 日志配置
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow-query.log
long_query_time=2
```

**重启 MySQL：**
```bash
sudo systemctl restart mysql  # 或 mysqld
```

### 数据库备份

**创建备份脚本：**
```bash
sudo vim /opt/scripts/backup-db.sh
```

**脚本内容：**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="your_database_name"
DB_USER="your_db_user"
DB_PASS="your_db_password"

mkdir -p $BACKUP_DIR

mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**设置执行权限：**
```bash
sudo chmod +x /opt/scripts/backup-db.sh
```

**设置定时任务（每天凌晨 2 点备份）：**
```bash
sudo crontab -e

# 添加以下行
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
```

---

## 验证部署

### 1. 检查服务状态

```bash
# 检查后端服务
pm2 status
# 或
sudo systemctl status yl-backend

# 检查 Nginx
sudo systemctl status nginx

# 检查 MySQL
sudo systemctl status mysql  # 或 mysqld
```

### 2. 检查端口监听

```bash
# 检查后端端口
netstat -tlnp | grep :3000
# 或
ss -tlnp | grep :3000

# 检查 Nginx 端口
netstat -tlnp | grep :80
```

### 3. 测试后端 API

```bash
# 测试健康检查
curl http://localhost:3000/api

# 测试 API 响应
curl http://your-domain.com/api/health
```

### 4. 访问前端页面

在浏览器中访问：
- `http://your-domain.com`
- `http://your-server-ip`

### 5. 检查日志

```bash
# 后端日志（PM2）
pm2 logs yl-backend

# 后端日志（systemd）
sudo journalctl -u yl-backend -f

# Nginx 访问日志
sudo tail -f /var/log/nginx/yl-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/yl-error.log
```

---

## 常见问题

### Q1: 后端服务启动失败

**可能原因：**
- 端口被占用
- 环境变量配置错误
- 数据库连接失败
- 依赖未正确安装

**解决方法：**
```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查环境变量
cat /opt/app/yl/backend/.env

# 检查数据库连接
mysql -u your_db_user -p your_database_name

# 查看详细错误日志
pm2 logs yl-backend --lines 100
```

### Q2: 前端页面无法访问

**可能原因：**
- Nginx 配置错误
- 前端文件路径不正确
- 权限问题

**解决方法：**
```bash
# 检查 Nginx 配置
sudo nginx -t

# 检查文件路径和权限
ls -la /opt/app/yl/web/dist

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/yl-error.log
```

### Q3: API 请求失败

**可能原因：**
- 后端服务未启动
- Nginx 代理配置错误
- CORS 配置问题

**解决方法：**
```bash
# 检查后端服务
pm2 status

# 检查 Nginx 代理配置
cat /etc/nginx/sites-available/yl | grep -A 10 "/api"

# 检查 CORS 配置
cat /opt/app/yl/backend/.env | grep CORS
```

### Q4: 数据库连接失败

**可能原因：**
- MySQL 服务未启动
- 数据库用户权限不足
- 密码配置错误

**解决方法：**
```bash
# 检查 MySQL 服务
sudo systemctl status mysql

# 测试数据库连接
mysql -u your_db_user -p your_database_name

# 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'your_db_user'@'localhost';"
```

---

## 故障排查

### 查看服务日志

```bash
# PM2 日志
pm2 logs yl-backend --lines 200

# systemd 日志
sudo journalctl -u yl-backend -n 200 -f

# Nginx 日志
sudo tail -f /var/log/nginx/yl-error.log
sudo tail -f /var/log/nginx/yl-access.log
```

### 重启服务

```bash
# 重启后端（PM2）
pm2 restart yl-backend

# 重启后端（systemd）
sudo systemctl restart yl-backend

# 重启 Nginx
sudo systemctl restart nginx

# 重启 MySQL
sudo systemctl restart mysql
```

### 检查资源使用

```bash
# CPU 和内存使用
top
# 或
htop

# 磁盘使用
df -h

# 进程查看
ps aux | grep node
```

### 性能优化

**后端优化：**
- 使用 PM2 集群模式（多进程）
- 启用 Node.js 性能监控
- 配置适当的日志级别

**数据库优化：**
- 定期优化表
- 添加必要的索引
- 配置查询缓存

**Nginx 优化：**
- 启用 Gzip 压缩
- 配置静态资源缓存
- 调整 worker 进程数

---

## 📚 相关文档

- [部署方式对比](./index.md) - 了解不同部署方式的特点
- [Docker 部署指南](./docker.md) - Docker 容器化部署方式
- [自动部署指南](./automation.md) - 配置 CI/CD 自动部署


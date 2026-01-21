# Docker 部署指南

本文档详细介绍如何使用 Docker 方式部署项目到生产环境。即使您是 Docker 新手，按照本文档步骤操作也能成功部署。

## 📋 目录

- [新服务器初始化（从 0 开始）](#新服务器初始化从-0-开始)
  - [选择服务器系统（推荐）](#选择服务器系统推荐)
  - [Linux 通用初始化（必做）](#linux-通用初始化必做)
  - [Ubuntu/Debian：安装 Docker 与 Compose](#ubuntudebian安装-docker-与-compose)
  - [CentOS/Rocky：安装 Docker 与 Compose](#centosrocky安装-docker-与-compose)
  - [Windows Server：不推荐但可选](#windows-server不推荐但可选)
- [前置要求](#前置要求)
- [部署方式选择](#部署方式选择)
- [方式一：镜像打包部署](#方式一镜像打包部署)
- [方式二：Git + 服务器构建](#方式二git--服务器构建)
- [环境配置](#环境配置)
- [服务启动](#服务启动)
- [验证部署](#验证部署)
- [常见问题](#常见问题)
- [故障排查](#故障排查)

---

## 新服务器初始化（从 0 开始）

本章节**假设您拿到的是一台全新服务器**（除 SSH 以外几乎什么都没有）。完成后，服务器将具备：

- **解压/下载工具**（`tar`/`unzip`/`curl`）
- **Git**（用于方式二：服务器构建）
- **Docker + Docker Compose（v2 插件）**
- **防火墙放行 80/443（以及可选 22/3000）**

### 选择服务器系统（推荐）

- **推荐**：Ubuntu 22.04/24.04 LTS（文档步骤最简单、生态最全）
- **也可**：Debian 11/12、Rocky Linux 9、CentOS 7/8（旧系统建议升级）
- **不推荐**：Windows Server（生产容器生态与运维复杂度更高；如必须用，请看下文“Windows Server”）

### Linux 通用初始化（必做）

> 下面命令默认您已通过 SSH 登录服务器，并具备 `sudo` 权限（或使用 root 账户）。

#### 1) 更新系统与安装常用工具

**Ubuntu/Debian：**

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git unzip tar
```

**CentOS/Rocky：**

```bash
sudo yum makecache -y
sudo yum install -y ca-certificates curl gnupg2 git unzip tar yum-utils
```

#### 2) 设置时区（可选但推荐）

```bash
sudo timedatectl set-timezone Asia/Shanghai
timedatectl status
```

#### 3) 放行防火墙端口（必做）

需要对外开放：

- **80**：HTTP（必需）
- **443**：HTTPS（推荐）
- **22**：SSH（通常云厂商默认已放行）
- **3000**：后端 API（可选；若用 Nginx 反代通常不需对外开放）

**Ubuntu/Debian（UFW）：**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

**CentOS/Rocky（firewalld）：**

```bash
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

#### 4) 校验网络与 DNS（可选）

```bash
curl -I https://www.baidu.com || true
```

### Ubuntu/Debian：安装 Docker 与 Compose

> **国内服务器推荐（方案 A）**：先把 Ubuntu 的 apt 源切换为国内镜像（下载更稳定），再使用 Docker 官方仓库安装 Docker Engine，最后配置 Docker 镜像加速（拉镜像走国内）。

#### 0)（可选但推荐）切换 apt 源为国内镜像

Ubuntu 22.04/24.04 可能使用两种 apt 源配置方式：

- 传统：`/etc/apt/sources.list`
- 新版：`/etc/apt/sources.list.d/ubuntu.sources`

**如果存在 `sources.list`（传统方式）：**

```bash
# 以清华镜像为例：将 archive/security 替换为国内镜像
sudo sed -i 's|http://archive.ubuntu.com/ubuntu/|https://mirrors.tuna.tsinghua.edu.cn/ubuntu/|g; s|http://security.ubuntu.com/ubuntu/|https://mirrors.tuna.tsinghua.edu.cn/ubuntu/|g' /etc/apt/sources.list
```

**如果存在 `ubuntu.sources`（Ubuntu 24.04 常见）：**

```bash
# 以清华镜像为例：替换 ubuntu.sources 内的 URIs
sudo sed -i 's|http://archive.ubuntu.com/ubuntu|https://mirrors.tuna.tsinghua.edu.cn/ubuntu|g; s|http://security.ubuntu.com/ubuntu|https://mirrors.tuna.tsinghua.edu.cn/ubuntu|g' /etc/apt/sources.list.d/ubuntu.sources
```

更新索引并安装基础工具：

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
```

#### 1) 添加 Docker 官方仓库并安装 Docker Engine（含 Compose v2）

```bash
# 1) 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 2) 添加 Docker 官方仓库（使用系统 VERSION_CODENAME，比如 jammy/noble）
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${VERSION_CODENAME}) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3) 安装 Docker Engine + Compose v2
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4) 启动并设置开机自启
sudo systemctl enable --now docker

# 5) 验证
docker --version
docker compose version
```

#### 如果你在 Ubuntu 执行 `systemctl enable --now docker` 报错

报错：

- `Failed to enable unit: Unit file docker.service does not exist.`

通常意味着 **Docker Engine 没有成功安装**，或你当前环境 **不是 systemd**（例如容器内、WSL 默认环境）。

**先确认是不是 systemd：**

```bash
ps -p 1 -o comm=
```

- 如果输出不是 `systemd`，请不要用 `systemctl`（需要改用宿主机安装 Docker，或在 WSL 启用 systemd）。

**如果确实是 systemd（输出为 `systemd`），用下面命令快速定位：**

```bash
# 1) 看 docker-ce 是否装上
dpkg -l | grep -E 'docker-ce|docker-ce-cli|containerd|docker-compose-plugin|docker-buildx-plugin' || true

# 2) 看 systemd 里有没有 docker.service
systemctl list-unit-files | grep -E '^docker\.service' || true

# 3) 如果 docker.service 不存在，通常是安装步骤失败：重新 apt update 并安装
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4) 再启动
sudo systemctl enable --now docker
systemctl status docker --no-pager
```

### CentOS/Rocky：安装 Docker 与 Compose

```bash
# 1) 安装 yum-utils（提供 yum-config-manager）
sudo yum install -y yum-utils

# 2) 添加 Docker 官方仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 3) 安装 Docker Engine + Compose v2
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4) 启动并设置开机自启
sudo systemctl enable --now docker

# 5) 验证
docker --version
docker compose version
```

### Windows Server：不推荐但可选

Windows Server 的 Docker 安装与 Linux 差异很大（容器模式、内核、网络、镜像兼容性都不同），**生产环境强烈建议使用 Linux 服务器**。

如果您确实只能使用 Windows Server：

- **优先方案**：使用 Linux 虚拟机（Hyper-V/VMware）在 VM 内按本文 Linux 步骤部署
- **次选方案**：使用 Windows 容器与对应的 Docker Engine（需要严格匹配 Windows 版本与镜像生态；不建议新手直接走这条路）

---

## 前置要求

### 1. 服务器环境要求

**操作系统：**

- Linux（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- Windows Server（不推荐；如必须，请优先使用 Linux 虚拟机方案）
- macOS（开发测试环境）

**硬件要求：**

- CPU: 2 核及以上
- 内存: 4GB 及以上（推荐 8GB）
- 磁盘: 20GB 及以上可用空间

### 2. 软件安装

如果您是**新服务器（从 0 开始）**，请先完整执行：

- [新服务器初始化（从 0 开始）](#新服务器初始化从-0-开始)

如果您的服务器已经安装好了 Docker 与 Docker Compose（v2），请确保以下命令可用：

```bash
docker --version
docker compose version
```

#### 配置 Docker（可选）

**将当前用户添加到 docker 组（Linux）：**

```bash
# 避免每次使用 sudo
sudo usermod -aG docker $USER
# 重新登录后生效
```

**配置 Docker 镜像加速（国内服务器推荐）：**

```bash
# 创建或编辑 daemon.json
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://dockerproxy.com",
    "https://hub.rat.dev"
  ]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 3. 网络要求

确保服务器/安全组对外开放以下端口：

- **80**：HTTP 访问（必需）
- **443**：HTTPS 访问（推荐）
- **22**：SSH（通常云厂商默认已放行）
- **3000**：后端 API（可选；如果使用 Nginx 反向代理则通常不需要对外开放）

防火墙放行步骤请参考上面的：

- [Linux 通用初始化（必做）](#linux-通用初始化必做)

---

## 部署方式选择

项目提供两种 Docker 部署方式：

### 方式一：镜像打包部署

**适用场景：**

- ✅ 首次部署
- ✅ 离线环境部署
- ✅ 网络受限环境
- ✅ 需要快速迁移到新服务器

**流程：** 本地构建镜像 → 导出镜像文件 → 上传到服务器 → 加载镜像 → 启动服务

### 方式二：Git + 服务器构建

**适用场景：**

- ✅ 有 Git 仓库访问权限
- ✅ 服务器可以访问互联网
- ✅ 需要频繁更新部署
- ✅ 团队协作开发

**流程：** 服务器克隆代码 → 配置环境变量 → 构建镜像 → 启动服务

---

## 方式一：镜像打包部署

### 步骤 1：本地准备（Windows/Linux/Mac）

#### 1.1 克隆项目代码

```bash
git clone <your-repo-url>
cd yl
```

#### 1.2 配置环境变量

创建后端环境变量文件：

```bash
# Windows PowerShell
Copy-Item backend\.env.example backend\.env

# Linux/Mac
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件，配置以下关键参数：

```env
# 数据库配置（生产环境请修改）
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your_jwt_secret_key_here_change_this

# CORS 配置
CORS_ORIGIN=*

# 其他配置...
```

**⚠️ 重要提示：**

- `DB_PASSWORD` 和 `JWT_SECRET` 必须修改为强密码
- 密码建议包含大小写字母、数字和特殊字符，长度至少 16 位

#### 1.3 构建 Docker 镜像

```bash
# 构建所有生产镜像
npm run build

# 或者使用 docker-compose 直接构建
docker-compose -f docker-compose.prod.yml build
```

构建过程可能需要几分钟，请耐心等待。构建完成后，可以使用以下命令查看镜像：

```bash
docker images | grep yl
```

应该看到类似输出：

```
yl-backend   latest   xxxxx   5 minutes ago   500MB
yl-web       latest   xxxxx   5 minutes ago   200MB
```

#### 1.4 导出镜像文件

**Windows PowerShell：**

```powershell
# 使用项目提供的脚本（推荐）
npm run export:images:win

# 或手动导出
docker save yl-backend:latest -o yl-backend.tar
docker save yl-web:latest -o yl-web.tar
```

**Linux/Mac：**

```bash
# 使用项目提供的脚本（推荐）
npm run export:images

# 或手动导出
docker save yl-backend:latest -o yl-backend.tar
docker save yl-web:latest -o yl-web.tar
```

导出完成后，您会得到两个 `.tar` 文件：

- `yl-backend.tar` - 后端镜像（约 500MB-1GB）
- `yl-web.tar` - 前端镜像（约 200MB-500MB）

**压缩镜像文件（可选，节省传输时间）：**

```bash
# Windows PowerShell
Compress-Archive -Path yl-*.tar -DestinationPath docker-images.zip

# Linux/Mac
tar -czf docker-images.tar.gz yl-*.tar
```

### 步骤 2：上传到服务器

使用以下工具之一上传镜像文件到服务器：

**方法 1：使用 SCP（命令行）**

```bash
# Linux/Mac
scp yl-*.tar user@your-server:/opt/app/

# Windows PowerShell（需要安装 OpenSSH）
scp yl-*.tar user@your-server:/opt/app/
```

**方法 2：使用 SFTP 客户端**

- WinSCP（Windows）
- FileZilla（跨平台）
- Cyberduck（Mac）

**方法 3：使用云存储**

1. 上传到阿里云 OSS / 腾讯云 COS / AWS S3
2. 在服务器上下载

### 步骤 3：服务器部署（Linux）

#### 3.1 准备项目目录

```bash
# 创建项目目录
sudo mkdir -p /opt/app
cd /opt/app

# 如果使用压缩包，先解压
# unzip docker-images.zip
# 或
# tar -xzf docker-images.tar.gz
```

#### 3.2 加载 Docker 镜像

```bash
# 加载后端镜像
docker load -i yl-backend.tar

# 加载前端镜像
docker load -i yl-web.tar

# 验证镜像加载成功
docker images | grep yl
```

#### 3.3 准备项目文件

您需要准备以下文件：

**方法 A：从 Git 仓库克隆（推荐）**

```bash
cd /opt/app
git clone <your-repo-url> yl
cd yl
```

**方法 B：手动上传项目文件**
需要上传以下文件/目录：

- `docker-compose.prod.yml` - Docker Compose 配置文件
- `docker/nginx/nginx.conf` - Nginx 配置文件
- `backend/.env` - 后端环境变量（从本地复制并修改）
- `.env` - 根目录环境变量文件（新建）

#### 3.4 配置环境变量

**创建后端环境变量文件：**

```bash
cd /opt/app/yl
mkdir -p backend
vim backend/.env
```

将本地配置好的 `backend/.env` 内容复制过来，**并修改数据库密码等敏感信息**。

**创建根目录环境变量文件：**

```bash
cd /opt/app/yl
cat > .env << EOF
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret_key_here
EOF
```

**为什么需要两个 .env 文件？**

- `backend/.env` - 后端应用运行时读取的环境变量
- 根目录 `.env` - docker-compose 在解析配置文件时使用的变量（用于 `${DB_PASSWORD}` 等变量替换）

#### 3.5 修改 docker-compose.prod.yml

由于使用镜像部署，需要修改 `docker-compose.prod.yml`，将 `build` 改为 `image`：

```yaml
services:
  backend:
    image: yl-backend:latest  # 使用已加载的镜像
    # build:  # 注释掉 build 部分
    #   context: ./backend
    #   dockerfile: ../docker/backend/Dockerfile.prod
    container_name: yl-backend-prod
    # ... 其他配置保持不变

  web:
    image: yl-web:latest  # 使用已加载的镜像
    # build:  # 注释掉 build 部分
    #   context: .
    #   dockerfile: ./docker/web/Dockerfile.prod
    container_name: yl-web-prod
    # ... 其他配置保持不变
```

#### 3.6 创建必要的目录

```bash
# 创建上传文件目录
mkdir -p backend/uploads
chmod 755 backend/uploads
```

#### 3.7 启动服务

```bash
cd /opt/app/yl

# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

等待 30-60 秒，让 MySQL 完全启动。

#### 3.8 初始化数据库

```bash
# 等待 MySQL 健康检查通过
docker-compose -f docker-compose.prod.yml ps mysql

# 初始化数据库
docker-compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

#### 3.9 验证部署

```bash
# 查看所有服务状态
docker-compose -f docker-compose.prod.yml ps

# 应该看到所有服务状态为 "Up" 或 "healthy"
# - yl-mysql-prod: Up (healthy)
# - yl-backend-prod: Up
# - yl-web-prod: Up
# - yl-nginx-prod: Up

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

在浏览器访问：`http://your-server-ip`，应该能看到前端页面。

---

## 方式二：Git + 服务器构建

### 步骤 1：服务器准备

#### 1.1 克隆项目代码

```bash
# 创建项目目录
sudo mkdir -p /opt/app
cd /opt/app

# 克隆项目（替换为您的仓库地址）
git clone <your-repo-url> yl
cd yl

# 切换到生产分支（如果有）
git checkout main  # 或 master
```

#### 1.2 配置环境变量

**创建后端环境变量文件：**

```bash
cd /opt/app/yl
cp backend/.env.example backend/.env
vim backend/.env
```

配置内容参考 [方式一的环境变量配置](#13-配置环境变量)。

**创建根目录环境变量文件：**

```bash
cd /opt/app/yl
cat > .env << EOF
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret_key_here
EOF
```

#### 1.3 构建 Docker 镜像

```bash
cd /opt/app/yl

# 构建所有生产镜像
npm run build

# 或使用 docker-compose
docker-compose -f docker-compose.prod.yml build
```

构建过程可能需要 5-15 分钟，取决于服务器性能和网络速度。

#### 1.4 启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

#### 1.5 初始化数据库

```bash
# 等待 MySQL 完全启动（约 30 秒）
sleep 30

# 初始化数据库
docker-compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

#### 1.6 验证部署

参考 [方式一的验证步骤](#39-验证部署)。

### 步骤 2：后续更新部署

当代码更新后，可以使用以下方式更新部署：

**方法 1：使用部署脚本（推荐）**

```bash
cd /opt/app/yl

# 更新所有服务
npm run deploy

# 只更新后端
npm run deploy:backend

# 只更新前端
npm run deploy:web
```

**方法 2：手动更新**

```bash
cd /opt/app/yl

# 拉取最新代码
git pull origin main  # 或 master

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 环境配置

### 数据库配置

**MySQL 配置要求：**

- 版本：MySQL 8.0 或更高
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

**环境变量配置：**

```env
DB_HOST=mysql          # Docker 环境使用容器名
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

### 应用配置

**后端环境变量（backend/.env）：**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=*
```

### Nginx 配置

默认配置已包含在 `docker/nginx/nginx.conf` 中：

- 前端访问：`http://your-domain/`
- 后端 API：`http://your-domain/api`
- 文件上传：`http://your-domain/uploads`

如需修改，编辑 `docker/nginx/nginx.conf` 后重启 Nginx 容器。

---

## 服务启动

### 启动命令

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 常用管理命令

```bash
# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart backend

# 查看单个服务日志
docker-compose -f docker-compose.prod.yml logs -f backend

# 进入容器
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec mysql bash
```

---

## 验证部署

### 1. 检查服务状态

```bash
docker-compose -f docker-compose.prod.yml ps
```

所有服务应该显示为 `Up` 状态，MySQL 应该显示 `(healthy)`。

### 2. 检查端口监听

```bash
# 检查 80 端口（Nginx）
sudo netstat -tlnp | grep :80
# 或
sudo ss -tlnp | grep :80

# 检查容器端口
docker-compose -f docker-compose.prod.yml ps
```

### 3. 访问前端页面

在浏览器中访问：

- `http://your-server-ip`
- `http://your-domain`（如果配置了域名）

### 4. 测试后端 API

```bash
# 测试健康检查接口
curl http://your-server-ip/api

# 测试 API 响应
curl http://your-server-ip/api/health
```

### 5. 检查日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs --tail=100

# 查看后端日志
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 常见问题

### Q1: 镜像构建失败

**可能原因：**

- 网络连接问题
- Docker 镜像源访问慢
- 磁盘空间不足

**解决方法：**

```bash
# 检查磁盘空间
df -h

# 清理 Docker 缓存
docker system prune -a

# 配置镜像加速（参考前置要求章节）
```

### Q2: 服务启动失败

**可能原因：**

- 端口被占用
- 环境变量配置错误
- 镜像不存在

**解决方法：**

```bash
# 检查端口占用
sudo netstat -tlnp | grep :80

# 检查环境变量
cat backend/.env
cat .env

# 检查镜像
docker images | grep yl

# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs
```

### Q3: 数据库连接失败

**可能原因：**

- MySQL 容器未完全启动
- 数据库密码配置错误
- 网络配置问题

**解决方法：**

```bash
# 等待 MySQL 完全启动
docker-compose -f docker-compose.prod.yml ps mysql

# 检查数据库日志
docker-compose -f docker-compose.prod.yml logs mysql

# 测试数据库连接
docker-compose -f docker-compose.prod.yml exec mysql mysql -uroot -p
```

### Q4: 前端页面无法访问

**可能原因：**

- Nginx 容器未启动
- 防火墙未开放 80 端口
- Nginx 配置错误

**解决方法：**

```bash
# 检查 Nginx 容器状态
docker-compose -f docker-compose.prod.yml ps nginx

# 检查 Nginx 日志
docker-compose -f docker-compose.prod.yml logs nginx

# 检查防火墙
sudo ufw status
```

---

## 故障排查

### 查看服务状态

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志

```bash
# 所有服务日志
docker-compose -f docker-compose.prod.yml logs --tail=100

# 单个服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f mysql
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 重新构建

```bash
# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 强制重新构建（不使用缓存）
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### 进入容器调试

```bash
# 进入后端容器
docker-compose -f docker-compose.prod.yml exec backend sh

# 进入前端容器
docker-compose -f docker-compose.prod.yml exec web sh

# 进入数据库容器
docker-compose -f docker-compose.prod.yml exec mysql bash

# 在容器内执行命令
docker-compose -f docker-compose.prod.yml exec backend npm run db:init
```

### 常见错误及解决

**错误 1：`DB_PASSWORD variable is not set`**

- **原因**：缺少根目录 `.env` 文件
- **解决**：在项目根目录创建 `.env` 文件，包含 `DB_PASSWORD`、`DB_DATABASE`、`JWT_SECRET`

**错误 2：`MySQL container is unhealthy`**

- **原因**：MySQL 启动失败，通常是密码配置问题
- **解决**：检查根目录 `.env` 文件中的 `DB_PASSWORD` 是否正确

**错误 3：`Cannot find module`**

- **原因**：构建时依赖安装不完整
- **解决**：重新构建镜像 `npm run build` 或 `docker-compose -f docker-compose.prod.yml build --no-cache`

**错误 4：`Port 80 is already allocated`**

- **原因**：80 端口被占用
- **解决**：

  ```bash
  # 查找占用端口的进程
  sudo lsof -i :80
  # 或
  sudo netstat -tlnp | grep :80
  
  # 停止占用端口的服务或修改 docker-compose.prod.yml 中的端口映射
  ```

**错误 5：`Permission denied`**

- **原因**：文件权限问题
- **解决**：

  ```bash
  # 修复上传目录权限
  sudo chmod -R 755 backend/uploads
  
  # 如果使用非 root 用户，可能需要调整 Docker 权限
  sudo usermod -aG docker $USER
  ```

---

## 📚 相关文档

- [部署方式对比](../deployment/index.md) - 了解不同部署方式的特点
- [pnpm 打包部署](./pnpm.md) - 不使用 Docker 的部署方式
- [自动部署指南](./automation.md) - 配置 CI/CD 自动部署

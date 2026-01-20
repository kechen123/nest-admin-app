# 🚀 部署指南（小白版）

> **适用场景**：Windows 本地开发 → 阿里云 Ubuntu 24.04 服务器部署  
> **代码仓库**：阿里云云效 Codeup  
> **网络环境**：国内网络（已优化镜像源）

本文档专为前端开发人员编写，假设您对服务器运维不熟悉。所有步骤都会详细说明，跟着做就能成功部署！

---

## 📋 目录

- [前置准备](#前置准备)
- [服务器环境准备](#服务器环境准备)
- [方式一：镜像打包部署（推荐首次部署）](#方式一镜像打包部署推荐首次部署)
- [方式二：Git + 服务器构建（推荐后续更新）](#方式二git--服务器构建推荐后续更新)
- [后续更新部署（重要！）](#后续更新部署重要) ⭐
- [常见问题排查](#常见问题排查)
- [针对2核2G服务器的优化建议](#针对2核2g服务器的优化建议)

---

## 🎯 快速参考：后续更新命令

| 更新场景 | 方式一（镜像打包） | 方式二（Git构建） |
|---------|------------------|------------------|
| **只更新后端** | 本地构建后端镜像 → 上传 → 服务器加载 → 重启 | `npm run deploy:backend` |
| **只更新前端** | 本地构建前端镜像 → 上传 → 服务器加载 → 重启 | `npm run deploy:web` |
| **同时更新两端** | 本地构建所有镜像 → 上传 → 服务器加载 → 重启 | `npm run deploy` |

**详细步骤请查看：[后续更新部署章节](#后续更新部署重要)**

---

## 前置准备

### 1. 准备工具软件

在您的 Windows 电脑上安装以下工具：

#### 1.1 SSH 连接工具（二选一）

**选项 A：PuTTY（推荐新手）**

- 下载地址：<https://www.putty.org/>
- 安装后打开，输入服务器 IP 地址，点击"打开"即可连接

**选项 B：Windows 自带的 PowerShell（推荐）**

- Windows 10/11 自带，无需安装
- 打开 PowerShell，使用命令：`ssh root@你的服务器IP`

#### 1.2 文件传输工具（二选一）

**选项 A：WinSCP（推荐新手）**

- 下载地址：<https://winscp.net/>
- 图形界面，拖拽即可上传文件

**选项 B：FileZilla**

- 下载地址：<https://filezilla-project.org/>
- 也是图形界面，功能类似

#### 1.3 Git（如果还没安装）

- 下载地址：<https://git-scm.com/download/win>
- 安装时一路"下一步"即可

#### 1.4 Docker Desktop（本地构建镜像时需要）

- 下载地址：<https://www.docker.com/products/docker-desktop>
- 安装后需要重启电脑
- 打开 Docker Desktop，等待启动完成（右下角图标变绿）

### 2. 获取服务器信息

从阿里云控制台获取以下信息：

1. **服务器公网 IP 地址**
   - 登录阿里云控制台 → 云服务器 ECS → 实例列表
   - 找到您的服务器，查看"公网 IP"

2. **服务器登录密码或密钥**
   - 如果使用密码：在控制台重置实例密码
   - 如果使用密钥：下载 `.pem` 文件，保存好

3. **服务器用户名**
   - Ubuntu 系统默认用户名通常是 `root` 或 `ubuntu`

### 3. 测试连接服务器

打开 PowerShell（或 PuTTY），连接服务器：

```powershell
# 使用密码登录（会提示输入密码）
ssh root@你的服务器IP

# 或使用密钥登录（需要先配置密钥）
ssh -i 密钥文件路径.pem root@你的服务器IP
```

**连接成功后，您会看到类似这样的提示：**

```
Welcome to Ubuntu 24.04 LTS
root@your-server:~#
```

**如果连接失败，检查：**

- 服务器是否已启动
- 安全组是否开放 22 端口（SSH 端口）
- IP 地址是否正确
- 密码是否正确

---

## 服务器环境准备

### 步骤 1：更新系统（首次连接后必做）

```bash
# 更新软件包列表
apt update

# 升级已安装的软件包（可选，但推荐）
apt upgrade -y
```

### 步骤 2：安装 Docker（重要！）

#### 2.1 安装 Docker Engine

```bash
# 安装必要的工具
apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥（使用国内镜像加速）
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库（使用阿里云镜像）
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件包列表
apt update

# 安装 Docker
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker compose version
```

**应该看到类似输出：**

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

#### 2.2 配置 Docker 镜像加速（国内网络必须配置！）

```bash
# 创建 Docker 配置目录
mkdir -p /etc/docker

# 配置镜像加速器（使用阿里云镜像加速）
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker 服务使配置生效
systemctl daemon-reload
systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

#### 2.3 配置防火墙（开放必要端口）

```bash
# 检查防火墙状态
ufw status

# 如果防火墙未启用，可以跳过。如果已启用，开放以下端口：
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp  # HTTPS（如果后续配置SSL）

# 如果提示需要确认，输入 y
```

**注意**：阿里云服务器还需要在**安全组**中开放端口：

- 登录阿里云控制台 → 云服务器 ECS → 网络与安全 → 安全组
- 找到您的安全组，添加入站规则：
  - 端口：22，协议：TCP，授权对象：0.0.0.0/0（SSH）
  - 端口：80，协议：TCP，授权对象：0.0.0.0/0（HTTP）
  - 端口：443，协议：TCP，授权对象：0.0.0.0/0（HTTPS）

### 步骤 3：安装 Git（如果服务器没有）

```bash
# 检查是否已安装
git --version

# 如果未安装，执行：
apt install -y git

# 配置 Git（可选，但推荐）
git config --global user.name "您的名字"
git config --global user.email "您的邮箱"
```

### 步骤 4：安装 Node.js 和 pnpm（方式二需要）

如果使用**方式二：Git + 服务器构建**，需要安装 Node.js：

```bash
# 使用 NodeSource 安装 Node.js 20（推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装 pnpm（使用国内镜像）
npm install -g pnpm --registry=https://registry.npmmirror.com

# 配置 pnpm 使用国内镜像
pnpm config set registry https://registry.npmmirror.com

# 验证安装
pnpm --version
```

---

## 方式一：镜像打包部署（推荐首次部署）

这种方式适合首次部署，流程是：**本地构建镜像 → 导出文件 → 上传到服务器 → 加载镜像 → 启动服务**

### 本地操作（Windows）

#### 步骤 1：准备代码

```powershell
# 在 PowerShell 中，进入项目目录
cd d:\code\nest-admin-app

# 确保代码是最新的
git pull origin main  # 或 master，根据您的分支名
```

#### 步骤 2：配置环境变量

创建后端环境变量文件（如果还没有）：

```powershell
# 复制示例文件
Copy-Item backend\.env.example backend\.env

# 用记事本打开编辑
notepad backend\.env
```

**配置内容示例：**

```env
# 数据库配置（生产环境请修改）
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的强密码_至少16位
DB_DATABASE=your_database_name

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=你的JWT密钥_至少32位随机字符串

# CORS 配置
CORS_ORIGIN=*
```

**⚠️ 重要提示：**

- `DB_PASSWORD` 和 `JWT_SECRET` 必须修改为强密码
- 密码建议包含大小写字母、数字和特殊字符
- 保存好这些密码，后续服务器上需要用到

#### 步骤 3：构建 Docker 镜像

```powershell
# 确保 Docker Desktop 已启动（右下角图标是绿色的）

# 构建所有生产镜像（这可能需要 10-20 分钟，请耐心等待）
npm run build
```

**构建过程中会：**

- 下载基础镜像（Node.js、Nginx 等）
- 安装依赖包
- 编译代码
- 打包成镜像

**如果构建失败，常见原因：**

- Docker Desktop 未启动 → 打开 Docker Desktop
- 网络问题 → 检查网络连接，Docker 会自动使用镜像加速
- 磁盘空间不足 → 清理磁盘空间

#### 步骤 4：导出镜像文件

```powershell
# 使用项目提供的脚本（推荐）
npm run export:images:win

# 脚本会询问是否压缩，建议选择"是"以节省上传时间
```

**导出完成后，您会得到：**

- `yl-backend.tar` - 后端镜像文件（约 500MB-1GB）
- `yl-web.tar` - 前端镜像文件（约 200MB-500MB）
- `docker-images.zip` - 压缩包（如果选择了压缩）

#### 步骤 5：上传到服务器

**方法 A：使用 WinSCP（推荐新手）**

1. 打开 WinSCP
2. 新建会话：
   - 主机名：您的服务器 IP
   - 用户名：root（或 ubuntu）
   - 密码：您的服务器密码
   - 点击"登录"
3. 左侧是本地文件，右侧是服务器文件
4. 在服务器上创建目录：`/opt/app`
5. 将 `docker-images.zip`（或两个 `.tar` 文件）拖拽到服务器 `/opt/app` 目录

**方法 B：使用 PowerShell SCP**

```powershell
# 上传压缩包
scp docker-images.zip root@你的服务器IP:/opt/app/

# 或上传两个 tar 文件
scp yl-backend.tar yl-web.tar root@你的服务器IP:/opt/app/
```

### 服务器操作（Linux）

#### 步骤 1：准备项目目录

```bash
# SSH 连接到服务器后，执行：

# 创建项目目录
mkdir -p /opt/app
cd /opt/app

# 如果上传的是压缩包，先解压
unzip docker-images.zip
# 或
tar -xzf docker-images.tar.gz
```

#### 步骤 2：加载 Docker 镜像

```bash
cd /opt/app

# 加载后端镜像（需要几分钟）
docker load -i yl-backend.tar

# 加载前端镜像
docker load -i yl-web.tar

# 验证镜像加载成功
docker images | grep yl
```

**应该看到类似输出：**

```
yl-backend   latest   xxxxx   2 minutes ago   500MB
yl-web       latest   xxxxx   2 minutes ago   200MB
```

#### 步骤 3：准备项目文件

您需要从 Git 仓库克隆项目文件（只需要配置文件，不需要源代码）：

```bash
cd /opt/app

# 克隆项目（替换为您的云效仓库地址）
# 云效仓库地址格式：https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

cd nest-admin-app
```

**如果 Git 仓库需要认证：**

```bash
# 云效支持 HTTPS 和 SSH 两种方式

# 方式 A：HTTPS（推荐，需要输入用户名和密码/Token）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

# 方式 B：SSH（需要配置 SSH 密钥）
# 1. 在服务器生成 SSH 密钥
ssh-keygen -t rsa -C "your_email@example.com"
# 2. 查看公钥
cat ~/.ssh/id_rsa.pub
# 3. 复制公钥内容，添加到云效的 SSH 密钥设置中
# 4. 然后使用 SSH 地址克隆
git clone git@codeup.aliyun.com:你的组织名/你的项目名/你的仓库名.git nest-admin-app
```

#### 步骤 4：配置环境变量

**创建后端环境变量文件：**

```bash
cd /opt/app/nest-admin-app

# 创建 backend 目录（如果不存在）
mkdir -p backend

# 创建环境变量文件
nano backend/.env
# 或使用 vim
# vim backend/.env
```

**在编辑器中输入以下内容（使用您在本地配置的密码）：**

```env
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的强密码_至少16位
DB_DATABASE=your_database_name
NODE_ENV=production
PORT=3000
JWT_SECRET=你的JWT密钥_至少32位随机字符串
CORS_ORIGIN=*
```

**保存文件：**

- 如果使用 `nano`：按 `Ctrl + X`，然后按 `Y`，最后按 `Enter`
- 如果使用 `vim`：按 `Esc`，输入 `:wq`，按 `Enter`

**创建根目录环境变量文件：**

```bash
cd /opt/app/nest-admin-app

# 创建 .env 文件
cat > .env << EOF
DB_PASSWORD=你的强密码_至少16位
DB_DATABASE=your_database_name
JWT_SECRET=你的JWT密钥_至少32位随机字符串
EOF
```

**为什么需要两个 .env 文件？**

- `backend/.env` - 后端应用运行时读取的环境变量
- 根目录 `.env` - docker-compose 在解析配置文件时使用的变量（用于 `${DB_PASSWORD}` 等变量替换）

#### 步骤 5：修改 docker-compose.prod.yml

由于使用镜像部署，需要修改配置文件：

```bash
cd /opt/app/nest-admin-app

# 备份原文件
cp docker-compose.prod.yml docker-compose.prod.yml.bak

# 编辑文件
nano docker-compose.prod.yml
```

**找到 `backend` 和 `web` 服务，将 `build` 部分注释掉，改为使用 `image`：**

```yaml
backend:
  image: yl-backend:latest  # 添加这行
  # build:  # 注释掉这些行
  #   context: ./backend
  #   dockerfile: ../docker/backend/Dockerfile.prod
  container_name: yl-backend-prod
  # ... 其他配置保持不变

web:
  image: yl-web:latest  # 添加这行
  # build:  # 注释掉这些行
  #   context: .
  #   dockerfile: ./docker/web/Dockerfile.prod
  container_name: yl-web-prod
  # ... 其他配置保持不变
```

#### 步骤 6：创建必要的目录

```bash
cd /opt/app/nest-admin-app

# 创建上传文件目录
mkdir -p backend/uploads
chmod 755 backend/uploads
```

#### 步骤 7：启动服务

```bash
cd /opt/app/nest-admin-app

# 启动所有服务（-d 表示后台运行）
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

**等待 30-60 秒，让 MySQL 完全启动。**

**应该看到所有服务状态为 "Up"：**

```
NAME                STATUS
yl-mysql-prod       Up (healthy)
yl-backend-prod     Up
yl-web-prod         Up
yl-nginx-prod       Up
```

#### 步骤 8：初始化数据库

```bash
cd /opt/app/nest-admin-app

# 等待 MySQL 健康检查通过（约 30 秒）
sleep 30

# 初始化数据库
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

**如果初始化成功，会看到类似输出：**

```
数据库初始化完成！
```

#### 步骤 9：验证部署

```bash
# 查看所有服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志（按 Ctrl+C 退出）
docker compose -f docker-compose.prod.yml logs -f

# 测试后端 API
curl http://localhost/api

# 测试前端页面
curl http://localhost
```

**在浏览器访问：**

- `http://你的服务器IP` - 应该能看到前端页面

---

## 方式二：Git + 服务器构建（推荐后续更新）

这种方式适合后续更新，流程是：**服务器拉取代码 → 构建镜像 → 启动服务**

### 首次部署

#### 步骤 1：克隆项目代码

```bash
# SSH 连接到服务器

# 创建项目目录
mkdir -p /opt/app
cd /opt/app

# 克隆项目（替换为您的云效仓库地址）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

cd nest-admin-app

# 切换到主分支
git checkout main  # 或 master，根据您的分支名
```

**如果 Git 仓库需要认证，参考方式一的步骤 3。**

#### 步骤 2：配置环境变量

参考方式一的步骤 4，创建 `backend/.env` 和根目录 `.env` 文件。

#### 步骤 3：构建 Docker 镜像

```bash
cd /opt/app/nest-admin-app

# 构建所有生产镜像（这可能需要 15-30 分钟，取决于服务器性能）
docker compose -f docker-compose.prod.yml build

# 或使用 npm 脚本
npm run build
```

**构建过程会：**

- 下载基础镜像
- 安装依赖（已配置国内镜像源，速度较快）
- 编译代码
- 打包成镜像

**针对 2核2G 服务器的优化：**

- 构建过程较慢是正常的，请耐心等待
- 如果内存不足，可以只构建一个服务：`docker compose -f docker-compose.prod.yml build backend`

#### 步骤 4：启动服务

```bash
cd /opt/app/nest-admin-app

# 启动所有服务
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

#### 步骤 5：初始化数据库

参考方式一的步骤 8。

---

## 🔄 后续更新部署（重要！）

当代码更新后，您可能需要：

- **只更新后端**：修改了后端代码
- **只更新前端**：修改了前端代码
- **同时更新两端**：两端都有修改

下面详细介绍三种情况的更新方法。

### 方式一：镜像打包部署的更新方法

如果您使用的是**方式一：镜像打包部署**，更新时需要重新构建镜像并上传。

#### 场景 1：只更新后端

**本地操作（Windows）：**

```powershell
# 1. 进入项目目录
cd d:\code\nest-admin-app

# 2. 拉取最新代码
git pull origin main

# 3. 只构建后端镜像
docker compose -f docker-compose.prod.yml build backend

# 4. 导出后端镜像
docker save yl-backend:latest -o yl-backend.tar

# 5. 压缩（可选）
Compress-Archive -Path yl-backend.tar -DestinationPath yl-backend.zip
```

**使用 WinSCP 上传 `yl-backend.tar` 或 `yl-backend.zip` 到服务器**

**服务器操作（Linux）：**

```bash
cd /opt/app

# 1. 解压镜像文件（如果上传的是压缩包）
unzip yl-backend.zip
# 或直接使用 tar 文件

# 2. 加载新镜像
docker load -i yl-backend.tar

# 3. 重启后端服务
cd nest-admin-app
docker compose -f docker-compose.prod.yml up -d --no-deps backend

# 4. 查看后端日志
docker compose -f docker-compose.prod.yml logs -f backend
```

#### 场景 2：只更新前端

**本地操作（Windows）：**

```powershell
# 1. 进入项目目录
cd d:\code\nest-admin-app

# 2. 拉取最新代码
git pull origin main

# 3. 只构建前端镜像
docker compose -f docker-compose.prod.yml build web

# 4. 导出前端镜像
docker save yl-web:latest -o yl-web.tar

# 5. 压缩（可选）
Compress-Archive -Path yl-web.tar -DestinationPath yl-web.zip
```

**使用 WinSCP 上传 `yl-web.tar` 或 `yl-web.zip` 到服务器**

**服务器操作（Linux）：**

```bash
cd /opt/app

# 1. 解压镜像文件（如果上传的是压缩包）
unzip yl-web.zip

# 2. 加载新镜像
docker load -i yl-web.tar

# 3. 重启前端服务
cd nest-admin-app
docker compose -f docker-compose.prod.yml up -d --no-deps web

# 4. 查看前端日志
docker compose -f docker-compose.prod.yml logs -f web
```

#### 场景 3：同时更新后端和前端

**本地操作（Windows）：**

```powershell
# 1. 进入项目目录
cd d:\code\nest-admin-app

# 2. 拉取最新代码
git pull origin main

# 3. 构建所有镜像
npm run build

# 4. 导出所有镜像
npm run export:images:win
# 选择"是"压缩文件
```

**使用 WinSCP 上传 `docker-images.zip` 到服务器**

**服务器操作（Linux）：**

```bash
cd /opt/app

# 1. 解压镜像文件
unzip docker-images.zip

# 2. 加载所有镜像
docker load -i yl-backend.tar
docker load -i yl-web.tar

# 3. 重启所有服务
cd nest-admin-app
docker compose -f docker-compose.prod.yml up -d

# 4. 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

### 方式二：Git + 服务器构建的更新方法

如果您使用的是**方式二：Git + 服务器构建**，更新更加简单，直接在服务器上操作即可。

#### 场景 1：只更新后端

**服务器操作（Linux）：**

```bash
cd /opt/app/nest-admin-app

# 方法 A：使用部署脚本（推荐）
npm run deploy:backend

# 方法 B：手动操作
# 1. 拉取最新代码
git pull origin main

# 2. 只重新构建后端
docker compose -f docker-compose.prod.yml build backend

# 3. 重启后端服务（--no-deps 表示不重启依赖服务）
docker compose -f docker-compose.prod.yml up -d --no-deps backend

# 4. 查看后端日志
docker compose -f docker-compose.prod.yml logs -f backend
```

**说明：**

- `--no-deps` 参数表示只重启后端服务，不重启依赖的 MySQL 等服务
- 这样可以更快地完成更新，不影响数据库

#### 场景 2：只更新前端

**服务器操作（Linux）：**

```bash
cd /opt/app/nest-admin-app

# 方法 A：使用部署脚本（推荐）
npm run deploy:web

# 方法 B：手动操作
# 1. 拉取最新代码
git pull origin main

# 2. 只重新构建前端
docker compose -f docker-compose.prod.yml build web

# 3. 重启前端服务
docker compose -f docker-compose.prod.yml up -d --no-deps web

# 4. 查看前端日志
docker compose -f docker-compose.prod.yml logs -f web
```

#### 场景 3：同时更新后端和前端

**服务器操作（Linux）：**

```bash
cd /opt/app/nest-admin-app

# 方法 A：使用部署脚本（推荐）
npm run deploy

# 方法 B：手动操作
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建所有服务
docker compose -f docker-compose.prod.yml build

# 3. 重启所有服务
docker compose -f docker-compose.prod.yml up -d

# 4. 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 5. 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

### 📊 更新方式对比

| 更新场景 | 方式一（镜像打包） | 方式二（Git构建） |
|---------|------------------|------------------|
| **只更新后端** | 本地构建 → 上传 → 服务器加载 → 重启 | 服务器拉取代码 → 构建 → 重启 |
| **只更新前端** | 本地构建 → 上传 → 服务器加载 → 重启 | 服务器拉取代码 → 构建 → 重启 |
| **同时更新** | 本地构建 → 上传 → 服务器加载 → 重启 | 服务器拉取代码 → 构建 → 重启 |
| **优点** | 不占用服务器资源构建 | 操作简单，自动化程度高 |
| **缺点** | 需要上传大文件，步骤较多 | 占用服务器资源，构建时间较长 |

### 💡 更新建议

1. **开发阶段**：推荐使用**方式二**，更新快速方便
2. **生产环境**：
   - 如果服务器性能较好（4核8G以上），推荐**方式二**
   - 如果服务器性能一般（2核2G），推荐**方式一**，避免构建时占用过多资源
3. **紧急更新**：只更新单个服务时，使用 `--no-deps` 参数可以更快完成
4. **更新前备份**：重要更新前，建议先备份数据库和配置文件

### ⚠️ 更新注意事项

1. **更新后端时**：
   - 如果数据库结构有变化，可能需要执行数据库迁移
   - 检查环境变量是否有新增或修改
   - 更新后测试 API 接口是否正常

2. **更新前端时**：
   - 检查前端环境变量（`.env.production`）是否需要更新
   - 清除浏览器缓存，确保加载最新版本
   - 检查静态资源路径是否正确

3. **同时更新时**：
   - 建议先更新后端，再更新前端
   - 确保前后端接口兼容
   - 更新后进行全面测试

### 🔍 验证更新是否成功

```bash
# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看服务日志
docker compose -f docker-compose.prod.yml logs --tail=100

# 测试后端 API
curl http://localhost/api/health

# 测试前端页面
curl http://localhost
```

**在浏览器访问：**

- 前端：`http://你的服务器IP`
- 后端 API：`http://你的服务器IP/api`

如果页面正常显示，API 正常响应，说明更新成功！

---

## 常见问题排查

### 问题 1：无法连接服务器

**症状：** `ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection timed out`

**解决方法：**

1. 检查服务器是否已启动（阿里云控制台查看）
2. 检查安全组是否开放 22 端口
3. 检查服务器 IP 地址是否正确
4. 尝试 ping 服务器：`ping 你的服务器IP`

### 问题 2：Docker 镜像构建失败

**症状：** 构建过程中报错或超时

**解决方法：**

```bash
# 检查 Docker 镜像加速是否配置
docker info | grep -A 10 "Registry Mirrors"

# 清理 Docker 缓存
docker system prune -a

# 检查磁盘空间
df -h

# 如果磁盘空间不足，清理不需要的镜像
docker image prune -a
```

### 问题 3：服务启动失败

**症状：** `docker compose ps` 显示服务状态为 `Exit` 或 `Restarting`

**解决方法：**

```bash
# 查看详细错误日志
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs mysql

# 检查环境变量配置
cat backend/.env
cat .env

# 检查端口是否被占用
netstat -tlnp | grep :80
```

### 问题 4：数据库连接失败

**症状：** 后端日志显示 `ECONNREFUSED` 或 `Access denied`

**解决方法：**

```bash
# 等待 MySQL 完全启动
docker compose -f docker-compose.prod.yml ps mysql

# 检查 MySQL 日志
docker compose -f docker-compose.prod.yml logs mysql

# 测试数据库连接
docker compose -f docker-compose.prod.yml exec mysql mysql -uroot -p你的密码

# 检查环境变量中的密码是否正确
cat .env | grep DB_PASSWORD
```

### 问题 5：前端页面无法访问

**症状：** 浏览器访问 `http://你的服务器IP` 显示无法连接

**解决方法：**

```bash
# 检查 Nginx 容器状态
docker compose -f docker-compose.prod.yml ps nginx

# 检查 Nginx 日志
docker compose -f docker-compose.prod.yml logs nginx

# 检查防火墙
ufw status

# 检查安全组（阿里云控制台）
# 确保 80 端口已开放

# 在服务器上测试
curl http://localhost
```

### 问题 6：Git 克隆失败（云效）

**症状：** `fatal: Authentication failed` 或 `Permission denied`

**解决方法：**

1. **使用 HTTPS + 用户名密码：**

   ```bash
   # 云效支持用户名+密码或 Token
   # 如果使用 Token，在云效设置中生成个人访问令牌
   git clone https://你的用户名:你的Token@codeup.aliyun.com/组织名/项目名/仓库名.git
   ```

2. **使用 SSH 密钥：**

   ```bash
   # 生成 SSH 密钥
   ssh-keygen -t rsa -C "your_email@example.com"
   
   # 查看公钥
   cat ~/.ssh/id_rsa.pub
   
   # 复制公钥内容，添加到云效的 SSH 密钥设置中
   # 云效控制台 → 个人设置 → SSH 公钥 → 添加公钥
   
   # 然后使用 SSH 地址克隆
   git clone git@codeup.aliyun.com:组织名/项目名/仓库名.git
   ```

### 问题 7：docker-compose 命令未找到

**症状：** `docker-compose: command not found` 或 `Error: Command failed`

**原因：** Ubuntu 24.04 使用新版本的 Docker Compose，命令是 `docker compose`（无连字符），而不是 `docker-compose`（有连字符）

**解决方法：**

```bash
# 方法 1：使用新版本命令（推荐）
docker compose -f docker-compose.prod.yml up -d

# 方法 2：如果脚本报错，确保使用最新版本的部署脚本
# 脚本已自动检测并兼容新旧版本，如果还有问题，可以手动执行：

# 检查 Docker Compose 版本
docker compose version
# 或
docker-compose version

# 如果新版本可用，直接使用 docker compose
# 如果只有旧版本，需要安装新版本：
apt update
apt install -y docker-compose-plugin
```

**注意：** 部署脚本 `deploy.sh` 已自动检测并兼容新旧版本，如果遇到此错误，请确保使用最新版本的脚本。

### 问题 8：内存不足（2核2G 服务器）

**症状：** 构建或运行过程中服务器卡死或报错 `Out of memory`

**解决方法：**

1. **增加交换空间（Swap）：**

   ```bash
   # 创建 2GB 交换文件
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   
   # 永久启用（重启后仍然有效）
   echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
   ```

2. **分批构建：**

   ```bash
   # 先构建后端
   docker compose -f docker-compose.prod.yml build backend
   
   # 再构建前端
   docker compose -f docker-compose.prod.yml build web
   ```

3. **清理不需要的镜像和容器：**

   ```bash
   # 清理未使用的镜像
   docker image prune -a
   
   # 清理未使用的容器
   docker container prune
   
   # 清理所有未使用的资源
   docker system prune -a
   ```

---

## 针对2核2G服务器的优化建议

### 1. 系统优化

```bash
# 关闭不必要的服务
systemctl disable snapd  # 如果不需要 snap
systemctl disable unattended-upgrades  # 如果不需要自动更新

# 优化系统参数
cat >> /etc/sysctl.conf << EOF
# 优化网络性能
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
EOF

sysctl -p
```

### 2. Docker 优化

```bash
# 限制 Docker 日志大小
cat >> /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl daemon-reload
systemctl restart docker
```

### 3. MySQL 优化

在 `docker-compose.prod.yml` 中为 MySQL 添加内存限制：

```yaml
mysql:
  # ... 其他配置
  deploy:
    resources:
      limits:
        memory: 512M  # 限制 MySQL 最多使用 512MB 内存
      reservations:
        memory: 256M  # 预留 256MB 内存
```

### 4. 构建优化

- 使用多阶段构建（项目已配置）
- 构建时使用 `--no-cache` 避免缓存占用空间
- 构建完成后清理构建缓存：`docker builder prune`

### 5. 监控资源使用

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 Docker 资源使用
docker stats

# 查看系统负载
top
```

---

## 📚 常用命令速查

### 服务管理

```bash
# 启动所有服务
docker compose -f docker-compose.prod.yml up -d

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 重启所有服务
docker compose -f docker-compose.prod.yml restart

# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 查看单个服务日志
docker compose -f docker-compose.prod.yml logs -f backend
```

### 数据库操作

```bash
# 初始化数据库
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init

# 进入数据库
docker compose -f docker-compose.prod.yml exec mysql mysql -uroot -p

# 备份数据库
docker compose -f docker-compose.prod.yml exec mysql mysqldump -uroot -p数据库密码 数据库名 > backup.sql
```

### 容器操作

```bash
# 进入后端容器
docker compose -f docker-compose.prod.yml exec backend sh

# 进入前端容器
docker compose -f docker-compose.prod.yml exec web sh

# 进入数据库容器
docker compose -f docker-compose.prod.yml exec mysql bash
```

---

## 🎉 部署完成

恭喜您完成部署！现在可以：

1. 在浏览器访问：`http://你的服务器IP`
2. 测试前端页面是否正常显示
3. 测试后端 API 是否正常响应

如果遇到问题，请参考 [常见问题排查](#常见问题排查) 部分。

---

## 📞 需要帮助？

如果按照文档操作仍然遇到问题，请：

1. 查看服务日志：`docker compose -f docker-compose.prod.yml logs`
2. 检查服务状态：`docker compose -f docker-compose.prod.yml ps`
3. 查看本文档的 [常见问题排查](#常见问题排查) 部分
4. 记录错误信息，寻求技术支持

---

**最后更新：** 2024年  
**适用版本：** Ubuntu 24.04, Docker 24+, Node.js 20+

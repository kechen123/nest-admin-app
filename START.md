# 🚀 项目启动指南

> **适用对象**：刚从 Git 仓库克隆项目到本地的新手开发者  
> **前置条件**：本地已安装 Docker 和 Node.js（推荐 Node.js 18+）

本文档将从零开始，指导您如何启动和开发这个全栈项目。

---

## 📋 目录

1. [本地启动项目](#1-本地启动项目)
   - [方式一：Docker 启动（推荐）](#方式一docker-启动推荐)
   - [方式二：本地 npm/pnpm/yarn 启动](#方式二本地-npmpnpmyarn-启动)
2. [后端开发文档](#2-后端开发文档)
3. [Web 端开发文档](#3-web-端开发文档)
4. [文档系统](#4-文档系统)
5. [部署指南](#5-部署指南)
   - [方式一：本地打包上传部署](#方式一本地打包上传部署)
   - [方式二：服务器自动部署](#方式二服务器自动部署)

---

## 1. 本地启动项目

项目支持两种启动方式，您可以根据自己的需求选择：

- **Docker 启动**：推荐方式，一键启动所有服务，环境隔离，适合快速开始
- **本地启动**：适合需要深度调试的场景，可以独立运行各个服务

### 方式一：Docker 启动（推荐）

#### 前置要求

- ✅ **Docker Desktop**（Windows/Mac）或 **Docker Engine**（Linux）
- ✅ **Node.js** 18+（用于运行 npm 脚本）
- ✅ **Git**（用于克隆代码）

#### 步骤 1：克隆项目

```bash
# 在您的工作目录下执行
git clone <你的仓库地址> nest-admin-app
cd nest-admin-app
```

**如果使用云效（阿里云 Codeup）：**

```bash
# HTTPS 方式（会提示输入用户名和密码/Token）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

# 或 SSH 方式（需要先配置 SSH 密钥）
git clone git@codeup.aliyun.com:你的组织名/你的项目名/你的仓库名.git nest-admin-app
```

#### 步骤 2：配置环境变量

```bash
# Windows PowerShell
Copy-Item backend\.env.example backend\.env
notepad backend\.env

# Linux/Mac
cp backend/.env.example backend/.env
nano backend/.env  # 或使用 vim
```

**基本配置示例（开发环境）：**

```env
# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456  # 开发环境可以用简单密码
DB_DATABASE=test_db

# 应用配置
NODE_ENV=development
PORT=3000

# JWT 密钥（开发环境可以用简单密钥）
JWT_SECRET=dev_secret_key_change_in_production

# CORS 配置
CORS_ORIGIN=*
```

**⚠️ 重要提示：**

- 生产环境必须修改 `DB_PASSWORD` 和 `JWT_SECRET` 为强密码
- 密码建议包含大小写字母、数字和特殊字符

#### 步骤 3：启动 Docker Desktop

**Windows/Mac：**

- 打开 Docker Desktop 应用
- 等待右下角图标变绿（表示启动成功）
- 首次启动可能需要几分钟

**Linux：**

```bash
# 检查 Docker 是否运行
sudo systemctl status docker

# 如果未运行，启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 步骤 4：启动所有服务

```bash
# 在项目根目录执行
npm run dev:up
```

**首次启动会：**

- 下载基础镜像（MySQL、Node.js、Nginx 等）- 约 5-10 分钟
- 构建项目镜像 - 约 5-10 分钟
- 启动所有服务 - 约 1-2 分钟

**总耗时约 10-20 分钟，请耐心等待。**

#### 步骤 5：初始化数据库

```bash
# 等待 MySQL 完全启动（约 30 秒）
# Windows PowerShell
Start-Sleep -Seconds 30

# Linux/Mac
sleep 30

# 初始化数据库
npm run backend:init-db
```

#### 步骤 6：验证服务

```bash
# 查看服务状态
npm run ps

# 应该看到所有服务状态为 "Up"
```

**访问地址：**

- 🌐 **前端应用**：<http://localhost:4000>
- 🔌 **后端 API**：<http://localhost:3000/api>
- 📚 **Swagger 文档**：<http://localhost:3000/api>

**默认登录信息：**

- 用户名：`admin`
- 密码：`admin123`

⚠️ **请在生产环境中修改默认密码！**

#### Docker 常用命令

```bash
# 启动所有服务（后台运行）
npm run dev:up

# 启动所有服务（前台运行，查看日志）
npm run dev

# 停止所有服务
npm run dev:down

# 重启所有服务
npm run dev:restart

# 查看日志
npm run dev:logs

# 查看服务状态
npm run ps

# 健康检查
npm run health
```

**单个服务操作：**

```bash
# 后端服务
npm run backend:start    # 启动
npm run backend:stop      # 停止
npm run backend:restart   # 重启
npm run backend:logs      # 查看日志
npm run backend:shell     # 进入容器

# 前端服务
npm run web:start         # 启动
npm run web:stop          # 停止
npm run web:logs          # 查看日志

# 数据库服务
npm run mysql:start       # 启动
npm run mysql:stop        # 停止
npm run mysql:shell       # 进入数据库
```

---

### 方式二：本地 npm/pnpm/yarn 启动

如果您不想使用 Docker，可以在本地直接运行各个服务。

#### 前置要求

- ✅ **Node.js** 18+
- ✅ **MySQL** 5.7+ 或 8.0+
- ✅ **npm**、**pnpm** 或 **yarn**（推荐使用 pnpm）

#### 步骤 1：克隆项目

参考 [方式一：Docker 启动 - 步骤 1](#步骤-1克隆项目)

#### 步骤 2：安装包管理器（如果使用 pnpm）

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 或使用 Homebrew (Mac)
brew install pnpm

# 或使用 PowerShell (Windows)
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

#### 步骤 3：安装依赖

**安装后端依赖：**

```bash
cd backend
pnpm install  # 或 npm install / yarn install
```

**安装前端依赖：**

```bash
cd ../web
pnpm install  # 或 npm install / yarn install
```

**安装根目录依赖（如果有）：**

```bash
cd ..
pnpm install  # 或 npm install / yarn install
```

#### 步骤 4：配置环境变量

**后端环境变量：**

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件
```

**配置示例（本地模式）：**

```env
# 数据库配置（使用本地 MySQL）
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的MySQL密码
DB_DATABASE=test_db

# 应用配置
NODE_ENV=development
PORT=3000

# JWT 密钥
JWT_SECRET=dev_secret_key_change_in_production

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

**前端环境变量：**

```bash
cd ../web
# 创建 .env.development 文件
```

**配置示例：**

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3000/api

# 应用标题
VITE_APP_TITLE=管理后台
```

#### 步骤 5：启动 MySQL

**Windows：**

```bash
# 在服务管理器中启动 MySQL 服务
# 或使用命令行
net start MySQL
```

**Linux：**

```bash
sudo systemctl start mysql
# 或
sudo service mysql start
```

**Mac：**

```bash
brew services start mysql
```

**创建数据库：**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 步骤 6：初始化数据库

```bash
cd backend
pnpm run db:init  # 或 npm run db:init
```

#### 步骤 7：启动服务

**启动后端服务：**

```bash
cd backend
pnpm run start:dev  # 或 npm run start:dev
```

后端服务将在 <http://localhost:3000> 启动

**启动前端服务（新开一个终端）：**

```bash
cd web
pnpm run dev  # 或 npm run dev
```

前端服务将在 <http://localhost:5173> 启动（Vite 默认端口）

#### 本地开发常用命令

**后端开发：**

```bash
cd backend
pnpm run start:dev    # 开发模式（热重载）
pnpm run build         # 构建生产版本
pnpm run start:prod    # 生产模式
pnpm run lint          # 代码检查
pnpm run test          # 运行测试
```

**前端开发：**

```bash
cd web
pnpm run dev           # 开发模式
pnpm run build         # 构建生产版本
pnpm run preview       # 预览构建结果
pnpm run lint          # 代码检查
```

---

## 2. 后端开发文档

### 📚 文档导航

- [后端快速开始](./docs/backend/getting-started.md) - 后端开发入门指南
- [项目结构](./docs/backend/structure.md) - 代码组织结构
- [API 开发](./docs/backend/api.md) - API 接口开发规范
- [数据库设计](./docs/backend/database.md) - 数据库表结构设计
- [项目配置](./docs/backend/configuration.md) - 环境变量和配置说明
- [开发指南](./docs/backend/development.md) - 开发规范和最佳实践

### 🛠️ 技术栈

- **框架**：NestJS（Node.js）
- **语言**：TypeScript
- **数据库**：MySQL
- **ORM**：TypeORM
- **认证**：JWT
- **API 文档**：Swagger

### 🚀 快速开始

**使用 Docker（推荐）：**

```bash
# 启动后端服务
npm run backend:start

# 查看日志
npm run backend:logs

# 进入容器调试
npm run backend:shell
```

**本地开发：**

```bash
cd backend
pnpm run start:dev
```

### 📖 核心功能

- ✅ 用户认证和授权（JWT）
- ✅ 角色权限管理
- ✅ RESTful API
- ✅ 数据验证（DTO）
- ✅ 异常处理
- ✅ 操作日志
- ✅ 文件上传

### 🔗 相关链接

- [后端完整文档](./docs/backend/)
- [Swagger API 文档](http://localhost:3000/api)（启动服务后访问）

---

## 3. Web 端开发文档

### 📚 文档导航

- [前端快速开始](./docs/frontend/getting-started.md) - 前端开发入门指南
- [文件目录](./docs/frontend/structure.md) - 项目目录结构
- [组件使用](./docs/frontend/components.md) - 常用组件说明
- [表格页面开发](./docs/frontend/table-development.md) - 表格页面开发指南
- [项目配置](./docs/frontend/configuration.md) - 环境变量和配置说明
- [开发指南](./docs/frontend/development.md) - 开发规范和最佳实践

### 🛠️ 技术栈

- **框架**：Vue 3
- **语言**：TypeScript
- **UI 组件库**：Element Plus
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由**：Vue Router
- **HTTP 客户端**：Axios

### 🚀 快速开始

**使用 Docker（推荐）：**

```bash
# 启动前端服务
npm run web:start

# 查看日志
npm run web:logs
```

**本地开发：**

```bash
cd web
pnpm run dev
```

### 📖 核心功能

- ✅ 响应式布局
- ✅ 路由管理
- ✅ 状态管理
- ✅ 权限控制
- ✅ 表格组件
- ✅ 表单组件
- ✅ 图表展示

### 🔗 相关链接

- [前端完整文档](./docs/frontend/)

---

## 4. 文档系统

项目使用 VitePress 构建文档系统，支持 Markdown 编写和实时预览。

### 🚀 启动文档开发服务器

```bash
# 自动运行（推荐）
npm run docs:dev

# 手动运行
cd docs
npx vitepress dev
```

文档将在 <http://localhost:5173> 启动

### 📦 构建文档

```bash
# 自动构建（推荐）
npm run docs:build

# 手动构建
cd docs
npx vitepress build
```

### 👀 预览构建结果

```bash
# 自动预览（推荐）
npm run docs:preview

# 手动预览
cd docs
npx vitepress preview
```

### 📁 文档结构

```
docs/
├── guide/              # 总体介绍
│   ├── introduction.md    # 项目介绍
│   └── getting-started.md # 快速开始
├── frontend/           # 前端文档
│   ├── getting-started.md
│   ├── structure.md
│   ├── components.md
│   └── ...
├── backend/            # 后端文档
│   ├── getting-started.md
│   ├── structure.md
│   ├── api.md
│   └── ...
└── deployment/         # 部署文档
    ├── docker.md
    └── ...
```

### 🔗 相关链接

- [文档首页](./docs/index.md)
- [VitePress 官方文档](https://vitepress.dev/)

---

## 5. 部署指南

> **适用场景**：将项目部署到 Linux 服务器（CentOS/Ubuntu）  
> **推荐方式**：Docker 部署  
> **服务器要求**：Linux 系统，已安装 Docker 和 Docker Compose

本文档假设您对服务器操作不熟悉，所有步骤都会详细说明。

### 📋 部署方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **本地打包上传** | 不占用服务器资源构建，构建速度快 | 需要上传大文件，步骤较多 | 首次部署、服务器性能较差 |
| **服务器自动部署** | 操作简单，自动化程度高 | 占用服务器资源，构建时间较长 | 后续更新、服务器性能较好 |

### 方式一：本地打包上传部署

这种方式适合首次部署，流程是：**本地构建镜像 → 导出文件 → 上传到服务器 → 加载镜像 → 启动服务**

#### 前置准备

**本地（Windows/Mac）：**

- ✅ Docker Desktop 已安装并启动
- ✅ 已安装 Git
- ✅ 已安装文件传输工具（WinSCP、FileZilla 或使用 SCP）

**服务器（Linux）：**

- ✅ 已安装 Docker 和 Docker Compose
- ✅ 已安装 Git（用于克隆配置文件）
- ✅ 已配置 SSH 访问

#### 步骤 1：本地构建镜像

```bash
# 在项目根目录执行
cd d:\code\nest-admin-app  # Windows
# 或
cd ~/code/nest-admin-app    # Linux/Mac

# 确保代码是最新的
git pull origin main  # 或 master，根据您的分支名

# 配置环境变量（如果还没有）
Copy-Item backend\.env.example backend\.env
# 编辑 backend/.env，配置生产环境参数

# 构建所有生产镜像（需要 10-20 分钟）
npm run build
```

#### 步骤 2：导出镜像文件

**Windows：**

```powershell
# 使用项目提供的脚本（推荐）
npm run export:images:win

# 脚本会询问是否压缩，建议选择"是"以节省上传时间
```

**Linux/Mac：**

```bash
npm run export:images
```

**导出完成后，您会得到：**

- `yl-backend.tar` - 后端镜像文件（约 500MB-1GB）
- `yl-web.tar` - 前端镜像文件（约 200MB-500MB）
- `docker-images.zip` - 压缩包（如果选择了压缩）

#### 步骤 3：上传到服务器

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

**方法 B：使用 SCP 命令**

```bash
# Windows PowerShell
scp docker-images.zip root@你的服务器IP:/opt/app/

# Linux/Mac
scp docker-images.zip root@你的服务器IP:/opt/app/
```

#### 步骤 4：服务器环境准备

**SSH 连接到服务器：**

```bash
ssh root@你的服务器IP
```

**安装 Docker（如果还没安装）：**

**Ubuntu/Debian：**

```bash
# 更新软件包列表
apt update

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

**CentOS：**

```bash
# 安装必要的工具
yum install -y yum-utils

# 添加 Docker 仓库（使用阿里云镜像）
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 Docker
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker compose version
```

**配置 Docker 镜像加速（国内网络必须配置！）：**

```bash
# 创建 Docker 配置目录
mkdir -p /etc/docker

# 配置镜像加速器
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

#### 步骤 5：加载镜像并启动服务

```bash
# 进入项目目录
cd /opt/app

# 解压镜像文件（如果上传的是压缩包）
unzip docker-images.zip
# 或
tar -xzf docker-images.tar.gz

# 加载后端镜像（需要几分钟）
docker load -i yl-backend.tar

# 加载前端镜像
docker load -i yl-web.tar

# 验证镜像加载成功
docker images | grep yl
```

**克隆项目代码（只需要配置文件）：**

```bash
cd /opt/app

# 克隆项目（替换为您的仓库地址）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

cd nest-admin-app
```

**配置环境变量：**

```bash
# 创建 backend 目录（如果不存在）
mkdir -p backend

# 创建环境变量文件
nano backend/.env
# 或使用 vim
# vim backend/.env
```

**在编辑器中输入以下内容：**

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

cat > .env << EOF
DB_PASSWORD=你的强密码_至少16位
DB_DATABASE=your_database_name
JWT_SECRET=你的JWT密钥_至少32位随机字符串
EOF
```

**修改 docker-compose.prod.yml（使用镜像而不是构建）：**

```bash
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

**启动服务：**

```bash
cd /opt/app/nest-admin-app

# 启动所有服务（-d 表示后台运行）
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

**等待 30-60 秒，让 MySQL 完全启动。**

**初始化数据库：**

```bash
cd /opt/app/nest-admin-app

# 等待 MySQL 健康检查通过（约 30 秒）
sleep 30

# 初始化数据库
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

**验证部署：**

```bash
# 查看所有服务状态
docker compose -f docker-compose.prod.yml ps

# 应该看到所有服务状态为 "Up"
# 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

**在浏览器访问：**

- `http://你的服务器IP` - 应该能看到前端页面

---

### 方式二：服务器自动部署

这种方式适合后续更新，流程是：**服务器拉取代码 → 构建镜像 → 启动服务**

#### 前置准备

**服务器（Linux）：**

- ✅ 已安装 Docker 和 Docker Compose
- ✅ 已安装 Node.js 和 pnpm（用于运行脚本）
- ✅ 已配置 Git 访问（HTTPS 或 SSH）

#### 步骤 1：安装 Node.js 和 pnpm

**Ubuntu/Debian：**

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

**CentOS：**

```bash
# 使用 NodeSource 安装 Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

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

#### 步骤 2：克隆项目代码

```bash
# 创建项目目录
mkdir -p /opt/app
cd /opt/app

# 克隆项目（替换为您的仓库地址）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

cd nest-admin-app

# 切换到主分支
git checkout main  # 或 master，根据您的分支名
```

**如果 Git 仓库需要认证：**

**方式 A：HTTPS + Token（推荐）**

1. 在云效控制台生成个人访问令牌
2. 使用 Token 作为密码：

```bash
git clone https://你的用户名:你的Token@codeup.aliyun.com/组织名/项目名/仓库名.git nest-admin-app
```

**方式 B：SSH 密钥**

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 复制公钥内容，添加到云效的 SSH 密钥设置中
# 云效控制台 → 个人设置 → SSH 公钥 → 添加公钥

# 然后使用 SSH 地址克隆
git clone git@codeup.aliyun.com:组织名/项目名/仓库名.git nest-admin-app
```

#### 步骤 3：配置环境变量

参考 [方式一：本地打包上传部署 - 步骤 5](#步骤-5加载镜像并启动服务) 中的环境变量配置部分。

#### 步骤 4：构建并启动服务

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

**启动服务：**

```bash
cd /opt/app/nest-admin-app

# 启动所有服务
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

**初始化数据库：**

```bash
cd /opt/app/nest-admin-app

# 等待 MySQL 完全启动（约 30 秒）
sleep 30

# 初始化数据库
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

#### 步骤 5：配置自动部署（可选）

**使用云效流水线（推荐国内用户）：**

1. 登录云效控制台
2. 创建流水线
3. 配置构建步骤：
   - 拉取代码
   - 构建 Docker 镜像
   - 部署到服务器
4. 配置触发条件（如：代码推送到 main 分支）

**使用 GitHub Actions（如果使用 GitHub）：**

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/app/nest-admin-app
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
```

#### 后续更新部署

**只更新后端：**

```bash
cd /opt/app/nest-admin-app

# 使用部署脚本（推荐）
npm run deploy:backend

# 或手动操作
git pull origin main
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d --no-deps backend
```

**只更新前端：**

```bash
cd /opt/app/nest-admin-app

# 使用部署脚本（推荐）
npm run deploy:web

# 或手动操作
git pull origin main
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d --no-deps web
```

**同时更新后端和前端：**

```bash
cd /opt/app/nest-admin-app

# 使用部署脚本（推荐）
npm run deploy

# 或手动操作
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

**说明：**

- `--no-deps` 参数表示只重启指定服务，不重启依赖服务（如 MySQL），更新更快
- 使用部署脚本会自动拉取代码、构建、重启，更方便

---

## 📚 相关文档

- [命令使用指南](./COMMANDS.md) - 所有可用命令说明
- [Docker 使用指南](./DOCKER.md) - Docker 开发详细说明
- [完整部署文档](./DEPLOYMENT.md) - 部署详细说明和问题排查
- [快速部署指南](./QUICK_DEPLOY.md) - 简化版部署流程

---

## ❓ 常见问题

### Docker 相关问题

**Q: Docker Desktop 启动失败？**

A: 检查系统要求，确保已启用虚拟化（VT-x/AMD-V）。Windows 需要启用 WSL 2。

**Q: 镜像下载很慢？**

A: 配置 Docker 镜像加速器（参考文档中的配置步骤）。

**Q: 端口被占用？**

A: 修改 `docker-compose.dev.yml` 中的端口映射，或停止占用端口的服务。

### 本地开发问题

**Q: 依赖安装失败？**

A: 检查网络连接，或使用国内镜像源（如淘宝镜像）。

**Q: MySQL 连接失败？**

A: 检查 MySQL 服务是否启动，环境变量配置是否正确。

### 部署问题

**Q: 服务启动失败？**

A: 查看服务日志：`docker compose -f docker-compose.prod.yml logs`，检查环境变量配置。

**Q: 数据库连接失败？**

A: 等待 MySQL 完全启动（约 30 秒），检查环境变量中的密码是否正确。

**Q: Git 克隆失败？**

A: 检查 Git 认证配置，使用 HTTPS + Token 或配置 SSH 密钥。

---

## 🎉 完成

恭喜您完成项目启动！现在可以开始开发了。

如果遇到问题，请查看相关文档或寻求技术支持。

---

**最后更新：** 2024年  
**适用版本：** Node.js 18+, Docker 20.10+, MySQL 5.7+

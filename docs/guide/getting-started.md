# 快速开始

本指南将帮助您快速启动 yl 项目。项目支持两种运行方式，您可以根据需求选择。

## 项目概述

yl 是一个现代化的全栈开发解决方案，采用前后端分离架构，提供完整的开发、部署和管理工具链。

### 项目架构

项目采用微服务架构，主要包含以下模块：

- **后端服务** (`backend/`) - 基于 NestJS 框架构建的 RESTful API 服务
  - 提供完整的业务逻辑处理
  - 支持用户认证、权限管理、数据管理等核心功能
  - 采用模块化设计，便于扩展和维护

- **前端应用** (`web/`) - 基于 Vue3 + Element Plus 构建的管理后台
  - 响应式设计，支持多端访问
  - 丰富的 UI 组件和交互体验
  - 采用组合式 API 和 TypeScript，提升开发效率

- **移动端应用** (`uniapp-mobile/`) - 基于 UniApp 框架构建的跨平台移动应用
  - 支持 iOS、Android、小程序等多端发布
  - 与后端 API 无缝集成

### 技术栈

#### 后端技术栈

- **框架**: NestJS (Node.js)
- **数据库**: MySQL
- **ORM**: TypeORM
- **认证**: JWT
- **API 文档**: Swagger

#### 前端技术栈

- **框架**: Vue 3
- **UI 组件库**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios

#### 移动端技术栈

- **框架**: UniApp
- **UI 组件**: uni-ui

#### 基础设施

- **容器化**: Docker & Docker Compose
- **Web 服务器**: Nginx
- **版本控制**: Git
- **包管理**: pnpm

### 项目特点

- 🐳 **容器化部署**：使用 Docker Compose 统一管理所有服务，一键启动
- 🚀 **快速开发**：内置热重载和开发工具，提升开发效率
- 📦 **模块化设计**：前后端采用模块化架构，便于维护和扩展
- 🔧 **自动化脚本**：提供丰富的 npm scripts，简化开发流程
- 📊 **健康检查**：内置健康检查工具，实时监控服务状态
- 🔐 **权限管理**：完善的用户、角色、权限管理体系
- 📱 **多端支持**：支持 Web 和移动端多平台部署

### 项目结构

```text
yl/
├── backend/          # NestJS 后端服务
├── web/             # Vue3 前端应用
├── uniapp-mobile/   # UniApp 移动端应用
├── docker/           # Docker 配置文件
├── scripts/          # 自动化脚本
├── docs/             # 项目文档
├── docker-compose.dev.yml   # 开发环境配置
└── docker-compose.prod.yml  # 生产环境配置
```

### 运行方式

项目支持两种运行方式：

- **Docker 运行** - 推荐方式，使用 Docker Compose 一键启动所有服务，适合快速启动和部署
- **pnpm 本地运行** - 适合需要本地开发调试的场景，可以独立运行各个服务

---

## Docker 运行

使用 Docker Compose 一键启动所有服务，这是推荐的运行方式，适合快速启动和部署。

### 前置要求

- **Docker** (版本 20.10 或更高)
- **Docker Compose** (版本 2.0 或更高)
- **Node.js** (版本 16 或更高，用于运行脚本)
- **npm** 或 **yarn**

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd yl
```

#### 2. 配置环境变量

复制环境变量配置文件：

```bash
cp .env.example .env
```

根据您的需求编辑 `.env` 文件，配置数据库连接、端口等参数。

#### 3. 启动开发环境

使用以下命令启动所有服务：

```bash
npm run dev:up
```

这将启动：

- 前端开发服务器
- 后端 API 服务器
- MySQL 数据库

#### 4. 验证安装

运行健康检查：

```bash
npm run health
```

查看服务状态：

```bash
npm run ps
```

### Docker 常用命令

#### 开发环境管理

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
```

#### 服务管理

```bash
# 启动后端服务
npm run backend:start

# 启动前端服务
npm run web:start

# 启动数据库
npm run mysql:start

# 查看特定服务日志
npm run backend:logs
npm run web:logs
npm run mysql:logs
```

#### 数据库初始化

```bash
# 初始化数据库
npm run backend:init-db

# 修复数据库外部访问权限
npm run mysql:fix-access
```

### 访问服务

启动成功后，您可以通过以下地址访问：

- **前端应用**：`http://localhost:3000`
- **后端 API**：`http://localhost:8000`
- **数据库**：`localhost:3306`

---

## pnpm 本地运行

如果您需要在本地独立运行各个服务（不使用 Docker），可以按照以下步骤操作。使用 pnpm 可以享受更快的安装速度和更好的依赖管理。

### 前置要求

- **Node.js** (版本 16 或更高)
- **pnpm** (版本 7 或更高)
- **MySQL** (版本 5.7+ 或 8.0+)
- 其他服务依赖（根据实际技术栈）

### 安装 pnpm

如果尚未安装 pnpm，可以使用以下方式安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 Homebrew (Mac)
brew install pnpm

# 或使用 PowerShell (Windows)
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd yl
```

#### 2. 配置环境变量

复制并配置环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置：

- 数据库连接信息（使用本地 MySQL）
- 各服务端口
- API 密钥等配置

#### 3. 安装依赖

##### 前端依赖

```bash
cd web  # 或 frontend，根据实际目录名
pnpm install
```

##### 后端依赖

```bash
cd backend
pnpm install
```

#### 4. 启动数据库

确保 MySQL 服务已启动：

```bash
# Windows
net start MySQL

# Linux/Mac
sudo systemctl start mysql
# 或
brew services start mysql
```

创建数据库：

```bash
mysql -u root -p
CREATE DATABASE yl_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 5. 初始化数据库

```bash
cd backend
pnpm run db:migrate  # 或相应的迁移命令
pnpm run db:seed     # 初始化种子数据（可选）
```

#### 6. 启动服务

##### 启动后端服务

```bash
cd backend
pnpm run dev  # 或 pnpm start
```

后端服务将在 http://localhost:8000 启动

##### 启动前端服务

打开新的终端窗口：

```bash
cd web  # 或 frontend
pnpm run dev  # 或 pnpm start
```

前端服务将在 http://localhost:3000 启动

### pnpm 常用命令

#### 前端开发

```bash
cd web
pnpm run dev      # 开发模式
pnpm run build    # 构建生产版本
pnpm run lint     # 代码检查
pnpm run test     # 运行测试
```

#### 后端开发

```bash
cd backend
pnpm run dev      # 开发模式（热重载）
pnpm start        # 生产模式
pnpm run lint     # 代码检查
pnpm run test     # 运行测试
pnpm run db:migrate  # 数据库迁移
```

### 访问服务

启动成功后，您可以通过以下地址访问：

- **前端应用**：http://localhost:3000
- **后端 API**：http://localhost:8000
- **数据库**：localhost:3306

---

## 下一步

- 查看 [前端文档](../frontend/) 了解前端开发指南
- 查看 [后端文档](../backend/) 了解后端开发指南
- 阅读 [项目介绍](./introduction.md) 了解更多项目信息

## 遇到问题？

### Docker 运行问题

如果遇到问题，请检查：

1. Docker 服务是否正常运行
2. 端口是否被占用
3. 环境变量配置是否正确
4. 查看服务日志：`npm run dev:logs`

### pnpm 本地运行问题

如果遇到问题，请检查：

1. Node.js 版本是否符合要求
2. pnpm 是否正确安装
3. 依赖是否完整安装（尝试删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装）
4. MySQL 服务是否正常运行
5. 环境变量配置是否正确
6. 端口是否被占用
7. 查看各服务的控制台日志

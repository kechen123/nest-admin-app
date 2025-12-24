# 全栈项目

本项目包含三个子项目，支持 **Docker 运行** 和 **本地运行** 两种方式。

- **backend**: NestJS 后端服务
- **web**: Vue 3 + Element Plus 后台管理前端
- **uniapp-mobile**: UniApp 跨端移动应用

## 🚀 快速开始

> 📖 **详细初始化指南**：请查看 [SETUP.md](./SETUP.md) 获取完整的从零开始初始化步骤。

### 方式一：Docker 运行（推荐）

#### 1. 启动开发环境

**注意**：环境变量文件已内置在项目中，如需修改配置，请编辑 `backend/.env` 和 `web/.env.development`。

**重要提示**：
- Docker 运行时，`DB_HOST` 会自动设置为 `mysql`（容器名）
- 本地运行时，`DB_HOST` 应设置为 `localhost`
- 前端使用 Vite 标准环境变量：
  - 开发环境：`web/.env.development`
  - 生产环境：`web/.env.production`

```bash
# 启动所有服务（后台运行）
npm run dev:up

# 等待 MySQL 启动后（约 20-30 秒），初始化数据库（首次运行）
npm run backend:init-db

# 查看服务状态
npm run ps
```

#### 2. 访问应用

- **前端应用**: http://localhost:4000
- **后端 API**: http://localhost:3000/api
- **Swagger 文档**: http://localhost:3000/api

#### 3. 默认登录信息

- **用户名**: `admin`
- **密码**: `admin123`

⚠️ **请在生产环境中修改默认密码！**

#### 4. 数据库初始化说明

数据库初始化脚本支持两种运行模式：

- **Docker 模式**：在容器内运行，自动检测 Docker 环境，使用服务名 `mysql` 连接
- **本地模式**：在本地运行，使用 `docker exec` 执行 MySQL 命令，所有配置从 `backend/.env` 读取

详细说明请查看 [backend/database/README.md](./backend/database/README.md)

### 方式二：本地运行（独立运行模式）

**适用场景**：后端在本地运行，MySQL 在 Docker 容器中

#### 1. 后端本地运行

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量（确保 backend/.env 文件存在）
# 编辑 backend/.env，设置：
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_DATABASE=myapp_db

# 启动 MySQL 容器（从项目根目录运行）
npm run mysql:start

# 等待 MySQL 启动完成（约 10-20 秒）

# 初始化数据库（首次运行，在 backend 目录）
npm run db:init

# 启动开发服务器
npm run start:dev
```

**重要提示**：
- 所有配置从 `backend/.env` 文件读取
- 确保 `DB_PASSWORD` 与 MySQL 容器启动时使用的密码一致
- 如果密码不匹配，脚本会提供详细的解决方案

#### 2. 前端本地运行

```bash
cd web

# 安装依赖
npm install

# 配置环境变量（开发环境）
cp .env.development.example .env.development

# 启动开发服务器
npm run dev
```

## 📝 常用命令

### Docker 运行命令

```bash
# 开发环境
npm run dev:up          # 启动所有服务
npm run dev:down        # 停止所有服务
npm run dev:logs        # 查看日志

# 数据库管理
npm run backend:init-db    # 初始化数据库
npm run mysql:fix-access   # 手动修复 MySQL 外部连接权限（通常不需要，初始化时已自动配置）

# 健康检查和验证
npm run health             # 检查所有服务健康状态
npm run verify             # 检查服务状态并显示容器信息

# 快速启动
npm run quick-start        # 一键启动 MySQL 并初始化数据库（本地模式）

# 单独控制服务
npm run backend:start      # 启动后端
npm run backend:stop       # 停止后端
npm run backend:restart    # 重启后端
npm run backend:logs       # 查看后端日志
npm run web:start          # 启动前端
npm run web:stop           # 停止前端
npm run web:restart        # 重启前端
npm run web:logs           # 查看前端日志
npm run mysql:start        # 启动 MySQL
npm run mysql:stop         # 停止 MySQL
npm run mysql:logs         # 查看 MySQL 日志

# 生产环境
npm run build           # 构建镜像
npm run prod:up         # 启动生产环境
```

### 本地运行命令

```bash
# 后端
cd backend
npm run start:dev       # 启动开发服务器
npm run build           # 构建生产版本
npm run start:prod      # 启动生产服务器

# 前端
cd web
npm run dev             # 启动开发服务器
npm run build           # 构建生产版本
```

## 📚 项目结构

```
yl/
├── backend/                 # NestJS 后端服务
│   ├── .env.example        # 后端环境变量模板
│   ├── .env                # 后端环境变量（需创建）
│   └── ...
├── web/                     # Vue3 + Element Plus 前端
│   ├── .env.example        # 前端环境变量模板
│   ├── .env                # 前端环境变量（可选）
│   └── ...
├── uniapp-mobile/          # UniApp 移动端项目
├── docker/                  # Docker 配置文件
├── docker-compose.dev.yml  # 开发环境编排
├── docker-compose.prod.yml # 生产环境编排
└── package.json            # 统一命令管理
```

## 🔧 环境配置

### 后端配置（`backend/.env`）

```env
# 数据库配置
DB_HOST=localhost          # Docker: mysql, 本地: localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=myapp_db

# 应用配置
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:4000
```

### 前端配置

**开发环境**（`web/.env.development`）：
```env
VITE_APP_BASE_API=/api
```

**生产环境**（`web/.env.production`）：
```env
VITE_APP_BASE_API=/api
```

## 📖 详细文档

- [Docker 部署指南](./DOCKER.md) - Docker 详细使用说明
- [后端开发文档](./backend/README.md) - 后端 API 文档
- [前端开发文档](./web/README.md) - 前端开发指南

## 🛠️ 技术栈

### 后端
- NestJS
- TypeScript
- MySQL
- TypeORM
- JWT
- Swagger

### 前端
- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router

### 移动端
- UniApp
- Vue 3
- TypeScript

## 📝 开发说明

详细开发文档请查看各子项目的 README 文件。

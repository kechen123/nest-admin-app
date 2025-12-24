# Docker 部署指南

## 📋 目录结构

```
yl/
├── package.json               # npm scripts（统一命令管理）
├── .env.example               # 环境变量模板
├── .env                       # 实际环境变量（需自行创建）
├── docker-compose.dev.yml     # 开发环境编排
├── docker-compose.prod.yml    # 生产环境编排
├── docker/
│   ├── backend/
│   │   ├── Dockerfile.dev     # 后端开发环境
│   │   └── Dockerfile.prod    # 后端生产环境
│   ├── web/
│   │   ├── Dockerfile.dev     # 前端开发环境
│   │   ├── Dockerfile.prod     # 前端生产环境
│   │   └── nginx.conf          # 前端 Nginx 配置
│   └── nginx/
│       └── nginx.conf          # 主 Nginx 配置（生产环境）
├── backend/
│   └── .dockerignore          # 后端构建忽略文件
└── web/
    └── .dockerignore          # 前端构建忽略文件
```

## 🚀 快速开始

### 方式一：Docker 运行（推荐）

#### 1. 配置环境变量

```bash
# 自动创建环境变量文件（从模板复制）
npm run init

# 编辑配置文件（根据实际情况修改）
# Windows: notepad backend/.env
# Linux/Mac: vim backend/.env
```

**重要提示**：
- Docker 运行时，`DB_HOST` 会自动设置为 `mysql`（容器名）
- 本地运行时，`DB_HOST` 应设置为 `localhost`
- 前端使用 Vite 标准环境变量：
  - 开发环境：`web/.env.development`（Docker 和本地开发都使用）
  - 生产环境：`web/.env.production`（打包时使用）

**重要提示**：
- Docker 运行时，`DB_HOST` 会自动设置为 `mysql`（容器名）
- 本地运行时，`DB_HOST` 应设置为 `localhost`
- 其他配置保持一致即可

#### 2. 启动开发环境

```bash
# 启动所有服务（后台运行）
npm run dev:up

# 等待 MySQL 启动后，初始化数据库（首次运行）
npm run backend:init-db

# 查看服务状态
npm run ps
```

#### 3. 访问应用

- **后端 API**: http://localhost:3000/api
- **前端应用**: http://localhost:4000
- **Swagger 文档**: http://localhost:3000/api

### 方式二：本地运行（不使用 Docker）

#### 1. 后端本地运行

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DB_HOST=localhost

# 启动 MySQL（使用 Docker 或本地 MySQL）
# 如果使用 Docker 中的 MySQL：
npm run mysql:start  # 从项目根目录运行

# 初始化数据库（首次运行）
npm run db:init

# 启动开发服务器
npm run start:dev
```

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

#### 3. 访问应用

- **后端 API**: http://localhost:3000/api
- **前端应用**: http://localhost:4000

## 📝 常用命令

### 开发环境

```bash
# 启动/停止/重启所有服务
npm run dev:up          # 启动（后台）
npm run dev:down        # 停止
npm run dev:restart     # 重启
npm run dev:logs        # 查看日志

# 单独控制后端服务
npm run backend:start    # 启动后端
npm run backend:stop     # 停止后端
npm run backend:restart  # 重启后端
npm run backend:logs    # 查看后端日志
npm run backend:shell   # 进入后端容器

# 单独控制前端服务
npm run web:start       # 启动前端
npm run web:stop        # 停止前端
npm run web:restart     # 重启前端
npm run web:logs        # 查看前端日志
npm run web:shell       # 进入前端容器

# 数据库操作
npm run mysql:start     # 启动数据库
npm run mysql:stop      # 停止数据库
npm run mysql:logs      # 查看数据库日志
npm run mysql:shell     # 进入数据库
```

### 生产环境

```bash
# 构建生产镜像
npm run build

# 启动/停止生产环境
npm run prod:up         # 启动（后台）
npm run prod:down       # 停止
npm run prod:restart    # 重启
npm run prod:logs       # 查看日志
```

### 工具命令

```bash
npm run ps              # 查看所有容器状态
npm run clean           # 清理未使用的资源
npm run rebuild         # 重新构建开发镜像
npm run help            # 显示帮助信息
```

## 🔧 开发环境特性

### 热重载支持

开发环境配置了热重载，修改代码后会自动重载，无需手动重启容器：

- **后端**: 使用 NestJS watch 模式，修改 `backend/src` 下的文件会自动重载
- **前端**: 使用 Vite HMR，修改 `web/src` 下的文件会自动刷新

### Volume 挂载

开发环境使用 volume 挂载源代码，实现代码实时同步：

- `./backend/src` → `/app/src` (只读)
- `./web` → `/app` (读写)
- `node_modules` 和 `dist` 使用匿名卷，避免覆盖

## 🏗️ 生产环境构建

### 多阶段构建

生产环境使用多阶段构建，优化镜像体积：

1. **构建阶段**: 安装依赖并构建应用
2. **运行阶段**: 只复制构建产物和运行时依赖

### 构建命令

```bash
# 构建所有服务
npm run build

# 或单独构建
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build web
```

## 📦 部署到服务器

### 1. 准备服务器

```bash
# 安装 Docker 和 Docker Compose
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# 或使用 Docker Desktop
```

### 2. 上传项目

```bash
# 使用 scp 或 git 上传项目到服务器
scp -r . user@server:/opt/app
# 或
git clone your-repo /opt/app
```

### 3. 配置环境变量

```bash
cd /opt/app
cp .env.example .env
# 编辑 .env 文件，配置生产环境参数
vim .env
```

### 4. 构建和启动

```bash
# 构建镜像
npm run build

# 启动服务
npm run prod:up

# 查看日志
npm run prod:logs
```

## 🔍 故障排查

### 查看日志

```bash
# 查看所有服务日志
npm run dev:logs

# 查看单个服务日志
npm run backend:logs
npm run web:logs
npm run mysql:logs
```

### 进入容器调试

```bash
# 进入后端容器
npm run backend:shell

# 进入前端容器
npm run web:shell

# 进入数据库容器
npm run mysql:shell
```

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                 # Linux/Mac
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库是否启动
   npm run mysql:logs
   
   # 检查数据库健康状态
   docker-compose -f docker-compose.dev.yml ps mysql
   ```

3. **容器无法启动**
   ```bash
   # 查看详细错误信息
   docker-compose -f docker-compose.dev.yml up backend
   
   # 重新构建镜像
   npm run rebuild
   ```

4. **热重载不工作**
   ```bash
   # 检查文件权限
   docker-compose -f docker-compose.dev.yml exec backend ls -la /app/src
   
   # 检查 volume 挂载
   docker-compose -f docker-compose.dev.yml config
   ```

## 📚 环境变量说明

### 后端环境变量（`backend/.env`）

主要配置项：

- `DB_HOST`: 数据库主机（Docker: `mysql`，本地: `localhost`）
- `DB_PORT`: 数据库端口（默认: `3306`）
- `DB_USERNAME`: 数据库用户名（默认: `root`）
- `DB_PASSWORD`: 数据库密码
- `DB_DATABASE`: 数据库名称（默认: `myapp_db`）
- `NODE_ENV`: 环境模式（`development` / `production`）
- `PORT`: 后端服务端口（默认: `3000`）
- `JWT_SECRET`: JWT 密钥（生产环境必须修改）
- `CORS_ORIGIN`: CORS 允许的源

完整配置请参考 `backend/.env.example` 文件。

### 前端环境变量

**开发环境**（`web/.env.development`）：
- `VITE_APP_BASE_API`: API 基础路径（默认: `/api`）

**生产环境**（`web/.env.production`）：
- `VITE_APP_BASE_API`: API 基础路径（根据实际部署配置）

完整配置请参考：
- `web/.env.development.example` - 开发环境模板
- `web/.env.production.example` - 生产环境模板

### Docker 环境特殊说明

- Docker 运行时，`DB_HOST` 会自动覆盖为 `mysql`（容器服务名）
- 其他环境变量从项目内的 `.env` 文件读取
- 无需在根目录创建额外的 `.env` 文件

## 🎯 最佳实践

1. **开发环境**: 使用 `npm run dev:up` 启动，支持热重载
2. **生产环境**: 使用 `npm run build` 构建，`npm run prod:up` 启动
3. **单独调试**: 使用 `npm run backend:start` 等命令单独控制服务
4. **日志查看**: 使用 `npm run backend:logs` 等命令实时查看日志
5. **数据备份**: 定期备份 MySQL 数据卷

## 📞 更多帮助

运行 `npm run help` 或查看 `package.json` 中的 scripts 部分获取所有可用命令。


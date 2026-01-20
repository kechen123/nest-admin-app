# 📖 命令使用指南

本文档介绍项目中所有可用的 npm 脚本命令，包括开发、部署、文档等操作。

---

## 🎯 命令分类

- [开发环境命令](#开发环境命令)
- [生产部署命令](#生产部署命令)
- [文档命令](#文档命令)
- [工具命令](#工具命令)

---

## 开发环境命令

### 基础操作

```bash
# 启动开发环境（前台运行，显示日志）
npm run dev

# 启动开发环境（后台运行）
npm run dev:up

# 停止开发环境
npm run dev:down

# 重启开发环境
npm run dev:restart

# 查看开发环境日志
npm run dev:logs
```

### 后端服务

```bash
# 启动后端服务
npm run backend:start

# 停止后端服务
npm run backend:stop

# 重启后端服务
npm run backend:restart

# 查看后端日志
npm run backend:logs

# 进入后端容器（调试用）
npm run backend:shell

# 初始化数据库（首次运行）
npm run backend:init-db
```

### 前端服务

```bash
# 启动前端服务
npm run web:start

# 停止前端服务
npm run web:stop

# 重启前端服务
npm run web:restart

# 查看前端日志
npm run web:logs

# 进入前端容器（调试用）
npm run web:shell
```

### 数据库服务

```bash
# 启动数据库
npm run mysql:start

# 停止数据库
npm run mysql:stop

# 查看数据库日志
npm run mysql:logs

# 进入数据库命令行
npm run mysql:shell
```

### 其他开发命令

```bash
# 查看服务状态
npm run ps

# 健康检查
npm run health

# 验证环境（健康检查 + 服务状态）
npm run verify

# 快速启动（自动检测环境并启动）
npm run quick-start

# 重新构建开发镜像（不使用缓存）
npm run rebuild

# 重置开发环境
npm run reset

# 完全重置（包括数据卷）
npm run reset:all

# 清理 Docker 未使用的资源
npm run clean
```

---

## 生产部署命令

### 自动部署（推荐）

**这些命令会自动检测操作系统和 Docker 版本，选择合适的方式执行：**

```bash
# 部署所有服务（自动拉取代码、构建、重启）
npm run deploy

# 只部署后端
npm run deploy:backend

# 只部署前端
npm run deploy:web
```

**说明：**

- 自动检测 Windows/Linux/macOS
- 自动检测 Docker Compose 版本（`docker compose` 或 `docker-compose`）
- 自动拉取最新代码
- 自动构建并重启服务

### 手动部署

**如果需要手动控制每个步骤，可以使用手动命令：**

```bash
# 查看手动部署步骤（所有服务）
npm run deploy:manual

# 查看手动部署步骤（只后端）
npm run deploy:backend:manual

# 查看手动部署步骤（只前端）
npm run deploy:web:manual
```

**手动部署步骤示例：**

```bash
# 1. 进入项目目录
cd /opt/app/nest-admin-app

# 2. 拉取最新代码
git pull origin main

# 3. 构建并启动（所有服务）
docker compose -f docker-compose.prod.yml up -d --build

# 或只更新后端
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d --no-deps backend

# 或只更新前端
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d --no-deps web
```

### 生产环境管理

```bash
# 启动生产环境（前台运行）
npm run prod

# 启动生产环境（后台运行）
npm run prod:up

# 停止生产环境
npm run prod:down

# 重启生产环境
npm run prod:restart

# 查看生产环境日志
npm run prod:logs

# 构建生产镜像
npm run prod:build

# 重新构建并启动
npm run prod:rebuild

# 构建所有生产镜像
npm run build
```

### 镜像导出

```bash
# 导出 Docker 镜像（自动检测系统）
npm run export:images

# Windows 系统导出镜像
npm run export:images:win
```

---

## 文档命令

### 自动运行（推荐）

**这些命令会自动检测环境并运行：**

```bash
# 启动文档开发服务器
npm run docs:dev

# 构建文档
npm run docs:build

# 预览构建后的文档
npm run docs:preview
```

### 手动运行

**如果需要手动控制，可以使用手动命令：**

```bash
# 查看手动运行步骤（开发服务器）
npm run docs:dev:manual

# 查看手动运行步骤（构建）
npm run docs:build:manual

# 查看手动运行步骤（预览）
npm run docs:preview:manual
```

**手动运行步骤示例：**

```bash
# 进入文档目录
cd docs

# 启动开发服务器
npx vitepress dev

# 构建文档
npx vitepress build

# 预览构建后的文档
npx vitepress preview
```

---

## 工具命令

```bash
# 查看帮助信息
npm run help

# 加载环境变量并运行命令
npm run load-env
```

---

## 🔧 跨平台支持

所有命令都支持跨平台运行，会自动检测：

- **操作系统**：Windows、Linux (Ubuntu/Debian/CentOS)、macOS
- **Docker Compose 版本**：新版本 (`docker compose`) 或旧版本 (`docker-compose`)

### 系统检测示例

运行命令时会显示系统信息：

```
==========================================
系统信息:
  操作系统: Ubuntu 24.04 LTS (linux)
  架构: x64
  Docker Compose: docker compose
==========================================
```

---

## 📝 使用建议

### 开发阶段

```bash
# 首次启动
npm run dev:up
npm run backend:init-db

# 日常开发
npm run dev:logs        # 查看日志
npm run ps              # 查看服务状态
npm run health          # 健康检查
```

### 部署阶段

```bash
# 推荐：使用自动部署
npm run deploy:backend  # 只更新后端
npm run deploy:web      # 只更新前端
npm run deploy          # 更新所有服务

# 或手动部署（更多控制）
# 按照 deploy:manual 提示的步骤操作
```

### 文档维护

```bash
# 开发文档
npm run docs:dev

# 构建文档
npm run docs:build

# 预览文档
npm run docs:preview
```

---

## ⚠️ 注意事项

1. **首次使用**：需要先执行 `npm run backend:init-db` 初始化数据库
2. **环境变量**：确保已配置 `backend/.env` 文件
3. **Docker 要求**：确保已安装并启动 Docker
4. **权限问题**：Linux/macOS 可能需要 sudo 权限（Docker 组用户除外）

---

## 🆘 遇到问题？

1. **查看日志**：`npm run dev:logs` 或 `npm run prod:logs`
2. **检查状态**：`npm run ps`
3. **健康检查**：`npm run health`
4. **查看文档**：
   - [DOCKER.md](./DOCKER.md) - Docker 使用指南
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
   - [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 快速部署指南

---

**最后更新：** 2024年

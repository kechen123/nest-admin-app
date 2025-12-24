# 项目初始化指南

本文档提供从零开始初始化项目的完整步骤。

## 📋 前置要求

- Node.js >= 18.0.0
- Docker >= 20.10.0
- Docker Compose >= 2.0.0

## 🧹 清理现有环境（如果需要）

如果之前已经运行过项目，需要清理：

```bash
# 停止并删除所有容器和数据卷（⚠️ 会删除所有数据库数据）
npm run reset

# 或手动清理
npm run dev:down
docker volume rm yl_mysql_data
```

**重要提示**：如果修改了 `backend/.env` 中的 `DB_PASSWORD`，必须删除 MySQL 数据卷并重新初始化，因为 MySQL 容器的 root 密码是在首次启动时设置的。

## 🚀 完整初始化步骤

### 1. 检查/编辑环境变量（如需要）

环境变量文件已内置在项目中，如需修改配置，请编辑以下文件：

**后端配置** (`backend/.env`)：
```env
# 数据库配置（Docker 环境会自动覆盖 DB_HOST）
DB_HOST=localhost          # Docker 运行时会被覆盖为 mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root          # 请修改为安全密码
DB_DATABASE=myapp_db

# 应用配置
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-key  # 请修改为随机字符串
CORS_ORIGIN=http://localhost:4000
```

**前端配置** (`web/.env.development`)：
```env
# API 基础路径（开发环境使用代理，无需配置）
# VITE_APP_BASE_API=/api
```

### 2. 启动 Docker 服务

```bash
# 启动所有服务（后台运行）
npm run dev:up

# 查看服务状态
npm run ps
```

等待所有服务启动完成（约 30-60 秒），特别是 MySQL 需要时间初始化。

### 3. 初始化数据库

```bash
# 等待 MySQL 完全启动后（约 20-30 秒），执行数据库初始化
npm run backend:init-db
```

**重要提示**：
- 如果修改了 `backend/.env` 中的 `DB_PASSWORD`，必须先删除 MySQL 数据卷并重新启动容器
- MySQL 容器的 root 密码是在首次启动时设置的，后续修改 `.env` 文件不会自动更新密码
- 如果遇到密码验证失败，请执行 `npm run reset` 清理后重新初始化

**预期输出：**
```
正在初始化数据库 myapp_db...
检测到 Docker 环境，使用 MySQL 服务: mysql:3306
数据库初始化完成！

数据库信息:
  数据库名: myapp_db
  默认管理员账号: admin
  默认管理员密码: admin123

⚠️  请在生产环境中修改默认密码！
```

### 4. 验证服务

#### 检查容器状态

```bash
npm run ps
```

应该看到三个容器都在运行：
- `yl-mysql-dev` - MySQL 数据库（状态：healthy）
- `yl-backend-dev` - 后端服务（状态：Up）
- `yl-web-dev` - 前端服务（状态：Up）

#### 访问服务

- **前端应用**: http://localhost:4000
- **后端 API**: http://localhost:3000/api
- **Swagger 文档**: http://localhost:3000/api

#### 测试 MySQL 连接（Navicat 等工具）

- **主机**: `localhost` 或 `127.0.0.1`
- **端口**: `3306`
- **用户名**: `root`
- **密码**: `root`（或 `.env` 中配置的 `DB_PASSWORD`）
- **数据库**: `myapp_db`

**注意**：数据库初始化脚本会自动配置外部连接权限，无需额外操作。如果遇到连接问题，可以重新运行初始化脚本。

### 6. 查看日志（如遇问题）

```bash
# 查看所有服务日志
npm run dev:logs

# 查看单个服务日志
npm run backend:logs
npm run web:logs
npm run mysql:logs
```

## 🔧 常见问题排查

### 问题 1: 后端服务无法启动

**检查步骤：**
1. 查看后端日志：`npm run backend:logs`
2. 检查数据库连接是否正常
3. 确认端口 3000 未被占用

**解决方案：**
```bash
# 重启后端服务
npm run backend:restart

# 如果仍然失败，重新构建镜像
npm run rebuild
npm run dev:up
```

### 问题 2: 前端无法访问

**检查步骤：**
1. 查看前端日志：`npm run web:logs`
2. 确认端口 4000 未被占用
3. 检查浏览器控制台错误

**解决方案：**
```bash
# 重启前端服务
npm run web:restart
```

### 问题 3: MySQL 无法外部连接

**检查步骤：**
1. 确认数据库已初始化：`npm run backend:init-db`
2. 初始化脚本会自动配置外部连接权限

**解决方案：**
```bash
# 重新初始化数据库（会自动配置外部连接权限）
npm run backend:init-db

# 或手动执行修复脚本（如果自动配置失败）
npm run mysql:fix-access
```

### 问题 4: 数据库初始化失败

**检查步骤：**
1. 确认 MySQL 容器已启动并健康：`npm run ps`
2. 等待 MySQL 完全启动（约 20-30 秒）
3. 查看 MySQL 日志：`npm run mysql:logs`
4. 检查密码是否匹配：MySQL 容器的 `MYSQL_ROOT_PASSWORD` 必须与 `backend/.env` 中的 `DB_PASSWORD` 一致

**解决方案：**
```bash
# 如果修改了密码，需要重置环境
npm run reset
npm run dev:up
npm run backend:init-db

# 或重新初始化数据库
npm run backend:init-db
```

## 📝 常用命令速查

```bash
# 服务管理
npm run dev:up          # 启动所有服务
npm run dev:down        # 停止所有服务
npm run dev:restart     # 重启所有服务
npm run dev:logs        # 查看所有日志
npm run ps              # 查看服务状态

# 后端服务
npm run backend:start      # 启动后端
npm run backend:stop       # 停止后端
npm run backend:restart    # 重启后端
npm run backend:logs       # 查看后端日志
npm run backend:shell      # 进入后端容器
npm run backend:init-db    # 初始化数据库

# 前端服务
npm run web:start       # 启动前端
npm run web:stop        # 停止前端
npm run web:restart     # 重启前端
npm run web:logs        # 查看前端日志
npm run web:shell       # 进入前端容器

# MySQL 服务
npm run mysql:start         # 启动 MySQL
npm run mysql:stop          # 停止 MySQL
npm run mysql:logs         # 查看 MySQL 日志
npm run mysql:shell        # 进入 MySQL 容器
npm run mysql:fix-access   # 手动修复外部连接权限（通常不需要，初始化时已自动配置）

# 构建和清理
npm run rebuild         # 重新构建镜像（无缓存）
npm run clean          # 清理 Docker 系统
```

## 🎯 下一步

初始化完成后，你可以：

1. **访问前端应用**：http://localhost:4000
2. **使用默认账号登录**：
   - 用户名：`admin`
   - 密码：`admin123`
3. **查看 API 文档**：http://localhost:3000/api
4. **开始开发**：修改代码后，服务会自动热重载

## ⚠️ 重要提示

1. **生产环境**：请务必修改所有默认密码和密钥
2. **数据备份**：定期备份数据库数据
3. **安全配置**：生产环境请使用 `docker-compose.prod.yml` 并配置 HTTPS


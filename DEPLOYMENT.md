# 部署指南

本项目支持两种部署方式，可根据实际情况选择：

## 📦 方式一：镜像打包部署（适合首次部署、离线环境）

### 本地操作（Windows）

1. **构建镜像**
   ```powershell
   npm run build
   ```

2. **导出镜像**
   ```powershell
   # Windows PowerShell
   npm run export:images:win
   
   # 或手动导出
   docker save yl-backend:latest -o yl-backend.tar
   docker save yl-web:latest -o yl-web.tar
   ```

3. **压缩文件（可选）**
   - 脚本会自动询问是否压缩
   - 或使用 PowerShell: `Compress-Archive -Path yl-*.tar -DestinationPath images.zip`
   - 或使用 7-Zip/WinRAR 手动压缩

4. **上传到服务器**
   - 使用 WinSCP、FileZilla 等工具上传 `yl-backend.tar` 和 `yl-web.tar`

### 服务器操作（Linux）

1. **加载镜像**
   ```bash
   cd /opt/app
   docker load -i yl-backend.tar
   docker load -i yl-web.tar
   
   # 验证镜像加载成功
   docker images | grep yl
   ```

2. **修改 docker-compose.prod.yml**
   
   创建 `docker-compose.prod.yml` 的副本或修改现有文件，将 `build` 改为 `image`：
   
   ```yaml
   backend:
     image: yl-backend:latest
     # build:  # 注释掉 build 部分
     #   context: ./backend
     #   dockerfile: ../docker/backend/Dockerfile.prod
     container_name: yl-backend-prod
     restart: always
     env_file:
       - ./backend/.env
     volumes:
       - ./backend/uploads:/app/uploads
     environment:
       - DB_HOST=mysql
       - NODE_ENV=production
     depends_on:
       mysql:
         condition: service_healthy
     networks:
       - app-network
   
   web:
     image: yl-web:latest
     # build:  # 注释掉 build 部分
     #   context: .
     #   dockerfile: ./docker/web/Dockerfile.prod
     container_name: yl-web-prod
     restart: always
     networks:
       - app-network
   ```

3. **配置环境变量**
   ```bash
   mkdir -p backend
   cp backend/.env.example backend/.env  # 如果有示例文件
   vim backend/.env
   ```
   
   配置示例（`backend/.env`）：
   ```env
   DB_HOST=mysql
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=你的生产环境密码
   DB_DATABASE=你的数据库名
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=你的JWT密钥（必须修改）
   CORS_ORIGIN=*
   ```
   
   **同时需要在项目根目录创建 `.env` 文件**（用于 docker-compose 变量替换）：
   ```bash
   # 在项目根目录创建 .env 文件
   cat > .env << EOF
   DB_PASSWORD=你的生产环境密码
   DB_DATABASE=你的数据库名
   JWT_SECRET=你的JWT密钥
   EOF
   ```
   
   **为什么需要两个 .env 文件？**
   - `backend/.env` - 后端应用运行时读取的环境变量
   - 根目录 `.env` - docker-compose 在解析配置文件时使用的变量（用于 `${DB_PASSWORD}` 等替换）

4. **准备其他必要文件**
   ```bash
   # 确保有以下文件/目录
   - docker-compose.prod.yml
   - docker/nginx/nginx.conf
   - backend/.env
   - .env（根目录）
   ```

5. **启动服务**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   
   # 查看服务状态
   docker-compose -f docker-compose.prod.yml ps
   
   # 查看日志
   docker-compose -f docker-compose.prod.yml logs -f
   ```

6. **初始化数据库（首次部署）**
   ```bash
   # 等待 MySQL 容器完全启动（约 30 秒）
   docker-compose -f docker-compose.prod.yml ps mysql
   
   # 初始化数据库
   docker-compose -f docker-compose.prod.yml run --rm backend npm run db:init
   ```

---

## 🚀 方式二：Git + 服务器构建（适合后续更新、有网络环境）

### 首次部署

1. **在服务器上克隆项目**
   ```bash
   cd /opt
   git clone your-repo-url app
   cd app
   ```

2. **配置环境变量**
   ```bash
   # 配置后端环境变量
   cp backend/.env.example backend/.env
   vim backend/.env
   # 编辑环境变量（参考上面的配置示例）
   
   # 配置 docker-compose 环境变量（在项目根目录）
   cat > .env << EOF
   DB_PASSWORD=你的生产环境密码
   DB_DATABASE=你的数据库名
   JWT_SECRET=你的JWT密钥
   EOF
   ```
   
   **注意**：需要配置两个 `.env` 文件：
   - `backend/.env` - 后端应用使用
   - 根目录 `.env` - docker-compose 使用（用于变量替换）

3. **构建并启动**
   ```bash
   # 构建所有镜像
   npm run build
   # 或
   docker-compose -f docker-compose.prod.yml build
   
   # 启动服务
   npm run prod:up
   # 或
   docker-compose -f docker-compose.prod.yml up -d
   
   # 初始化数据库（首次部署）
   npm run backend:init-db
   ```

### 后续更新

**方法1：使用部署脚本（推荐）**
```bash
cd /opt/app

# 更新所有服务
npm run deploy

# 只更新后端
npm run deploy:backend

# 只更新前端
npm run deploy:web
```

**方法2：手动操作**
```bash
cd /opt/app
git pull origin main  # 或 master，根据你的分支名
docker-compose -f docker-compose.prod.yml up -d --build
```

**方法3：使用部署脚本（直接执行）**
```bash
cd /opt/app
chmod +x scripts/deploy.sh

# 更新所有服务
./scripts/deploy.sh all

# 只更新后端
./scripts/deploy.sh backend

# 只更新前端
./scripts/deploy.sh web
```

### 🧪 测试 Git + 服务器构建方式

#### 在本地测试（模拟服务器环境）

**前提条件：**
- 项目已提交到 Git 仓库
- 已配置根目录 `.env` 文件（包含 `DB_PASSWORD`、`DB_DATABASE`、`JWT_SECRET`）

**测试步骤：**

1. **使用 Git Bash 或 WSL 测试**
   ```bash
   # 打开 Git Bash，进入项目目录
   cd /d/code/me/yl
   
   # 测试部署脚本（会跳过 git pull，直接测试构建）
   npm run deploy
   
   # 或者直接执行脚本
   bash scripts/deploy.sh all
   ```

2. **使用 PowerShell 测试核心功能**
   ```powershell
   # 测试重新构建功能（相当于部署的核心部分）
   npm run prod:rebuild
   
   # 查看服务状态
   docker-compose -f docker-compose.prod.yml ps
   
   # 查看日志
   npm run prod:logs
   ```

3. **验证部署结果**
   ```bash
   # 检查所有服务是否运行
   docker-compose -f docker-compose.prod.yml ps
   
   # 应该看到所有服务状态为 "Up" 或 "healthy"
   # - yl-mysql-prod: Up (healthy)
   # - yl-backend-prod: Up
   # - yl-web-prod: Up
   # - yl-nginx-prod: Up
   ```

#### 在真实服务器上测试

1. **确保代码已推送到 Git 仓库**
   ```powershell
   # 在本地
   git add .
   git commit -m "添加 Git 部署方式"
   git push origin main
   ```

2. **在服务器上首次部署**
   ```bash
   # SSH 登录服务器
   ssh user@your-server
   
   # 克隆项目
   cd /opt
   git clone your-repo-url app
   cd app
   
   # 配置环境变量
   cp backend/.env.example backend/.env
   vim backend/.env  # 编辑配置
   
   # 创建根目录 .env 文件
   cat > .env << EOF
   DB_PASSWORD=你的密码
   DB_DATABASE=你的数据库名
   JWT_SECRET=你的密钥
   EOF
   
   # 构建并启动
   npm run build
   npm run prod:up
   npm run backend:init-db
   ```

3. **测试更新流程**
   ```bash
   # 在本地修改代码并推送
   # ... 修改代码 ...
   git add .
   git commit -m "测试更新"
   git push origin main
   
   # 在服务器上执行部署
   cd /opt/app
   npm run deploy
   
   # 验证更新成功
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs --tail=50
   ```

---

## 📊 两种方式对比

| 特性 | 镜像打包方式 | Git + 服务器构建 |
|------|------------|-----------------|
| **首次部署** | ✅ 适合 | ✅ 适合 |
| **后续更新** | ❌ 不方便（需重新打包） | ✅ 很方便（git pull + build） |
| **网络要求** | ❌ 不需要（离线可用） | ✅ 需要（Git 仓库） |
| **构建位置** | 本地构建 | 服务器构建 |
| **文件大小** | 较大（几百MB） | 较小（代码文件） |
| **适用场景** | 离线环境、首次部署、网络受限 | 有网络、频繁更新、团队协作 |

---

## 🔧 常用命令

### 镜像打包方式

**本地（Windows）：**
```powershell
npm run build                    # 构建镜像
npm run export:images:win        # 导出镜像（Windows）
npm run export:images           # 导出镜像（Linux/Mac，如果有 bash）
```

**服务器（Linux）：**
```bash
docker load -i yl-backend.tar    # 加载后端镜像
docker load -i yl-web.tar        # 加载前端镜像
docker-compose -f docker-compose.prod.yml up -d
```

### Git + 服务器构建方式

**服务器（Linux）：**
```bash
# 一键部署（拉取代码 + 构建 + 启动）
npm run deploy

# 只更新后端
npm run deploy:backend

# 只更新前端
npm run deploy:web

# 重新构建并启动
npm run prod:rebuild

# 查看日志
npm run prod:logs

# 重启服务
npm run prod:restart

# 停止服务
npm run prod:down
```

---

## ⚠️ 注意事项

### 1. 环境变量配置

- **两种方式都需要配置** `backend/.env` 文件
- **生产环境还需要**在项目根目录创建 `.env` 文件（用于 docker-compose 变量替换）
- `.env` 文件**不应提交到 Git**，确保在 `.gitignore` 中
- 生产环境必须修改 `JWT_SECRET` 和数据库密码

**为什么需要两个 .env 文件？**
- `backend/.env` - 后端应用运行时读取的环境变量（通过 `env_file` 加载到容器中）
- 根目录 `.env` - docker-compose 在解析配置文件时使用的变量（用于 `${DB_PASSWORD}` 等变量替换）

**docker-compose 变量替换机制：**
- `${VAR}` 会从**主机环境变量**或**项目根目录的 .env 文件**中读取
- `env_file` 中的变量只会加载到**容器环境**中，不会用于配置文件中的变量替换

### 2. 数据库初始化

- **首次部署必须执行**数据库初始化：
  ```bash
  npm run backend:init-db
  # 或
  docker-compose -f docker-compose.prod.yml run --rm backend npm run db:init
  ```

### 3. 文件权限

- 确保 `backend/uploads` 目录有写权限
- 如果使用镜像打包方式，需要手动创建目录：
  ```bash
  mkdir -p backend/uploads
  chmod 755 backend/uploads
  ```

### 4. 端口配置

- 默认端口：80（Nginx）、3000（后端）
- 如需修改，编辑 `docker-compose.prod.yml` 和 `docker/nginx/nginx.conf`

### 5. 防火墙

- 确保服务器开放 80 和 443 端口
- Ubuntu/Debian: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`
- CentOS/RHEL: `sudo firewall-cmd --permanent --add-port=80/tcp --add-port=443/tcp && sudo firewall-cmd --reload`

### 6. 数据备份

- MySQL 数据存储在 Docker volume 中
- 定期备份数据库和上传文件：
  ```bash
  # 备份数据库
  docker-compose -f docker-compose.prod.yml exec mysql mysqldump -uroot -p${DB_PASSWORD} ${DB_DATABASE} > backup.sql
  
  # 备份上传文件
  tar -czf uploads_backup.tar.gz backend/uploads/
  ```

---

## 🔄 切换部署方式

### 从镜像打包切换到 Git 构建

1. 在服务器上克隆项目
2. 修改 `docker-compose.prod.yml`，恢复 `build` 配置，注释掉 `image`
3. 创建根目录 `.env` 文件
4. 使用 `npm run deploy` 进行更新

### 从 Git 构建切换到镜像打包

1. 在本地构建并导出镜像
2. 上传镜像到服务器
3. 修改 `docker-compose.prod.yml`，使用 `image` 而不是 `build`
4. 加载镜像并启动

---

## 📞 故障排查

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 所有服务日志
npm run prod:logs

# 单个服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### 重启服务
```bash
npm run prod:restart
# 或
docker-compose -f docker-compose.prod.yml restart
```

### 重新构建
```bash
npm run prod:rebuild
# 或
docker-compose -f docker-compose.prod.yml up -d --build
```

### 进入容器调试
```bash
# 进入后端容器
docker-compose -f docker-compose.prod.yml exec backend sh

# 进入前端容器
docker-compose -f docker-compose.prod.yml exec web sh

# 进入数据库容器
docker-compose -f docker-compose.prod.yml exec mysql bash
```

### 常见错误

**错误：`DB_PASSWORD` variable is not set**
- **原因**：缺少根目录 `.env` 文件
- **解决**：在项目根目录创建 `.env` 文件，包含 `DB_PASSWORD`、`DB_DATABASE`、`JWT_SECRET`

**错误：MySQL container is unhealthy**
- **原因**：MySQL 启动失败，通常是密码配置问题
- **解决**：检查根目录 `.env` 文件中的 `DB_PASSWORD` 是否正确

**错误：Cannot find module**
- **原因**：构建时依赖安装不完整
- **解决**：重新构建镜像 `npm run build` 或 `npm run prod:rebuild`

---

## 📚 更多信息

- 开发环境配置：查看 `DOCKER.md`
- 构建优化：查看 `OPTIMIZATION.md`
- 项目文档：查看 `README.md`

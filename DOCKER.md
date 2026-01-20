# Docker 使用指南（小白版）

> 📚 **详细部署文档**：查看 [部署指南](./DEPLOYMENT.md)  
> 📚 **完整文档**：查看 [文档中心](./docs/)

本文档介绍如何在本地 Windows 环境下使用 Docker 开发和测试项目。

---

## 🔧 什么是 Docker？

**简单理解：**

- Docker 就像一个"集装箱"，把应用程序和它需要的所有东西（代码、依赖、配置）打包在一起
- 无论在哪里运行，都能保证环境一致，不会出现"在我电脑上能跑，在你电脑上不能跑"的问题

**为什么用 Docker？**

- ✅ 环境一致：开发、测试、生产环境完全一样
- ✅ 快速部署：一次构建，到处运行
- ✅ 隔离安全：每个应用运行在独立容器中
- ✅ 易于管理：启动、停止、删除都很简单

---

## 📋 前置要求

### 1. 安装 Docker Desktop

**Windows 系统：**

1. 下载 Docker Desktop
   - 访问：<https://www.docker.com/products/docker-desktop>
   - 或使用国内镜像：<https://mirrors.aliyun.com/docker-ce/windows/static/stable/x86_64/>
   - 下载 `Docker Desktop Installer.exe`

2. 安装 Docker Desktop
   - 双击安装程序
   - 一路"下一步"，使用默认设置
   - 安装完成后**必须重启电脑**

3. 启动 Docker Desktop
   - 重启后，在开始菜单找到 "Docker Desktop"
   - 点击启动，等待右下角图标变绿（表示启动成功）
   - 首次启动可能需要几分钟，请耐心等待

4. 验证安装

   ```powershell
   # 打开 PowerShell，执行：
   docker --version
   docker compose version
   ```

   **应该看到类似输出：**

   ```
   Docker version 24.x.x
   Docker Compose version v2.x.x
   ```

### 2. 配置 Docker 镜像加速（国内网络必须配置！）

由于国内访问 Docker Hub 较慢，需要配置镜像加速器：

1. 打开 Docker Desktop
2. 点击右上角"设置"（齿轮图标）
3. 选择 "Docker Engine"
4. 在 JSON 配置中添加以下内容：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

1. 点击 "Apply & Restart"
2. 等待 Docker 重启完成

**验证配置：**

```powershell
docker info
# 在输出中查找 "Registry Mirrors"，应该能看到配置的镜像地址
```

### 3. 安装 Git（如果还没安装）

- 下载地址：<https://git-scm.com/download/win>
- 安装时一路"下一步"即可

---

## 🚀 快速开始

### 第一次使用

#### 步骤 1：克隆项目代码

```powershell
# 在 PowerShell 中，进入您的工作目录
cd d:\code

# 克隆项目（替换为您的云效仓库地址）
git clone https://codeup.aliyun.com/你的组织名/你的项目名/你的仓库名.git nest-admin-app

cd nest-admin-app
```

**如果 Git 仓库需要认证：**

- 云效支持 HTTPS 和 SSH 两种方式
- HTTPS：需要输入用户名和密码/Token
- SSH：需要配置 SSH 密钥（参考部署文档）

#### 步骤 2：配置环境变量

```powershell
# 复制示例文件
Copy-Item backend\.env.example backend\.env

# 用记事本打开编辑
notepad backend\.env
```

**基本配置示例：**

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

#### 步骤 3：启动开发环境

```powershell
# 确保 Docker Desktop 已启动（右下角图标是绿色的）

# 启动所有服务（首次启动会下载镜像，需要几分钟）
npm run dev:up

# 等待所有服务启动完成
```

**首次启动会：**

- 下载基础镜像（MySQL、Node.js、Nginx 等）
- 构建项目镜像
- 启动所有服务

**这个过程可能需要 10-20 分钟，请耐心等待。**

#### 步骤 4：初始化数据库

```powershell
# 等待 MySQL 完全启动（约 30 秒）
Start-Sleep -Seconds 30

# 初始化数据库
npm run backend:init-db
```

#### 步骤 5：验证服务

```powershell
# 查看服务状态
npm run ps

# 应该看到所有服务状态为 "Up"
```

**在浏览器访问：**

- 前端：<http://localhost>
- 后端 API：<http://localhost/api>

---

## 📝 常用命令

### 开发环境命令

```powershell
# 启动所有服务（后台运行）
npm run dev:up

# 启动所有服务（前台运行，可以看到日志）
npm run dev

# 停止所有服务
npm run dev:down

# 重启所有服务
npm run dev:restart

# 查看日志
npm run dev:logs

# 查看服务状态
npm run ps
```

### 单个服务操作

```powershell
# 启动后端
npm run backend:start

# 停止后端
npm run backend:stop

# 重启后端
npm run backend:restart

# 查看后端日志
npm run backend:logs

# 进入后端容器（调试用）
npm run backend:shell

# 启动前端
npm run web:start

# 启动数据库
npm run mysql:start

# 进入数据库
npm run mysql:shell
```

### 数据库操作

```powershell
# 初始化数据库（首次使用）
npm run backend:init-db

# 进入数据库命令行
npm run mysql:shell

# 在数据库命令行中，可以执行 SQL：
# mysql> SHOW DATABASES;
# mysql> USE your_database;
# mysql> SHOW TABLES;
# mysql> EXIT;
```

### 生产环境命令（本地测试用）

```powershell
# 构建生产镜像
npm run build

# 启动生产环境
npm run prod:up

# 停止生产环境
npm run prod:down

# 查看生产环境日志
npm run prod:logs

# 重新构建并启动
npm run prod:rebuild
```

---

## 🔍 常见问题

### 问题 1：Docker Desktop 启动失败

**症状：** 点击 Docker Desktop 后无法启动，或提示错误

**解决方法：**

1. **检查系统要求：**
   - Windows 10 64位：专业版、企业版或教育版（版本 1903 或更高）
   - 启用虚拟化：在 BIOS 中启用虚拟化（VT-x/AMD-V）
   - 启用 Hyper-V 或 WSL 2

2. **启用 WSL 2（推荐）：**

   ```powershell
   # 以管理员身份运行 PowerShell，执行：
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   
   # 重启电脑
   # 然后下载并安装 WSL 2 更新包：
   # https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
   ```

3. **检查防火墙：**
   - 确保 Windows 防火墙允许 Docker Desktop

### 问题 2：镜像下载很慢

**症状：** `docker pull` 或构建镜像时速度很慢

**解决方法：**

1. **检查镜像加速配置：**
   - 打开 Docker Desktop → 设置 → Docker Engine
   - 确保已配置镜像加速器（参考前置要求）

2. **手动拉取镜像（使用国内镜像）：**

   ```powershell
   # 使用阿里云镜像拉取
   docker pull registry.cn-hangzhou.aliyuncs.com/library/mysql:8.0
   docker tag registry.cn-hangzhou.aliyuncs.com/library/mysql:8.0 mysql:8.0
   ```

### 问题 3：端口被占用

**症状：** `Error: bind: address already in use` 或 `Port 80 is already allocated`

**解决方法：**

```powershell
# 查找占用端口的进程
netstat -ano | findstr :80

# 停止占用端口的服务，或修改 docker-compose.dev.yml 中的端口映射
# 例如将 80:80 改为 8080:80
```

### 问题 4：服务启动失败

**症状：** `docker compose ps` 显示服务状态为 `Exit` 或 `Restarting`

**解决方法：**

```powershell
# 查看详细错误日志
npm run dev:logs

# 或查看单个服务日志
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs mysql

# 检查环境变量配置
Get-Content backend\.env
```

### 问题 5：数据库连接失败

**症状：** 后端日志显示 `ECONNREFUSED` 或 `Access denied`

**解决方法：**

```powershell
# 等待 MySQL 完全启动（约 30 秒）
Start-Sleep -Seconds 30

# 检查 MySQL 容器状态
docker compose -f docker-compose.dev.yml ps mysql

# 查看 MySQL 日志
docker compose -f docker-compose.dev.yml logs mysql

# 检查环境变量中的密码是否正确
Get-Content backend\.env | Select-String DB_PASSWORD
```

### 问题 6：磁盘空间不足

**症状：** `no space left on device` 或 Docker 提示磁盘空间不足

**解决方法：**

```powershell
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理所有未使用的资源
docker system prune -a

# 清理构建缓存
docker builder prune
```

### 问题 7：Git 克隆失败（云效）

**症状：** `fatal: Authentication failed` 或 `Permission denied`

**解决方法：**

1. **使用 HTTPS + 用户名密码：**

   ```powershell
   # 直接克隆，会提示输入用户名和密码
   git clone https://codeup.aliyun.com/组织名/项目名/仓库名.git
   
   # 或使用 Token（推荐）
   # 1. 在云效控制台生成个人访问令牌
   # 2. 使用 Token 作为密码
   git clone https://你的用户名:你的Token@codeup.aliyun.com/组织名/项目名/仓库名.git
   ```

2. **使用 SSH 密钥：**

   ```powershell
   # 生成 SSH 密钥（如果还没有）
   ssh-keygen -t rsa -C "your_email@example.com"
   
   # 查看公钥
   Get-Content ~\.ssh\id_rsa.pub
   
   # 复制公钥内容，添加到云效的 SSH 密钥设置中
   # 云效控制台 → 个人设置 → SSH 公钥 → 添加公钥
   
   # 然后使用 SSH 地址克隆
   git clone git@codeup.aliyun.com:组织名/项目名/仓库名.git
   ```

---

## 🛠️ 高级操作

### 进入容器调试

```powershell
# 进入后端容器
npm run backend:shell

# 在容器内可以执行命令：
# sh> ls -la
# sh> npm run db:init
# sh> exit
```

### 查看容器资源使用

```powershell
# 查看所有容器的资源使用情况
docker stats

# 查看单个容器的详细信息
docker inspect 容器名
```

### 备份和恢复数据

```powershell
# 备份数据库
docker compose -f docker-compose.dev.yml exec mysql mysqldump -uroot -p密码 数据库名 > backup.sql

# 恢复数据库
docker compose -f docker-compose.dev.yml exec -T mysql mysql -uroot -p密码 数据库名 < backup.sql
```

### 重置开发环境

```powershell
# 停止所有服务并删除容器
npm run dev:down

# 删除所有数据（包括数据库数据）
npm run reset:all

# 重新启动
npm run dev:up
npm run backend:init-db
```

---

## 📚 相关文档

- [部署指南](./DEPLOYMENT.md) - 生产环境部署完整流程
- [快速开始](./docs/guide/getting-started.md) - 项目运行指南
- [项目文档](./docs/) - 完整文档中心

---

## 💡 提示

1. **首次使用：** 第一次启动会下载很多镜像，需要较长时间，请耐心等待
2. **网络问题：** 如果下载慢，检查镜像加速配置
3. **端口冲突：** 如果端口被占用，修改 `docker-compose.dev.yml` 中的端口映射
4. **数据持久化：** 数据库数据存储在 Docker volume 中，删除容器不会丢失数据
5. **开发建议：** 开发时使用 `npm run dev`（前台运行），可以看到实时日志

---

**最后更新：** 2024年  
**适用版本：** Windows 10/11, Docker Desktop 24+

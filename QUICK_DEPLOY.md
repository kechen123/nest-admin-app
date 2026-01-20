# 🚀 快速部署指南（5分钟上手）

> **适用场景**：Windows 本地 → 阿里云 Ubuntu 服务器  
> **代码仓库**：阿里云云效 Codeup  
> **服务器配置**：2核2G

这是最简化的部署流程，适合快速上手。详细说明请查看 [完整部署文档](./DEPLOYMENT.md)。

---

## 📋 准备工作清单

在开始之前，请确保您已准备好：

- [ ] 阿里云服务器（Ubuntu 24.04，已获取 IP 和密码）
- [ ] 云效代码仓库地址
- [ ] Windows 电脑已安装：
  - [ ] Docker Desktop（已启动）
  - [ ] Git
  - [ ] WinSCP 或 FileZilla（文件上传工具）
  - [ ] PowerShell 或 PuTTY（SSH 连接工具）

---

## 🎯 方式一：镜像打包部署（首次部署推荐）

### 本地操作（Windows）

```powershell
# 1. 进入项目目录
cd d:\code\nest-admin-app

# 2. 配置环境变量（如果还没有）
Copy-Item backend\.env.example backend\.env
notepad backend\.env  # 编辑配置，至少修改密码

# 3. 构建镜像（需要 10-20 分钟）
npm run build

# 4. 导出镜像
npm run export:images:win
# 选择"是"压缩文件，会生成 docker-images.zip
```

**然后使用 WinSCP 上传 `docker-images.zip` 到服务器的 `/opt/app` 目录**

### 服务器操作（Linux）

```bash
# 1. SSH 连接到服务器
ssh root@你的服务器IP

# 2. 安装 Docker（如果还没安装）
apt update
apt install -y docker.io docker-compose-plugin
systemctl start docker
systemctl enable docker

# 3. 配置 Docker 镜像加速
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
systemctl restart docker

# 4. 准备项目目录
mkdir -p /opt/app
cd /opt/app

# 5. 解压镜像文件（使用 WinSCP 上传后）
unzip docker-images.zip
docker load -i yl-backend.tar
docker load -i yl-web.tar

# 6. 克隆项目代码
git clone https://codeup.aliyun.com/你的组织名/项目名/仓库名.git nest-admin-app
cd nest-admin-app

# 7. 配置环境变量
mkdir -p backend
nano backend/.env
# 粘贴您在本地配置的内容，保存（Ctrl+X, Y, Enter）

# 8. 创建根目录 .env 文件
cat > .env << EOF
DB_PASSWORD=你的数据库密码
DB_DATABASE=your_database_name
JWT_SECRET=你的JWT密钥
EOF

# 9. 修改 docker-compose.prod.yml（使用镜像而不是构建）
nano docker-compose.prod.yml
# 找到 backend 和 web 服务，注释掉 build，添加 image: yl-backend:latest 和 image: yl-web:latest

# 10. 启动服务
docker compose -f docker-compose.prod.yml up -d

# 11. 等待 30 秒后初始化数据库
sleep 30
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init

# 12. 验证部署
docker compose -f docker-compose.prod.yml ps
# 应该看到所有服务都是 "Up" 状态
```

**完成！在浏览器访问：`http://你的服务器IP`**

---

## 🎯 方式二：Git + 服务器构建（后续更新推荐）

### 服务器操作（Linux）

```bash
# 1. SSH 连接到服务器
ssh root@你的服务器IP

# 2. 安装 Docker 和 Node.js（如果还没安装）
# Docker 安装参考方式一的步骤 2-3

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pnpm --registry=https://registry.npmmirror.com
pnpm config set registry https://registry.npmmirror.com

# 3. 克隆项目
mkdir -p /opt/app
cd /opt/app
git clone https://codeup.aliyun.com/你的组织名/项目名/仓库名.git nest-admin-app
cd nest-admin-app

# 4. 配置环境变量（参考方式一的步骤 7-8）

# 5. 构建并启动
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
sleep 30
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

**完成！在浏览器访问：`http://你的服务器IP`**

---

## 🔄 后续更新部署

### 只更新后端

```bash
cd /opt/app/nest-admin-app

# 使用部署脚本（推荐）
npm run deploy:backend

# 或手动操作
git pull origin main
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d --no-deps backend
```

### 只更新前端

```bash
cd /opt/app/nest-admin-app

# 使用部署脚本（推荐）
npm run deploy:web

# 或手动操作
git pull origin main
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d --no-deps web
```

### 同时更新后端和前端

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
- 详细说明请查看 [完整部署文档](./DEPLOYMENT.md#后续更新部署重要)

---

## ❓ 遇到问题？

1. **查看日志：** `docker compose -f docker-compose.prod.yml logs -f`
2. **查看服务状态：** `docker compose -f docker-compose.prod.yml ps`
3. **查看完整文档：** [DEPLOYMENT.md](./DEPLOYMENT.md) - 包含详细说明和问题排查

---

## 📞 需要帮助？

- 查看 [完整部署文档](./DEPLOYMENT.md) 获取详细步骤
- 查看 [Docker 使用指南](./DOCKER.md) 了解本地开发
- 查看 [常见问题排查](./DEPLOYMENT.md#常见问题排查) 解决遇到的问题

---

**提示：** 这是简化版流程，如果遇到问题，请查看完整文档获取详细说明。

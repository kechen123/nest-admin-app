# PM2 一键部署快速指南

不想在服务器上一个一个手动配置？使用这套自动化脚本，3 步完成部署！

## 🚀 三种部署方式

### 方式一：全新服务器（推荐首次部署）

**适用场景：** 全新的服务器，什么都没有安装

```bash
# 1. 克隆项目
cd /opt/app
git clone <your-repo-url> yl
cd yl

# 2. 一键初始化环境（自动安装 Node.js, pnpm, PM2, MySQL, Nginx）
sudo bash scripts/pm2/setup-server.sh

# 3. 配置环境变量
cd backend
cp .env.example .env
vim .env  # 编辑数据库密码、JWT_SECRET 等

# 4. 一键部署
cd ..
bash scripts/pm2/deploy.sh
```

**完成！** 服务已启动，访问 `http://your-server-ip` 即可。

---

### 方式二：已有环境快速部署

**适用场景：** 服务器已有 Node.js、PM2 等环境

```bash
# 1. 进入项目目录
cd /opt/app/yl

# 2. 一键部署
bash scripts/pm2/deploy.sh
```

---

### 方式三：日常更新（最常用）

**适用场景：** 代码更新后快速部署

```bash
# 在服务器上执行
cd /opt/app/yl
bash scripts/pm2/update.sh
```

**就这么简单！** 一条命令完成更新。

---

## 📋 脚本说明

| 脚本 | 功能 | 使用场景 | 执行时间 |
|-----|------|---------|---------|
| `setup-server.sh` | 初始化服务器环境 | 首次部署前 | ~5-10 分钟 |
| `deploy.sh` | 完整部署流程 | 首次部署或重新部署 | ~3-5 分钟 |
| `update.sh` | 快速更新 | 日常更新 | ~1-2 分钟 |
| `quick-deploy.sh` | 超快速部署 | 已有环境快速部署 | ~30 秒 |
| `webhook-deploy.sh` | Webhook 自动部署 | 代码 push 后自动执行 | ~1-2 分钟 |
| `setup-nginx.sh` | 自动配置 Nginx | 需要配置 Nginx 时 | ~30 秒 |

---

## 🔄 自动化部署（推荐）

### Webhook 自动部署

**配置后，代码 push 自动部署，完全无需手动操作！**

#### 1. 配置 Webhook 服务

```bash
# 安装 webhook 工具
sudo apt-get install webhook  # Ubuntu/Debian
# 或
sudo yum install webhook      # CentOS/RHEL

# 创建 Webhook 配置
sudo mkdir -p /etc/webhook
sudo vim /etc/webhook/hooks.json
```

**配置文件内容：**

```json
[
  {
    "id": "deploy-yl",
    "execute-command": "/opt/app/yl/scripts/pm2/webhook-deploy.sh",
    "command-working-directory": "/opt/app/yl",
    "response-message": "Deployment triggered"
  }
]
```

#### 2. 启动 Webhook 服务

```bash
# 创建 systemd 服务
sudo vim /etc/systemd/system/webhook.service
```

**服务文件内容：**

```ini
[Unit]
Description=Webhook Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -verbose
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl start webhook
sudo systemctl enable webhook
```

#### 3. 配置 Git 仓库 Webhook

在 Git 仓库（GitHub/GitLab/Codeup）中配置 Webhook：

- **URL**: `http://your-server-ip:9000/hooks/deploy-yl`
- **事件**: Push
- **Secret**: （可选）添加密钥验证

**完成！** 以后每次 push 代码，服务器会自动部署。

---

## 📝 环境变量配置

部署前必须配置 `backend/.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_strong_password
DB_DATABASE=your_database_name

# JWT 密钥（必须修改！）
JWT_SECRET=your_very_strong_secret_key_at_least_32_chars

# CORS 配置（不要使用 *）
CORS_ORIGIN=https://your-domain.com
```

**安全提示：**
- 使用强密码（至少 16 位，包含大小写字母、数字、特殊字符）
- `.env` 文件权限设置为 600：`chmod 600 backend/.env`
- 不要将 `.env` 提交到 Git

---

## 🔧 自定义配置

可以通过环境变量自定义：

```bash
# 指定应用目录
APP_DIR=/custom/path bash scripts/pm2/deploy.sh

# 指定 Git 分支
BRANCH=develop bash scripts/pm2/deploy.sh
```

---

## 📊 部署后检查

```bash
# 查看 PM2 服务状态
pm2 status

# 查看日志
pm2 logs yl-backend

# 查看最近 100 行日志
pm2 logs yl-backend --lines 100

# 监控服务
pm2 monit

# 测试 API
curl http://localhost:3000/api
```

---

## 🆘 常见问题

### 1. 服务启动失败

```bash
# 查看详细日志
pm2 logs yl-backend --lines 100

# 检查环境变量
cat backend/.env

# 检查端口占用
netstat -tlnp | grep 3000
```

### 2. 权限问题

```bash
# 确保脚本有执行权限
chmod +x scripts/pm2/*.sh

# 确保 .env 文件权限正确
chmod 600 backend/.env
```

### 3. 依赖安装失败

```bash
# 清理缓存重新安装
cd backend
rm -rf node_modules pnpm-lock.yaml
pnpm install --production
```

---

## 🎯 推荐工作流

### 首次部署

1. 运行 `setup-server.sh` 初始化环境
2. 配置 `backend/.env` 文件
3. 运行 `deploy.sh` 完成部署
4. 配置 Webhook 实现自动部署

### 日常开发

1. 本地开发并提交代码
2. Push 到远程仓库
3. Webhook 自动触发部署
4. 完成！无需手动操作

---

## 📚 相关文档

- [PM2 详细部署指南](./pnpm.md) - 完整的手动部署步骤
- [自动部署指南](./automation.md) - CI/CD 自动部署配置
- [脚本说明](../../scripts/pm2/README.md) - 脚本详细说明

---

## 💡 提示

- **首次部署后**记得运行数据库初始化：`cd backend && pnpm run db:init`
- **配置 Nginx** 可以使用：`sudo bash scripts/pm2/setup-nginx.sh`
- **查看部署日志**：`tail -f /var/log/yl-deploy.log`（Webhook 部署）

---

**就这么简单！** 无需在服务器上一个一个手动配置，一键搞定！

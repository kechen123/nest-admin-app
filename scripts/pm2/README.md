# PM2 一键部署脚本

这套脚本提供了 PM2 部署的完整自动化方案，无需在服务器上手动配置。

## 📋 脚本说明

### 1. `setup-server.sh` - 服务器环境初始化
**功能：** 自动安装所有必要的环境
- Node.js 20+
- pnpm
- PM2
- MySQL
- Nginx
- 防火墙配置

**使用方法：**
```bash
# 在服务器上执行（需要 root 权限）
sudo bash scripts/pm2/setup-server.sh
```

### 2. `deploy.sh` - 一键部署
**功能：** 完整的首次部署流程
- 拉取代码
- 安装依赖
- 构建项目
- 配置 PM2
- 启动服务
- 可选配置 Nginx

**使用方法：**
```bash
# 在项目目录执行
bash scripts/pm2/deploy.sh

# 或指定应用目录
APP_DIR=/opt/app/yl bash scripts/pm2/deploy.sh
```

### 3. `update.sh` - 快速更新
**功能：** 快速更新代码并重启服务（零停机）
- 拉取最新代码
- 更新依赖（如需要）
- 重新构建
- 零停机重启

**使用方法：**
```bash
# 在服务器上执行
bash scripts/pm2/update.sh
```

### 4. `setup-nginx.sh` - Nginx 自动配置
**功能：** 自动生成并配置 Nginx

**使用方法：**
```bash
# 需要 root 权限
sudo bash scripts/pm2/setup-nginx.sh
```

### 5. `webhook-deploy.sh` - Webhook 自动部署
**功能：** 用于 Webhook 自动触发部署（代码 push 后自动执行）

**使用方法：**
```bash
# 配置到 Webhook 服务中，无需手动执行
# 详细配置见：docs/deployment/automation.md
```

### 6. `quick-deploy.sh` - 超快速部署
**功能：** 已有环境下的超快速部署（跳过检查，直接构建重启）

**使用方法：**
```bash
# 在服务器上执行
bash scripts/pm2/quick-deploy.sh
```

## 🚀 快速开始

### 方案一：全新服务器部署（推荐）

```bash
# 1. 在服务器上克隆项目
cd /opt/app
git clone <your-repo-url> yl
cd yl

# 2. 初始化服务器环境（需要 root）
sudo bash scripts/pm2/setup-server.sh

# 3. 配置环境变量
cd backend
cp .env.example .env
vim .env  # 编辑数据库密码、JWT_SECRET 等

# 4. 一键部署
bash scripts/pm2/deploy.sh

# 5. 配置 Nginx（可选）
sudo bash scripts/pm2/setup-nginx.sh
```

### 方案二：已有环境快速部署

```bash
# 1. 进入应用目录
cd /opt/app/yl

# 2. 一键部署
bash scripts/pm2/deploy.sh
```

## 🔄 日常更新

```bash
# 在服务器上执行
cd /opt/app/yl
bash scripts/pm2/update.sh
```

就是这么简单！

## 🤖 Webhook 自动部署（推荐）

配置后，代码 push 自动部署，完全无需手动操作！

### 快速配置

1. **安装 webhook 工具**
```bash
sudo apt-get install webhook  # Ubuntu/Debian
```

2. **创建 Webhook 配置**
```bash
sudo mkdir -p /etc/webhook
sudo vim /etc/webhook/hooks.json
```

配置文件内容：
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

3. **启动 Webhook 服务**
```bash
sudo systemctl start webhook
sudo systemctl enable webhook
```

4. **在 Git 仓库配置 Webhook**
- URL: `http://your-server-ip:9000/hooks/deploy-yl`
- 事件: Push

**完成！** 以后每次 push 代码，服务器会自动部署。

详细说明见：[自动部署指南](../../docs/deployment/automation.md)

## 📝 环境变量配置

部署前需要配置 `backend/.env` 文件：

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

## 🔧 自定义配置

可以通过环境变量自定义：

```bash
# 指定应用目录
APP_DIR=/custom/path bash scripts/pm2/deploy.sh

# 指定 Git 分支
BRANCH=develop bash scripts/pm2/deploy.sh
```

## 📊 部署后检查

```bash
# 查看 PM2 服务状态
pm2 status

# 查看日志
pm2 logs yl-backend

# 查看 Nginx 状态
sudo systemctl status nginx

# 测试 API
curl http://localhost:3000/api
```

## ⚠️ 注意事项

1. **首次部署前**必须配置 `backend/.env` 文件
2. **数据库初始化**：首次部署后需要运行 `pnpm run db:init`
3. **文件权限**：确保 `.env` 文件权限为 600
4. **防火墙**：确保已开放 80、443 端口

## 🆘 故障排查

### 服务启动失败
```bash
# 查看详细日志
pm2 logs yl-backend --lines 100

# 检查环境变量
cat backend/.env

# 检查端口占用
netstat -tlnp | grep 3000
```

### Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/yl-error.log
```

## 📚 相关文档

- [PM2 部署指南](../../docs/deployment/pnpm.md)
- [自动部署指南](../../docs/deployment/automation.md)

# Docker + 云效 Codeup + Webhook 自动部署教程

本文档详细介绍如何使用 **Docker** + **云效 Codeup** + **Webhook** 实现代码推送后自动部署到生产环境。

## 📋 目录

- [部署流程概述](#部署流程概述)
- [前置要求](#前置要求)
- [第一步：服务器环境准备](#第一步服务器环境准备)
- [第二步：配置云效 Codeup 仓库](#第二步配置云效-codeup-仓库)
- [第三步：服务器 SSH 密钥配置](#第三步服务器-ssh-密钥配置)
- [第四步：首次手动部署](#第四步首次手动部署)
- [第五步：安装和配置 Webhook 服务](#第五步安装和配置-webhook-服务)
- [第六步：编写部署脚本](#第六步编写部署脚本)
- [第七步：配置 Codeup Webhook](#第七步配置-codeup-webhook)
- [第八步：测试自动部署](#第八步测试自动部署)
- [故障排查](#故障排查)
- [安全建议](#安全建议)

---

## 部署流程概述

整个自动部署流程如下：

```
本地开发 → 推送代码到 Codeup → Codeup 触发 Webhook 
→ 服务器接收 Webhook → 执行部署脚本 
→ git pull 拉取最新代码 → docker compose 重新构建和启动 → 完成部署
```

**优势：**

- ✅ 国内网络稳定，服务器拉取代码速度快
- ✅ 实现简单，无需复杂的 CI/CD 流水线
- ✅ 自动化程度高，推送代码后自动部署
- ✅ 支持 Docker 容器化部署，环境一致性好

---

## 前置要求

在开始之前，请确保您已具备：

1. ✅ **云效 Codeup 账号**，并且项目代码已托管在 Codeup
2. ✅ **服务器**（Ubuntu 22.04/24.04 LTS 推荐，或 Debian 11/12）
3. ✅ **服务器 SSH 访问权限**（root 或具有 sudo 权限的用户）
4. ✅ **基础 Linux 命令使用经验**

---

## 第一步：服务器环境准备

### 1.1 更新系统并安装基础工具

```bash
# 更新系统包
sudo apt-get update
sudo apt-get upgrade -y

# 安装基础工具
sudo apt-get install -y ca-certificates curl gnupg lsb-release git unzip tar
```

### 1.2 安装 Docker

```bash
# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

### 1.3 配置 Docker（可选）

```bash
# 将当前用户添加到 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使配置生效
newgrp docker

# 验证（应该不需要 sudo）
docker ps
```

### 1.4 配置防火墙

```bash
# 允许 SSH（通常已默认开放）
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS（如果需要）
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 Webhook 端口（9000，后续会用到）
sudo ufw allow 9000/tcp

# 启用防火墙
sudo ufw enable
sudo ufw status
```

### 1.5 设置时区（推荐）

```bash
sudo timedatectl set-timezone Asia/Shanghai
timedatectl status
```

---

## 第二步：配置云效 Codeup 仓库

### 2.1 获取仓库 SSH 地址

1. 登录 [云效 Codeup](https://codeup.aliyun.com/)
2. 进入您的项目仓库
3. 点击 **克隆** → **SSH**，复制 SSH 地址

**示例地址格式：**

```
git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git
```

> 📝 **记录这个地址**，后续步骤会用到。

### 2.2 确认仓库分支

确认您要部署的分支名称（通常是 `main` 或 `master`）。

---

## 第三步：服务器 SSH 密钥配置

为了让服务器能够从 Codeup 拉取代码，需要配置 SSH 密钥。

### 3.1 生成 SSH 密钥对

```bash
# 创建 .ssh 目录（如果不存在）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 生成专用部署密钥（建议使用 ed25519 算法）
ssh-keygen -t ed25519 -C "yl-deploy" -f ~/.ssh/yl_deploy -N ""

# 设置密钥权限
chmod 600 ~/.ssh/yl_deploy
chmod 644 ~/.ssh/yl_deploy.pub

# 查看公钥内容（复制这个，下一步要用）
cat ~/.ssh/yl_deploy.pub
```

**输出示例：**

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx yl-deploy
```

### 3.2 将公钥添加到 Codeup

1. 登录云效 Codeup，进入您的项目仓库
2. 进入 **设置** → **部署密钥**（或 **Deploy Keys**）
3. 点击 **添加部署密钥**
4. **标题**：填写 `yl-server-deploy`（任意名称）
5. **密钥**：粘贴刚才复制的公钥内容
6. **权限**：选择 **只读**（推荐，更安全）
7. 点击 **确定**

### 3.3 配置 SSH config

> ⚠️ **重要**：以下操作需要在**服务器上**执行，不是在你的本地电脑上。

在服务器上创建或编辑 SSH 配置文件：

```bash
# 1. 创建 .ssh 目录（如果不存在）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 2. 创建或编辑 SSH 配置文件
touch ~/.ssh/config
chmod 600 ~/.ssh/config

# 3. 编辑配置文件（使用你熟悉的编辑器，如 vim、nano 等）
vim ~/.ssh/config
# 或者使用 nano（对新手更友好）
# nano ~/.ssh/config
```

**在配置文件中添加以下内容**：

```sshconfig
Host codeup codeup.aliyun.com
  HostName codeup.aliyun.com
  User git
  IdentityFile ~/.ssh/yl_deploy
  IdentitiesOnly yes
  StrictHostKeyChecking no
```

**说明**：

- `Host codeup codeup.aliyun.com` 表示这个配置同时匹配 `codeup` 别名和 `codeup.aliyun.com` 主机名
- 这样无论使用 `ssh -T codeup` 还是 `ssh -T git@codeup.aliyun.com` 都能正常工作
- 如果 `~/.ssh/config` 文件已存在，请将上述内容**追加**到文件末尾（不要覆盖原有内容）
- 如果文件是空的，直接添加即可
- 保存文件后退出编辑器（vim: 按 `Esc`，然后输入 `:wq` 回车；nano: 按 `Ctrl+X`，然后按 `Y` 确认保存）

### 3.4 测试 SSH 连接

```bash
# 测试连接（应该能看到欢迎信息或成功提示）
ssh -T git@codeup.aliyun.com

# 或者使用配置的 Host
ssh -T codeup
```

**成功示例输出：**

```
Welcome to Codeup, your-name!
```

如果看到类似输出，说明 SSH 配置成功。

---

## 第四步：首次手动部署

在配置自动部署之前，先进行一次手动部署，确保一切正常。

### 4.1 创建部署目录

```bash
# 创建应用目录
sudo mkdir -p /opt/app
sudo chown -R $USER:$USER /opt/app
cd /opt/app
```

### 4.2 克隆代码仓库

> 📝 **重要**：将下面的 `git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git` **替换为您在第二步获取的实际仓库 SSH 地址**。

**情况 A：首次部署（服务器上没有代码）**

```bash
# 克隆代码（使用第二步获取的 SSH 地址）
git clone git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git yl

# 进入项目目录
cd /opt/app/yl

# 切换到主分支（根据您的实际分支名，可能是 main 或 master）
git checkout main
```

**情况 B：代码已存在，需要重新配置 remote**

如果服务器上已经有代码，但 remote 地址不正确，需要重新设置：

```bash
# 进入项目目录
cd /opt/app/yl

# 查看当前的 remote 配置
git remote -v

# 设置正确的 remote 地址（替换为您的实际仓库地址）
git remote set-url origin git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git

# 验证配置
git remote -v

# 测试拉取
git pull origin main
```

**如何获取您的仓库 SSH 地址：**

1. 登录 [云效 Codeup](https://codeup.aliyun.com/)
2. 进入您的项目仓库
3. 点击 **克隆** → **SSH**，复制 SSH 地址
4. 格式类似：`git@codeup.aliyun.com:组织ID/项目名.git`

### 4.3 配置环境变量

#### 4.3.1 配置后端环境变量

```bash
cd /opt/app/yl

# 复制示例文件（如果存在）
cp backend/.env.example backend/.env

# 编辑环境变量
vim backend/.env
```

**`backend/.env` 配置示例：**

```env
# 数据库配置（Docker 环境中，DB_HOST 使用容器名）
NODE_ENV=production
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# CORS 配置
CORS_ORIGIN=*

# 其他配置...
```

#### 4.3.2 配置 Docker Compose 环境变量

在项目根目录创建 `.env` 文件（用于 docker-compose 变量替换）：

```bash
cd /opt/app/yl
cat > .env <<'EOF'
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret_key_here
EOF
```

> 📝 **为什么需要两个 .env 文件？**
>
> - `backend/.env` - 后端应用运行时读取的环境变量
> - 根目录 `.env` - docker-compose 在解析配置文件时使用的变量（用于 `${DB_PASSWORD}` 等变量替换）

### 4.4 创建必要的目录

```bash
cd /opt/app/yl

# 创建上传文件目录
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### 4.5 启动 Docker 服务

```bash
cd /opt/app/yl

# 启动所有服务（构建镜像并启动容器）
docker compose -f docker-compose.prod.yml up -d --build

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

**预期输出：**

```
NAME                IMAGE                    STATUS
yl-mysql-prod       mysql:8.0                Up
yl-backend-prod     yl-backend:latest        Up
yl-web-prod         yl-web:latest            Up
yl-nginx-prod       nginx:alpine             Up
```

### 4.6 等待服务启动

```bash
# 查看日志，确认服务正常启动
docker compose -f docker-compose.prod.yml logs -f
```

等待约 30-60 秒，让 MySQL 完全启动。

### 4.7 初始化数据库（首次部署）

```bash
cd /opt/app/yl

# 初始化数据库
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init
```

### 4.8 配置数据库本地访问（可选）

在首次手动部署时，如果需要从本地电脑访问服务器上的 MySQL 数据库（用于调试、数据查看等），需要配置数据库本地访问。

#### 4.8.1 确认端口映射配置

检查 `docker-compose.prod.yml` 中的 MySQL 端口配置：

```yaml
mysql:
  ports:
    - "127.0.0.1:3306:3306"  # 仅绑定到服务器本机，安全
```

> ✅ **说明**：此配置已经将 MySQL 端口映射到服务器本机的 3306 端口，但只绑定到 `127.0.0.1`，不会直接暴露到公网，更安全。

#### 4.8.2 配置 MySQL 允许外部连接（如果需要）

默认情况下，MySQL 容器已经配置了允许外部连接的权限。如果需要手动配置，可以执行：

```bash
# 进入 MySQL 容器
docker exec -it yl-mysql-prod mysql -uroot -p

# 在 MySQL 中执行（替换 your_password 为实际密码）
# MySQL 8.0+ 语法：先创建用户，再授权
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

> 📝 **说明**：MySQL 8.0+ 版本中，`GRANT` 语句不能直接使用 `IDENTIFIED BY`。需要先使用 `CREATE USER` 创建用户，然后再使用 `GRANT` 授权。如果用户已存在，可以使用 `ALTER USER 'root'@'%' IDENTIFIED BY 'your_password';` 来修改密码。

> ⚠️ **注意**：生产环境建议使用专用数据库用户，而不是 root 用户。

#### 4.8.3 从本地电脑访问数据库（推荐使用 SSH 隧道）

由于 MySQL 端口只绑定到服务器本机（`127.0.0.1:3306`），从本地电脑访问需要使用 SSH 隧道：

**在本地电脑执行**（替换 `user@server-ip` 为实际信息）：

```bash
# 建立 SSH 隧道，将本地 3306 端口转发到服务器的 3306 端口
ssh -L 3306:127.0.0.1:3306 user@your-server-ip

# 保持这个 SSH 连接打开，然后在另一个终端窗口中使用数据库客户端连接
```

**数据库客户端连接配置**：

- **Host**: `127.0.0.1` 或 `localhost`
- **Port**: `3306`
- **Username**: `root`（或您在 `.env` 中配置的用户名）
- **Password**: 您在 `backend/.env` 中配置的 `DB_PASSWORD`

**使用图形化工具（如 Navicat、DBeaver、MySQL Workbench）**：

1. 创建新的数据库连接
2. 连接类型选择：`Standard (TCP/IP)`
3. Host: `127.0.0.1`
4. Port: `3306`
5. Username: `root`
6. Password: 输入您的数据库密码
7. 测试连接

#### 4.8.4 验证数据库连接

**在服务器上测试**：

```bash
# 测试本地连接
docker exec -it yl-mysql-prod mysql -uroot -p -e "SHOW DATABASES;"

# 或者使用 MySQL 客户端（如果已安装）
mysql -h 127.0.0.1 -P 3306 -uroot -p
```

**从本地电脑测试**（需要先建立 SSH 隧道）：

```bash
# 在本地电脑执行（需要先建立 SSH 隧道）
mysql -h 127.0.0.1 -P 3306 -uroot -p
```

#### 4.8.5 安全建议

1. ✅ **使用 SSH 隧道**：推荐方式，不需要开放 MySQL 端口到公网
2. ✅ **仅绑定到 127.0.0.1**：`docker-compose.prod.yml` 已配置，MySQL 不会直接暴露到公网
3. ✅ **使用强密码**：确保 `DB_PASSWORD` 是强密码
4. ✅ **创建专用数据库用户**：生产环境建议创建专用用户，而不是使用 root
5. ⚠️ **防火墙配置**：确保服务器防火墙不放行 3306 端口到公网

> 📝 **提示**：如果不需要从本地访问数据库，可以跳过此步骤。容器内的应用仍然可以通过容器网络正常访问数据库。

### 4.9 验证部署

```bash
# 查看所有容器状态
docker compose -f docker-compose.prod.yml ps

# 查看服务日志
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs web

# 测试访问（替换为您的服务器 IP）
curl http://your-server-ip:3000
```

如果能看到响应，说明手动部署成功！

---

## 第五步：安装和配置 Webhook 服务

Webhook 服务用于接收 Codeup 的推送通知，并触发部署脚本。

### 5.1 安装 webhook 工具

**方式一：使用包管理器安装（推荐）**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y webhook
```

**方式二：从源码编译（如果包管理器没有）**

```bash
# 安装 Go（如果未安装）
sudo apt-get install -y golang-go

# 编译安装 webhook
go install github.com/adnanh/webhook@latest

# 将二进制文件复制到系统路径
sudo cp ~/go/bin/webhook /usr/local/bin/webhook
```

### 5.2 验证安装

```bash
webhook -version
```

### 5.3 创建 Webhook 配置目录

```bash
sudo mkdir -p /etc/webhook
```

### 5.4 创建 Webhook 配置文件

```bash
sudo vim /etc/webhook/hooks.json
```

**配置文件内容：**

```json
[
  {
    "id": "deploy-yl",
    "execute-command": "/opt/app/yl/scripts/webhook-deploy.sh",
    "command-working-directory": "/opt/app/yl",
    "response-message": "Deployment triggered successfully",
    "pass-arguments-to-command": [
      {
        "source": "payload",
        "name": "ref"
      }
    ],
    "trigger-rule": {
      "match": {
        "type": "value",
        "value": "refs/heads/main",
        "parameter": {
          "source": "payload",
          "name": "ref"
        }
      }
    }
  }
]
```

**配置说明：**

- `id`: Webhook 的唯一标识符
- `execute-command`: 部署脚本的完整路径
- `command-working-directory`: 执行脚本的工作目录
- `response-message`: 成功响应消息
- `trigger-rule`: 触发规则（仅当推送到 main 分支时触发）

### 5.5 创建 systemd 服务文件

```bash
sudo vim /etc/systemd/system/webhook.service
```

**服务文件内容：**

```ini
[Unit]
Description=Webhook Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -verbose -port 9000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> 📝 **注意**：如果您的 `webhook` 命令不在 `/usr/bin/webhook`，请修改 `ExecStart` 路径。可以使用 `which webhook` 查找实际路径。

### 5.6 启动 Webhook 服务

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start webhook

# 设置开机自启
sudo systemctl enable webhook

# 查看服务状态
sudo systemctl status webhook
```

**预期输出：**

```
● webhook.service - Webhook Service
   Loaded: loaded (/etc/systemd/system/webhook.service; enabled)
   Active: active (running) since ...
```

### 5.7 验证 Webhook 服务

```bash
# 查看服务日志
sudo journalctl -u webhook -f

# 测试 Webhook 端点（应该返回 404，因为还没有配置部署脚本）
curl http://localhost:9000/hooks/deploy-yl
```

---

## 第六步：配置部署脚本

部署脚本是自动部署的核心，负责拉取代码、重新构建和启动服务。

> ✅ **重要提示**：部署脚本 `scripts/webhook-deploy.sh` 已经存在于代码仓库中，首次部署时会自动包含。您只需要在首次部署后设置执行权限即可，无需手动创建脚本。这样可以避免在服务器上手动创建脚本时可能出现的格式错误或路径问题。

### 6.1 确认脚本已存在

在首次手动部署（第四步）完成后，确认部署脚本已存在：

```bash
cd /opt/app/yl
ls -l scripts/webhook-deploy.sh
```

如果脚本存在，您应该能看到类似输出：

```
-rw-r--r-- 1 user user 1234 date scripts/webhook-deploy.sh
```

> 📝 **说明**：如果脚本不存在，请检查代码是否已正确克隆，或确认脚本已提交到代码仓库。

### 6.2 设置脚本执行权限

由于脚本已存在于代码仓库中，只需要设置执行权限：

```bash
cd /opt/app/yl
chmod +x scripts/webhook-deploy.sh
```

### 6.3 创建日志目录

创建部署日志文件（如果不存在）：

```bash
sudo touch /var/log/yl-deploy.log
sudo chmod 666 /var/log/yl-deploy.log
```

### 6.4 测试部署脚本（可选）

```bash
# 手动执行一次脚本，测试是否正常
/opt/app/yl/scripts/webhook-deploy.sh
```

**预期输出：**

```
[2024-01-01 12:00:00] ==========================================
[2024-01-01 12:00:00] 开始自动部署...
[2024-01-01 12:00:00] 正在拉取最新代码...
...
```

> 💡 **优势**：
> 
> - ✅ 脚本已存在于代码仓库，首次克隆后自动包含
> - ✅ 无需在服务器上手动创建脚本，避免格式错误
> - ✅ 脚本版本与代码同步，便于维护和更新
> - ✅ 减少部署步骤，提高部署效率

---

## 第七步：配置 Codeup Webhook

现在需要在 Codeup 仓库中配置 Webhook，让它在代码推送时通知服务器。

### 7.1 获取服务器 Webhook 地址

确定您的服务器 IP 地址和 Webhook 端口（默认 9000）：

```bash
# 查看服务器 IP
hostname -I | awk '{print $1}'

# 或者
curl ifconfig.me
```

**Webhook 地址格式：**

```
http://your-server-ip:9000/hooks/deploy-yl
```

> ⚠️ **安全提示**：
>
> - 如果您的服务器有公网 IP，可以直接使用
> - 如果服务器在内网，需要配置端口转发或使用内网穿透
> - 建议配置防火墙，只允许 Codeup 的 IP 访问 9000 端口

### 7.2 在 Codeup 中配置 Webhook

1. 登录 [云效 Codeup](https://codeup.aliyun.com/)
2. 进入您的项目仓库
3. 进入 **设置** → **Webhooks**（或 **Webhook 设置**）
4. 点击 **添加 Webhook** 或 **新建 Webhook**

**配置项：**

- **Webhook 名称**：`自动部署`（任意名称）
- **URL**：`http://your-server-ip:9000/hooks/deploy-yl`
  - 将 `your-server-ip` 替换为您的实际服务器 IP
- **请求方法**：`POST`
- **Content-Type**：`application/json`
- **触发事件**：选择 **Push 事件** 或 **代码推送**
- **分支过滤**（可选）：`main`（仅 main 分支推送时触发）
- **Secret**（可选但推荐）：设置一个密钥，用于验证请求来源

1. 点击 **保存** 或 **确定**

### 7.3 测试 Webhook 连接

在 Codeup 的 Webhook 设置页面，通常有 **测试** 或 **发送测试请求** 按钮，点击测试。

**或者手动测试：**

```bash
# 在服务器上测试 Webhook 端点
curl -X POST http://localhost:9000/hooks/deploy-yl \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

**预期响应：**

```
Deployment triggered successfully
```

---

## 第八步：测试自动部署

现在可以测试完整的自动部署流程了！

### 8.1 本地修改代码

在本地项目中做一个小修改（例如修改 README 或添加注释）：

```bash
# 在本地项目目录
echo "# 自动部署测试 - $(date)" >> README.md
git add README.md
git commit -m "test: 测试自动部署"
```

### 8.2 推送到 Codeup

```bash
git push origin main
```

### 8.3 观察部署过程

**在服务器上查看日志：**

```bash
# 查看 Webhook 服务日志
sudo journalctl -u webhook -f

# 查看部署脚本日志
tail -f /var/log/yl-deploy.log

# 查看 Docker 容器日志
docker compose -f /opt/app/yl/docker-compose.prod.yml logs -f
```

### 8.4 验证部署结果

```bash
# 检查容器状态
docker compose -f /opt/app/yl/docker-compose.prod.yml ps

# 检查最新代码是否已拉取
cd /opt/app/yl
git log -1 --oneline

# 测试服务是否正常
curl http://localhost:3000
```

### 8.5 验证成功标志

✅ **部署成功的标志：**

- Webhook 日志显示请求已接收
- 部署脚本日志显示 "部署成功！"
- Docker 容器已重新构建并启动
- 代码已更新到最新提交
- 服务可以正常访问

---

## 故障排查

### 问题 1：Webhook 服务无法启动

**症状：** `sudo systemctl status webhook` 显示失败

**排查步骤：**

```bash
# 查看详细错误日志
sudo journalctl -u webhook -n 50

# 检查 webhook 命令路径
which webhook

# 手动测试 webhook 命令
/usr/bin/webhook -hooks /etc/webhook/hooks.json -verbose -port 9000
```

**常见原因：**

- webhook 命令路径不正确
- hooks.json 配置文件格式错误
- 端口 9000 已被占用

**解决方法：**

- 修正 `webhook.service` 中的 `ExecStart` 路径
- 检查 JSON 格式：`cat /etc/webhook/hooks.json | jq .`
- 检查端口占用：`sudo netstat -tlnp | grep 9000`

### 问题 2：Webhook 接收不到请求

**症状：** Codeup 推送代码后，服务器没有反应

**排查步骤：**

```bash
# 检查 Webhook 服务是否运行
sudo systemctl status webhook

# 检查防火墙是否放行 9000 端口
sudo ufw status | grep 9000

# 检查 Webhook 服务日志
sudo journalctl -u webhook -f

# 测试本地 Webhook 端点
curl -X POST http://localhost:9000/hooks/deploy-yl \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

**常见原因：**

- 防火墙未放行 9000 端口
- Codeup Webhook URL 配置错误
- 服务器 IP 地址变更

**解决方法：**

- 放行防火墙：`sudo ufw allow 9000/tcp`
- 检查 Codeup Webhook 配置中的 URL 是否正确
- 确认服务器 IP 地址

### 问题 3：Git 拉取失败

**症状：** 部署脚本执行时，`git pull` 失败

**排查步骤：**

```bash
# 检查 SSH 连接
ssh -T git@codeup.aliyun.com

# 检查 Git 配置
cd /opt/app/yl
git remote -v
git status

# 手动测试拉取
git pull origin main
```

**常见原因：**

- SSH 密钥未正确配置
- Git remote URL 不正确
- 网络连接问题

**解决方法：**

- 重新配置 SSH 密钥（参考第三步）
- 检查并修正 Git remote URL：`git remote set-url origin git@codeup.aliyun.com:...`
- 检查网络连接

### 问题 4：Docker Compose 构建失败

**症状：** `docker compose up -d --build` 失败

**排查步骤：**

```bash
# 查看详细构建日志
docker compose -f /opt/app/yl/docker-compose.prod.yml build --no-cache

# 检查 Docker 服务状态
sudo systemctl status docker

# 检查磁盘空间
df -h

# 检查 Docker 日志
sudo journalctl -u docker -n 50
```

**常见原因：**

- Docker 服务未运行
- 磁盘空间不足
- Dockerfile 或配置文件错误
- 网络问题导致无法拉取镜像

**解决方法：**

- 启动 Docker：`sudo systemctl start docker`
- 清理磁盘空间：`docker system prune -a`
- 检查 Dockerfile 和配置文件
- 检查网络连接

### 问题 5：服务启动后无法访问

**症状：** 容器已启动，但无法通过浏览器访问

**排查步骤：**

```bash
# 检查容器状态
docker compose -f /opt/app/yl/docker-compose.prod.yml ps

# 检查容器日志
docker compose -f /opt/app/yl/docker-compose.prod.yml logs backend
docker compose -f /opt/app/yl/docker-compose.prod.yml logs nginx

# 检查端口映射
docker compose -f /opt/app/yl/docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Ports}}"

# 测试本地访问
curl http://localhost:3000
```

**常见原因：**

- 端口映射配置错误
- Nginx 配置错误
- 后端服务未正常启动
- 防火墙未放行端口

**解决方法：**

- 检查 `docker-compose.prod.yml` 中的端口映射
- 检查 Nginx 配置文件
- 查看后端服务日志，排查启动错误
- 放行防火墙端口：`sudo ufw allow 3000/tcp`

### 问题 6：部署脚本权限问题

**症状：** Webhook 调用部署脚本时提示权限不足

**排查步骤：**

```bash
# 检查脚本权限
ls -l /opt/app/yl/scripts/deploy.sh

# 检查脚本所有者
stat /opt/app/yl/scripts/deploy.sh

# 检查 webhook 服务运行用户
sudo systemctl show webhook | grep User
```

**解决方法：**

```bash
# 确保脚本有执行权限
chmod +x /opt/app/yl/scripts/deploy.sh

# 如果 webhook 服务以 root 运行，确保脚本可读
chmod 755 /opt/app/yl/scripts/deploy.sh
```

---

## 安全建议

### 1. Webhook Secret 验证

建议在部署脚本中添加 Secret 验证，防止未授权请求：

```bash
# 在部署脚本开头添加
WEBHOOK_SECRET="your-secret-key-here"
RECEIVED_SECRET="$1"  # 从环境变量或参数获取

if [ "$RECEIVED_SECRET" != "$WEBHOOK_SECRET" ]; then
    log "错误: Webhook Secret 验证失败"
    exit 1
fi
```

### 2. 限制 Webhook 访问 IP

在防火墙中只允许 Codeup 的 IP 访问 9000 端口：

```bash
# 查询 Codeup Webhook IP 范围（需要查询云效文档或联系客服）
# 示例：只允许特定 IP
sudo ufw delete allow 9000/tcp
sudo ufw allow from codeup-ip-range to any port 9000
```

### 3. 使用 HTTPS（推荐）

如果可能，建议使用 Nginx 反向代理，为 Webhook 服务提供 HTTPS：

```nginx
# Nginx 配置示例
server {
    listen 443 ssl;
    server_name webhook.your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /hooks/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 定期备份

建议定期备份重要数据和配置：

```bash
# 备份数据库
docker compose -f /opt/app/yl/docker-compose.prod.yml exec mysql mysqldump -u root -p$DB_PASSWORD $DB_DATABASE > backup.sql

# 备份配置文件
tar -czf config-backup-$(date +%Y%m%d).tar.gz /opt/app/yl/backend/.env /opt/app/yl/.env
```

### 5. 日志轮转

配置日志轮转，避免日志文件过大：

```bash
# 创建 logrotate 配置
sudo vim /etc/logrotate.d/yl-deploy
```

**内容：**

```
/var/log/yl-deploy.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 总结

恭喜！您已经成功配置了 Docker + 云效 Codeup + Webhook 自动部署系统。

**现在的工作流程：**

1. ✅ 本地开发并提交代码
2. ✅ 推送到 Codeup 仓库
3. ✅ Codeup 自动触发 Webhook
4. ✅ 服务器自动拉取代码并重新部署
5. ✅ 服务自动更新，无需手动操作

**后续维护：**

- 定期查看部署日志：`tail -f /var/log/yl-deploy.log`
- 监控服务状态：`docker compose -f /opt/app/yl/docker-compose.prod.yml ps`
- 更新代码后自动部署，无需手动操作

**相关文档：**

- [Docker 部署指南](./docker.md) - 详细的 Docker 部署说明
- [自动部署指南](./automation.md) - 其他自动部署方案
- [故障排查](./docker.md#故障排查) - 更多故障排查方法

---

**祝您部署顺利！** 🎉

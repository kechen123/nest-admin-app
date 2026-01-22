# 自动部署指南

本文档介绍如何配置 CI/CD 自动化部署流程，实现代码推送后自动构建和部署到生产环境。

## 📋 目录

- [概述](#概述)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [GitLab CI/CD 自动部署](#gitlab-cicd-自动部署)
- [云效 Codeup Webhook（推荐）](#云效-codeup-webhook推荐)
- [Jenkins 自动部署](#jenkins-自动部署)
- [Webhook 自动部署](#webhook-自动部署)
- [部署策略](#部署策略)
- [安全注意事项](#安全注意事项)

---

## 概述

### 什么是自动部署？

自动部署（CI/CD）是指当代码推送到 Git 仓库后，自动触发构建、测试和部署流程，无需手动操作。

### 自动部署的优势

- ✅ **提高效率**：减少手动操作，节省时间
- ✅ **减少错误**：自动化流程减少人为失误
- ✅ **快速迭代**：代码更新后立即部署
- ✅ **一致性**：每次部署流程一致，环境统一
- ✅ **可追溯**：完整的部署日志和版本记录

### 支持的平台

- **GitHub Actions** - GitHub 官方 CI/CD 平台
- **GitLab CI/CD** - GitLab 内置 CI/CD
- **云效 Codeup** - 阿里云效代码仓库（可通过 Webhook 在 push 时触发服务器部署）
- **Jenkins** - 开源自动化服务器
- **自定义 Webhook** - 基于 Webhook 的简单部署

---

## GitHub Actions 自动部署

### 前置要求

1. GitHub 仓库
2. 服务器 SSH 访问权限
3. GitHub Actions 已启用（默认启用）

### 配置步骤

#### 1. 创建 GitHub Secrets

在 GitHub 仓库中，进入 **Settings** → **Secrets and variables** → **Actions**，添加以下密钥：

- `SERVER_HOST` - 服务器 IP 或域名
- `SERVER_USER` - SSH 用户名
- `SERVER_SSH_KEY` - SSH 私钥
- `SERVER_DEPLOY_PATH` - 部署路径（如：`/opt/app/yl`）

**获取 SSH 私钥：**

```bash
# 在本地生成 SSH 密钥对（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥添加到服务器
ssh-copy-id user@your-server

# 复制私钥内容（用于 GitHub Secrets）
cat ~/.ssh/id_rsa
```

#### 2. 创建 GitHub Actions 工作流

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main  # 或 master，根据你的主分支名
  workflow_dispatch:  # 允许手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: |
          pnpm install --frozen-lockfile

      - name: Build backend
        run: |
          cd backend
          pnpm install --frozen-lockfile
          pnpm run build
        env:
          NODE_ENV: production

      - name: Build frontend
        run: |
          cd web
          pnpm install --frozen-lockfile
          pnpm run build
        env:
          NODE_ENV: production

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "backend/dist,web/dist,backend/package.json,backend/.env.example"
          target: ${{ secrets.SERVER_DEPLOY_PATH }}

      - name: SSH and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ${{ secrets.SERVER_DEPLOY_PATH }}
            
            # 备份当前版本
            if [ -d "backend/dist" ]; then
              cp -r backend/dist backend/dist.backup.$(date +%Y%m%d_%H%M%S)
            fi
            
            # 安装后端依赖
            cd backend
            pnpm install --production --frozen-lockfile
            
            # 重启后端服务
            pm2 restart yl-backend || pm2 start ecosystem.config.js
            
            # 重启 Nginx
            sudo systemctl reload nginx
            
            echo "Deployment completed successfully!"
```

#### 3. Docker 部署版本（GitHub Actions）

如果使用 Docker 部署，可以使用以下工作流：

```yaml
name: Docker Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ${{ secrets.SERVER_DEPLOY_PATH }}
            
            # 拉取最新代码
            git pull origin main
            
            # 构建并启动服务
            docker-compose -f docker-compose.prod.yml up -d --build
            
            # 等待服务启动
            sleep 10
            
            # 检查服务状态
            docker-compose -f docker-compose.prod.yml ps
            
            echo "Docker deployment completed!"
```

---

## GitLab CI/CD 自动部署

### 前置要求

1. GitLab 仓库
2. GitLab Runner 已配置（可以在服务器上安装）
3. 服务器 SSH 访问权限

### 配置步骤

#### 1. 安装 GitLab Runner

**在服务器上安装：**

```bash
# 下载安装脚本
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

# 安装 GitLab Runner
sudo apt-get install gitlab-runner

# 注册 Runner
sudo gitlab-runner register
```

**注册时需要的信息：**

- GitLab URL: `https://gitlab.com`（或您的 GitLab 实例地址）
- Registration token: 在 GitLab 项目的 **Settings** → **CI/CD** → **Runners** 中获取
- Executor: `shell`（或 `docker`）

#### 2. 创建 GitLab CI 配置文件

在项目根目录创建 `.gitlab-ci.yml`：

```yaml
stages:
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  PNPM_VERSION: "8"

# 构建阶段
build_backend:
  stage: build
  image: node:${NODE_VERSION}
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - cd backend
    - pnpm install --frozen-lockfile
    - pnpm run build
  artifacts:
    paths:
      - backend/dist
    expire_in: 1 hour
  only:
    - main

build_frontend:
  stage: build
  image: node:${NODE_VERSION}
  before_script:
    - npm install -g pnpm@${PNPM_VERSION}
  script:
    - cd web
    - pnpm install --frozen-lockfile
    - pnpm run build
  artifacts:
    paths:
      - web/dist
    expire_in: 1 hour
  only:
    - main

# 部署阶段
deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production server..."
    - |
      ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST << EOF
        cd $SERVER_DEPLOY_PATH
        
        # 备份当前版本
        if [ -d "backend/dist" ]; then
          cp -r backend/dist backend/dist.backup.\$(date +%Y%m%d_%H%M%S)
        fi
        
        # 拉取最新代码
        git pull origin main
        
        # 安装依赖
        cd backend
        pnpm install --production --frozen-lockfile
        
        # 重启服务
        pm2 restart yl-backend || pm2 start ecosystem.config.js
        
        # 重启 Nginx
        sudo systemctl reload nginx
        
        echo "Deployment completed!"
      EOF
  only:
    - main
  when: manual  # 手动触发部署
```

#### 3. 配置 GitLab CI/CD 变量

在 GitLab 项目中，进入 **Settings** → **CI/CD** → **Variables**，添加：

- `SERVER_HOST` - 服务器地址
- `SERVER_USER` - SSH 用户名
- `SERVER_DEPLOY_PATH` - 部署路径

---

## 云效 Codeup Webhook（推荐）

如果你的服务器在国内、或服务器侧访问 GitHub 不稳定（无法稳定 `git pull`），推荐把**云效 Codeup** 作为部署触发与拉取源：

- 触发：Codeup 在 push 时发送 Webhook
- 拉取：服务器通过 SSH 从 Codeup 仓库 `git pull`
- 部署：执行你自己的部署脚本（例如 `docker compose up -d --build` 或其它）

### 新服务器（从 0）除开“服务器初始化”之后要做什么

下面步骤假设你已经完成了文档里的**新服务器初始化**（Docker / Docker Compose 已安装成功），并且你希望达到的效果是：

- 你在本地 push 到 Codeup
- 服务器自动执行：`git pull` + `docker compose up -d --build`（完成更新）

#### 1) 配置服务器 SSH（用于拉取 Codeup）

推荐使用专用 deploy key（只读即可）：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

ssh-keygen -t ed25519 -C "yl-deploy" -f ~/.ssh/yl_deploy -N ""
chmod 600 ~/.ssh/yl_deploy
cat ~/.ssh/yl_deploy.pub
```

把输出的公钥添加到 Codeup 仓库（部署 key / deploy key，建议只读）。

如果 `~/.ssh/config` 不存在，直接新建即可：

```bash
touch ~/.ssh/config
chmod 600 ~/.ssh/config
```

写入（你的仓库 SSH 地址为：`git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git`）：

```sshconfig
Host codeup
  HostName codeup.aliyun.com
  User git
  IdentityFile ~/.ssh/yl_deploy
  IdentitiesOnly yes
```

连通性测试：

```bash
ssh -T git@codeup.aliyun.com || true
```

#### 2) 首次部署（先确保不用 Webhook 也能跑起来）

准备目录并克隆代码（从 Codeup）：

```bash
sudo mkdir -p /opt/app
sudo chown -R $USER:$USER /opt/app
cd /opt/app
git clone git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git yl
cd /opt/app/yl
git checkout main || true
```

准备环境变量并启动服务：

```bash
cd /opt/app/yl

# 1) 后端运行时环境变量
cp backend/.env.example backend/.env
vim backend/.env

# 2) docker compose 变量（用于 ${DB_PASSWORD} 这类替换）
cat > .env <<'EOF'
DB_PASSWORD=your_strong_password_here
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret_key_here
EOF

# 3) 启动
docker compose -f docker-compose.prod.yml up -d --build

# 4) 初始化数据库（首次需要）
docker compose -f docker-compose.prod.yml run --rm backend npm run db:init

# 5) 验证
docker compose -f docker-compose.prod.yml ps
```

> 先让“手动部署”成功一次，再做 webhook 自动化；这样出问题更容易定位。

### 为什么推荐 Codeup Webhook

- **国内网络更稳定**：服务器拉取代码更顺畅
- **实现简单**：不依赖云效流水线/镜像仓库，直接 push → 触发 → 部署
- **和 GitHub Webhook 原理一致**：只是“谁来发回调”和“从哪里拉代码”变了

### 前置要求

1. 你的项目代码已托管在云效 Codeup
2. 服务器已安装 Git，并能通过 SSH 访问 Codeup（建议用专用 deploy key）
3. 服务器上已部署 webhook 接收服务（见下文“Webhook 自动部署”）

### 服务器端：配置 SSH 拉取 Codeup

推荐使用专用 deploy key（只读即可）：

- 在服务器生成密钥：

```bash
ssh-keygen -t ed25519 -C "yl-deploy" -f ~/.ssh/yl_deploy -N ""
cat ~/.ssh/yl_deploy.pub
```

- 将公钥添加到 Codeup 仓库（作为部署 key/只读 key）
- 在服务器配置 `~/.ssh/config`（示意）：

```sshconfig
Host codeup
  HostName codeup.aliyun.com
  User git
  IdentityFile ~/.ssh/yl_deploy
  IdentitiesOnly yes
```

> 说明：你的仓库 SSH 地址为：`git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git`

然后把服务器上的仓库 remote 指向 Codeup（示意）：

```bash
git remote -v
git remote set-url origin git@codeup.aliyun.com:66f367c65d0a63a08ebe097b/nest-admin-app.git
git pull origin main
```

### Codeup 侧：配置 Webhook（push 触发）

在 Codeup 仓库的 Webhook 设置里：

- **URL**：填写你的服务器 webhook 地址（例如 `http://<server-ip>:9000/hooks/deploy-yl`）
- **事件**：选择 Push（或“代码推送”）
- **Secret/签名**：如果 Codeup 支持，务必开启（用于防伪造请求）

### 部署脚本（示例：push 后自动更新）

你的 webhook 触发脚本里建议至少包含：

```bash
set -e
cd /opt/app/yl
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

> 如果你当前是“只占用 3000 端口的 Nginx + Docker 部署”，这种方式最直接。

---

## Jenkins 自动部署

### 前置要求

1. Jenkins 服务器已安装
2. 必要的插件已安装（Git、SSH、NodeJS 等）
3. 服务器 SSH 访问权限

### 配置步骤

#### 1. 安装 Jenkins 插件

在 Jenkins 中安装以下插件：

- **Git Plugin** - Git 集成
- **NodeJS Plugin** - Node.js 支持
- **SSH Pipeline Steps** - SSH 部署
- **Pipeline** - 流水线支持

#### 2. 配置 Jenkins 凭据

在 Jenkins 中，进入 **Manage Jenkins** → **Credentials**，添加：

- **SSH Username with private key** - 服务器 SSH 凭据
- **Secret text** - 服务器密码（如果使用密码认证）

#### 3. 创建 Jenkinsfile

在项目根目录创建 `Jenkinsfile`：

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        PNPM_VERSION = '8'
        SERVER_HOST = 'your-server-ip'
        SERVER_USER = 'your-username'
        DEPLOY_PATH = '/opt/app/yl'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh '''
                        npm install -g pnpm@${PNPM_VERSION}
                        pnpm install --frozen-lockfile
                        pnpm run build
                    '''
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('web') {
                    sh '''
                        npm install -g pnpm@${PNPM_VERSION}
                        pnpm install --frozen-lockfile
                        pnpm run build
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sshagent(['your-ssh-credentials-id']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << EOF
                                cd ${DEPLOY_PATH}
                                
                                # 备份
                                if [ -d "backend/dist" ]; then
                                    cp -r backend/dist backend/dist.backup.\$(date +%Y%m%d_%H%M%S)
                                fi
                                
                                # 拉取代码
                                git pull origin main
                                
                                # 安装依赖
                                cd backend
                                pnpm install --production --frozen-lockfile
                                
                                # 重启服务
                                pm2 restart yl-backend || pm2 start ecosystem.config.js
                                
                                # 重启 Nginx
                                sudo systemctl reload nginx
                                
                                echo "Deployment completed!"
                            EOF
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

#### 4. 创建 Jenkins 任务

1. 在 Jenkins 中创建新的 **Pipeline** 任务
2. 配置 Git 仓库地址
3. 指定 Jenkinsfile 路径
4. 保存并构建

---

## Webhook 自动部署

### 使用简单 Webhook 服务器

#### 1. 安装 webhook 工具

```bash
# Ubuntu/Debian
sudo apt-get install webhook

# 或从源码编译
go get github.com/adnanh/webhook
```

#### 2. 创建 Webhook 配置

```bash
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
    "response-message": "Deployment triggered",
    "pass-arguments-to-command": [
      {
        "source": "payload",
        "name": "ref"
      }
    ]
  }
]
```

> **提示：** 如果使用 Docker 部署，将 `execute-command` 改为 `/opt/scripts/deploy.sh`

#### 3. 创建部署脚本

```bash
sudo vim /opt/scripts/deploy.sh
```

**脚本内容（Docker 部署）：**

```bash
#!/bin/bash
set -e

DEPLOY_PATH="/opt/app/yl"
LOG_FILE="/var/log/deploy.log"

echo "$(date): Deployment started" >> $LOG_FILE

cd $DEPLOY_PATH

# 拉取最新代码
git pull origin main

# 使用 docker compose 构建并滚动更新
docker compose -f docker-compose.prod.yml up -d --build

echo "$(date): Deployment completed" >> $LOG_FILE
```

**脚本内容（PM2 部署，推荐）：**

```bash
#!/bin/bash
# 直接使用项目提供的 Webhook 部署脚本
/opt/app/yl/scripts/pm2/webhook-deploy.sh
```

**设置执行权限：**

```bash
# Docker 部署
sudo chmod +x /opt/scripts/deploy.sh

# PM2 部署（使用项目脚本）
sudo chmod +x /opt/app/yl/scripts/pm2/webhook-deploy.sh
```

#### 4. 启动 Webhook 服务

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

**启动服务：**

```bash
sudo systemctl daemon-reload
sudo systemctl start webhook
sudo systemctl enable webhook
```

#### 5. 配置 Git 仓库 Webhook

在云效 Codeup 中，进入项目 **Webhooks**，添加：

- **Payload URL**: `http://your-server:9000/hooks/deploy-yl`
- **Content type**: `application/json`
- **Secret**: （可选）添加密钥验证
- **Events**: 选择 `Push` / `代码推送`

> 端口说明：
>
> - 最简单：直接对外开放 `9000` 给 webhook 服务使用。
> - 如果你不想额外开放端口：可以把 webhook 服务仅监听本机（127.0.0.1），再用你自己的入口 Nginx（80/443 或其它）做反向代理转发到本机 9000。

---

## 部署策略

### 1. 蓝绿部署

**概念：** 维护两套完全相同的生产环境，一套运行当前版本（蓝），一套运行新版本（绿）。切换时只需切换流量。

**优点：**

- 零停机时间
- 快速回滚
- 风险较低

**缺点：**

- 需要双倍资源
- 配置复杂

### 2. 滚动部署

**概念：** 逐步替换旧版本实例，每次只更新部分实例。

**优点：**

- 资源利用率高
- 逐步验证新版本

**缺点：**

- 可能存在版本不一致
- 回滚较慢

### 3. 金丝雀部署

**概念：** 先部署到少量服务器，验证无误后再全量部署。

**优点：**

- 风险可控
- 可以逐步验证

**缺点：**

- 需要流量分流
- 配置复杂

### 4. 简单部署（推荐新手）

**概念：** 直接替换旧版本，短暂停机。

**优点：**

- 简单直接
- 配置容易

**缺点：**

- 有短暂停机
- 回滚需要时间

---

## 安全注意事项

### 1. 密钥管理

- ✅ 使用 CI/CD 平台的 Secrets 功能存储敏感信息
- ✅ 不要在代码中硬编码密码
- ✅ 定期轮换 SSH 密钥和 API 密钥
- ✅ 使用最小权限原则

### 2. 访问控制

- ✅ 限制部署权限，只有授权人员可以触发部署
- ✅ 使用 SSH 密钥认证，禁用密码登录
- ✅ 配置防火墙，只开放必要端口
- ✅ 定期审查访问日志

### 3. 代码安全

- ✅ 代码审查（Code Review）
- ✅ 自动化测试
- ✅ 依赖安全扫描
- ✅ 使用 HTTPS 传输

### 4. 部署验证

- ✅ 部署前自动运行测试
- ✅ 部署后健康检查
- ✅ 监控和告警
- ✅ 保留部署日志

---

## 📚 相关文档

- [Docker 部署指南](./docker.md) - Docker 容器化部署
- [pnpm 打包部署指南](./pnpm.md) - 传统方式部署
- [部署方式对比](./index.md) - 了解不同部署方式的特点

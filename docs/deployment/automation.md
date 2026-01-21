# 自动部署指南

本文档介绍如何配置 CI/CD 自动化部署流程，实现代码推送后自动构建和部署到生产环境。

## 📋 目录

- [概述](#概述)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [GitLab CI/CD 自动部署](#gitlab-cicd-自动部署)
- [云效（Flow）自动部署](#云效flow自动部署)
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
- **云效（Flow）** - 阿里云 DevOps（支持构建镜像推送 ACR、主机部署等）
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

## 云效（Flow）自动部署

本章节适用于你使用 **Docker 镜像部署**（构建镜像 → 推送镜像仓库 → 服务器拉取镜像并重启）的场景，尤其是：

- 你希望“本地改代码后，推送到仓库即可自动更新服务器”
- 你使用阿里云镜像仓库 **ACR**（或其它 Registry）
- 你希望在服务器上继续使用 `docker compose -f docker-compose.prod.yml up -d` 完成发布

> 参考官方文档：  
> - `https://help.aliyun.com/zh/yunxiao/user-guide/build-image-and-push-to-acr`  
> - `https://help.aliyun.com/zh/yunxiao/user-guide/host-docker-deployment`  
> - `https://help.aliyun.com/zh/yunxiao/user-guide/yaml-preliminary-experience/`

### 前置要求

1. 云效已接入你的代码仓库（Codeup/GitHub/GitLab 均可）
2. 已开通 ACR（或其它镜像仓库），并创建仓库（例如 `yl-backend`、`yl-web`）
3. 服务器已安装 Docker + Docker Compose v2，并能 `docker login` 访问你的镜像仓库
4. 你的 `docker-compose.prod.yml` 使用 **image 模式**（而不是 `build`）：
   - CI/CD 负责构建镜像
   - 服务器只负责 `pull` + `up -d`

### 推荐部署流程（构建推送 + 服务器拉取重启）

- **CI（云效流水线）**：
  - 构建 `yl-backend` 镜像并推送到 ACR
  - 构建 `yl-web` 镜像并推送到 ACR
  - 镜像 tag 推荐使用 `${GIT_COMMIT}`（或 `${PIPELINE_ID}`），便于追溯/回滚
- **CD（云效主机部署 / SSH 脚本）**：
  - 服务器 `docker login`
  - 服务器 `docker pull` 新镜像
  - 服务器用同一个 tag 启动：`docker compose ... up -d`
  - 可选：清理旧镜像 `docker image prune -f`

### 需要配置的变量（建议统一在云效变量/凭据里）

- **服务器相关**
  - `SERVER_HOST`：服务器 IP/域名
  - `SERVER_USER`：SSH 用户
  - `SERVER_DEPLOY_PATH`：部署目录（如 `/opt/app/yl`）
- **镜像仓库相关（以 ACR 为例）**
  - `ACR_REGISTRY`：例如 `registry.cn-hangzhou.aliyuncs.com`
  - `ACR_NAMESPACE`：你的命名空间
  - `ACR_USERNAME` / `ACR_PASSWORD`：ACR 账号/密码（或 RAM 用户）
  - `IMAGE_TAG`：建议 `${GIT_COMMIT}`（由云效内置变量注入/映射）

### 服务器侧发布脚本（云效“主机部署”里直接粘贴即可）

下面脚本假设你在服务器的 `docker-compose.prod.yml` 中写的是：

- `image: ${ACR_REGISTRY}/${ACR_NAMESPACE}/yl-backend:${IMAGE_TAG}`
- `image: ${ACR_REGISTRY}/${ACR_NAMESPACE}/yl-web:${IMAGE_TAG}`

并且服务器部署目录下有一个 `.env`（供 compose 变量替换）包含 `ACR_REGISTRY/ACR_NAMESPACE/IMAGE_TAG`。

```bash
set -e

cd "${SERVER_DEPLOY_PATH}"

echo "${ACR_PASSWORD}" | docker login "${ACR_REGISTRY}" -u "${ACR_USERNAME}" --password-stdin

# 拉取最新镜像（同一个 tag）
docker pull "${ACR_REGISTRY}/${ACR_NAMESPACE}/yl-backend:${IMAGE_TAG}"
docker pull "${ACR_REGISTRY}/${ACR_NAMESPACE}/yl-web:${IMAGE_TAG}"

# 启动/更新
docker compose -f docker-compose.prod.yml up -d

# 可选：清理无用镜像
docker image prune -f
```

### 云效流水线怎么配（思路）

云效流水线通常分两段：

- **Build**：使用“构建镜像并推送 ACR”的组件（选择 Dockerfile 路径、镜像名、tag）
- **Deploy**：使用“主机部署（Docker 部署/执行脚本）”组件，在目标机器组上执行上面的发布脚本

> 由于云效控制台组件名称/字段会随产品迭代变化，最稳妥的方式是按官方文档选择对应组件，并把关键变量（仓库地址、镜像名、tag、服务器信息）对齐到上面的变量表。

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
    "execute-command": "/opt/scripts/deploy.sh",
    "command-working-directory": "/opt/app/yl",
    "response-message": "Deployment triggered"
  }
]
```

#### 3. 创建部署脚本

```bash
sudo vim /opt/scripts/deploy.sh
```

**脚本内容：**
```bash
#!/bin/bash
set -e

DEPLOY_PATH="/opt/app/yl"
LOG_FILE="/var/log/deploy.log"

echo "$(date): Deployment started" >> $LOG_FILE

cd $DEPLOY_PATH

# 拉取最新代码
git pull origin main

# 构建后端
cd backend
pnpm install --frozen-lockfile
pnpm run build

# 构建前端
cd ../web
pnpm install --frozen-lockfile
pnpm run build

# 重启服务
cd ../backend
pm2 restart yl-backend || pm2 start ecosystem.config.js

# 重启 Nginx
sudo systemctl reload nginx

echo "$(date): Deployment completed" >> $LOG_FILE
```

**设置执行权限：**
```bash
sudo chmod +x /opt/scripts/deploy.sh
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

在 GitHub/GitLab 中，进入项目 **Settings** → **Webhooks**，添加：

- **Payload URL**: `http://your-server:9000/hooks/deploy-yl`
- **Content type**: `application/json`
- **Secret**: （可选）添加密钥验证
- **Events**: 选择 `Push events`

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


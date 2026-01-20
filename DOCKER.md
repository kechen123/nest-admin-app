# Docker 使用指南

> 📚 **详细文档**：查看 [文档中心](./docs/)

## 🔧 跨平台兼容性

本项目支持 Windows 和 Ubuntu 系统，并自动适配不同版本的 Docker Compose：

- **Ubuntu/Debian**: 使用新版 `docker compose` (无连字符)
- **Windows**: 使用传统 `docker-compose` (有连字符)

如果遇到 `docker-compose: not found` 错误，请确保已安装 Docker：

### Ubuntu/Debian 安装

```bash
# 更新包索引
sudo apt update

# 安装 Docker
sudo apt install docker.io

# 安装 Docker Compose 插件 (推荐)
sudo apt install docker-compose-plugin

# 或者安装传统 docker-compose
sudo apt install docker-compose

# 添加用户到 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 重新登录或运行以下命令使组更改生效
newgrp docker
```

### Windows 安装

下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

## 📖 文档导航

- [快速开始](./docs/guide/getting-started.md) - Docker 运行和 pnpm 本地运行指南
- [部署指南](./DEPLOYMENT.md) - 生产环境部署完整流程

## 🚀 快速开始

### 开发环境

```bash
# 启动所有服务
npm run dev:up

# 初始化数据库
npm run backend:init-db

# 查看服务状态
npm run ps
```

### 生产环境

```bash
# 构建镜像
npm run build

# 启动生产环境
npm run prod:up
```

## 📝 常用命令

### 开发环境

```bash
npm run dev:up          # 启动所有服务（后台）
npm run dev:down        # 停止所有服务
npm run dev:restart     # 重启所有服务
npm run dev:logs        # 查看日志
npm run backend:start   # 启动后端
npm run web:start       # 启动前端
npm run mysql:start     # 启动数据库
```

### 生产环境

```bash
npm run build           # 构建生产镜像
npm run prod:up         # 启动生产环境
npm run prod:down       # 停止生产环境
npm run prod:logs       # 查看日志
npm run deploy          # 一键部署
```

更多信息请查看 [快速开始文档](./docs/guide/getting-started.md) 和 [部署指南](./DEPLOYMENT.md)

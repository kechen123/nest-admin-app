# Docker 使用指南

> 📚 **详细文档**：查看 [文档中心](./docs/)

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

# 部署指南

欢迎使用项目部署指南！本文档将帮助您将项目部署到生产环境。

## 📚 部署方式选择

本项目提供两种部署方式，您可以根据实际情况选择：

### 🐳 Docker 部署（推荐）

**适合场景：**
- 需要快速部署，环境一致性好
- 服务器已安装 Docker 和 Docker Compose
- 希望使用容器化部署，便于管理和维护
- 需要支持多环境部署（开发、测试、生产）

**优点：**
- 环境隔离，避免依赖冲突
- 一键启动所有服务
- 易于扩展和维护
- 支持镜像打包离线部署

**查看详细文档：** [Docker 部署指南](./docker.md)

---

### 📦 pnpm 打包部署

**适合场景：**
- 服务器未安装 Docker 或无法使用容器
- 需要直接在服务器上运行 Node.js 应用
- 对服务器资源有更精细的控制需求
- 传统部署方式

**优点：**
- 不依赖 Docker 环境
- 资源占用相对较小
- 可以直接访问服务器文件系统
- 适合已有 Node.js 环境的服务器

**查看详细文档：** [pnpm 打包部署指南](./pnpm.md)

---

## 🤖 自动部署

如果您希望实现自动化部署，可以配置 CI/CD 流程：

**查看详细文档：** [自动部署指南](./automation.md)

---

## 📊 部署方式对比

| 特性 | Docker 部署 | pnpm 打包部署 |
|------|------------|--------------|
| **环境要求** | Docker + Docker Compose | Node.js + pnpm + MySQL |
| **部署速度** | ⭐⭐⭐⭐⭐ 快速 | ⭐⭐⭐ 中等 |
| **环境一致性** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐ 一般 |
| **资源占用** | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较小 |
| **维护难度** | ⭐⭐⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| **扩展性** | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐ 一般 |
| **离线部署** | ✅ 支持 | ❌ 不支持 |
| **适用场景** | 生产环境推荐 | 传统服务器环境 |

---

## 🚀 快速开始

### Docker 部署（3 步完成）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd yl

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件

# 3. 启动服务
npm run build
npm run prod:up
npm run backend:init-db
```

### pnpm 打包部署（5 步完成）

```bash
# 1. 安装依赖
pnpm install

# 2. 构建项目
pnpm run build:all

# 3. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件

# 4. 启动服务
pnpm run start:prod

# 5. 初始化数据库
cd backend
pnpm run db:init
```

---

## ⚠️ 部署前检查清单

在开始部署前，请确保：

- [ ] 服务器已安装所需环境（Docker 或 Node.js）
- [ ] 已配置数据库（MySQL 8.0+）
- [ ] 已准备环境变量配置文件
- [ ] 已开放必要的端口（80, 443, 3000）
- [ ] 已配置防火墙规则
- [ ] 已备份现有数据（如适用）

---

## 📞 获取帮助

如果在部署过程中遇到问题，请：

1. 查看对应部署方式的详细文档
2. 检查 [故障排查](./docker.md#故障排查) 章节
3. 查看项目日志：`docker-compose -f docker-compose.prod.yml logs` 或 `pm2 logs`

---

## 📖 相关文档

- [快速开始](../guide/getting-started.md) - 本地开发环境搭建
- [后端配置](../backend/configuration.md) - 后端环境配置详解
- [前端配置](../frontend/configuration.md) - 前端环境配置详解


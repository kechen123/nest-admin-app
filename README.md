# yl 全栈项目

基于 Docker 的现代化全栈开发解决方案，采用 NestJS + Vue 3 + MySQL 技术栈。

## 项目简介

本项目是一个完整的全栈管理系统，包含：

- **后端服务** (`backend/`) - NestJS + TypeORM + MySQL
- **前端应用** (`web/`) - Vue 3 + Element Plus + Vite
- **移动端应用** (`uniapp-mobile/`) - UniApp 跨平台应用

## 快速开始

```bash
# 启动开发环境（Docker 方式）
npm run dev:up

# 初始化数据库（首次运行）
npm run backend:init-db

# 查看服务状态
npm run ps
```

**访问地址**：

- 前端应用：<http://localhost:4000>
- 后端 API：<http://localhost:3000/api>
- Swagger 文档：<http://localhost:3000/api>

**默认登录信息**：

- 用户名：`admin`
- 密码：`admin123`

⚠️ **请在生产环境中修改默认密码！**

## 文档导航

📚 **完整文档**：访问 [文档中心](./docs/) 查看详细文档

### 快速链接

- [快速开始](./docs/guide/getting-started.md) - 项目运行指南
- [项目介绍](./docs/guide/introduction.md) - 项目概述和特点
- [前端文档](./docs/frontend/) - 前端开发文档
- [后端文档](./docs/backend/) - 后端开发文档

### 文档结构

```
docs/
├── guide/              # 总体介绍
│   ├── introduction.md    # 项目介绍
│   └── getting-started.md # 快速开始
├── frontend/           # 前端文档
│   ├── configuration.md  # 项目配置
│   ├── structure.md      # 文件目录
│   ├── components.md     # 组件使用
│   └── table-development.md # 表格页面开发
└── backend/            # 后端文档
    ├── configuration.md   # 项目配置
    ├── structure.md       # 项目结构
    ├── api.md             # API 开发
    └── database.md        # 数据库设计
```

## 常用命令

### 开发环境

```bash
npm run dev:up          # 启动所有服务（后台）
npm run dev:down        # 停止所有服务
npm run dev:logs        # 查看日志
npm run health          # 健康检查
```

### 生产部署

```bash
# 自动部署（推荐，自动检测系统环境）
npm run deploy          # 部署所有服务
npm run deploy:backend  # 只部署后端
npm run deploy:web     # 只部署前端

# 手动部署（查看步骤提示）
npm run deploy:manual        # 查看手动部署步骤
npm run deploy:backend:manual
npm run deploy:web:manual
```

### 文档

```bash
# 自动运行（推荐）
npm run docs:dev        # 启动文档开发服务器
npm run docs:build      # 构建文档
npm run docs:preview    # 预览文档

# 手动运行（查看步骤提示）
npm run docs:dev:manual
npm run docs:build:manual
npm run docs:preview:manual
```

**📖 完整命令列表：** 查看 [COMMANDS.md](./COMMANDS.md) 获取所有可用命令

**✨ 特性：** 所有命令都支持跨平台（Windows/Linux/macOS），自动检测 Docker Compose 版本

## 技术栈

- **后端**：NestJS、TypeScript、TypeORM、MySQL、JWT
- **前端**：Vue 3、TypeScript、Vite、Element Plus、Pinia
- **移动端**：UniApp
- **基础设施**：Docker、Docker Compose、Nginx

## 相关文档

- [项目配置说明](./docs/guide/getting-started.md#项目概述)
- [Docker 运行指南](./docs/guide/getting-started.md#docker-运行)
- [pnpm 本地运行](./docs/guide/getting-started.md#pnpm-本地运行)
- [部署指南](./DEPLOYMENT.md)

## 许可证

[在此添加许可证信息]

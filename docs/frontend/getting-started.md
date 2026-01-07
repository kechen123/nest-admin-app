# 前端快速开始

本指南将帮助您快速开始前端开发。

## 前置要求

- Node.js 16+ 
- npm 或 yarn
- Docker（如果使用容器化开发）

## 项目结构

```
frontend/
├── src/           # 源代码目录
├── public/        # 静态资源
├── package.json   # 依赖配置
└── ...
```

## 安装依赖

如果需要在本地开发（不使用 Docker），可以：

```bash
cd frontend
npm install
```

## 开发模式

### 使用 Docker（推荐）

```bash
# 启动前端服务
npm run web:start

# 查看日志
npm run web:logs

# 进入容器
npm run web:shell
```

### 本地开发

```bash
cd frontend
npm run dev
```

## 构建

```bash
# 在容器中构建
docker-compose -f docker-compose.dev.yml exec web npm run build

# 本地构建
cd frontend
npm run build
```

## 代码规范

项目使用 ESLint 和 Prettier 进行代码格式化。

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

## 下一步

- 查看 [项目结构](./structure.md) 了解目录组织
- 阅读 [开发指南](./development.md) 了解开发规范


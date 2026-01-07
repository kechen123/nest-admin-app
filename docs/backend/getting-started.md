# 后端快速开始

本指南将帮助您快速开始后端开发。

## 前置要求

- Node.js 16+ / Python 3.8+ / Java 11+（根据实际技术栈）
- npm / pip / maven（根据实际技术栈）
- Docker（如果使用容器化开发）
- MySQL 5.7+ 或 MySQL 8.0+

## 项目结构

```
backend/
├── src/              # 源代码目录
├── config/           # 配置文件
├── database/         # 数据库相关
├── tests/            # 测试文件
├── package.json      # 依赖配置
└── ...
```

## 安装依赖

如果需要在本地开发（不使用 Docker），可以：

```bash
cd backend
npm install  # 或 pip install -r requirements.txt
```

## 配置环境变量

复制环境变量文件并配置：

```bash
cp .env.example .env
```

重要配置项：
- 数据库连接信息
- API 端口
- JWT 密钥
- 其他服务配置

## 开发模式

### 使用 Docker（推荐）

```bash
# 启动后端服务
npm run backend:start

# 查看日志
npm run backend:logs

# 进入容器
npm run backend:shell
```

### 本地开发

```bash
cd backend
npm run dev  # 或 python manage.py runserver
```

## 数据库初始化

首次启动需要初始化数据库：

```bash
npm run backend:init-db
```

## API 测试

启动服务后，可以通过以下方式测试 API：

```bash
# 健康检查
curl http://localhost:8000/health

# 或使用 Postman / Insomnia
```

## 代码规范

项目使用 ESLint / Pylint / Checkstyle 进行代码检查。

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

## 下一步

- 查看 [项目结构](./structure.md) 了解目录组织
- 阅读 [API 文档](./api.md) 了解接口规范
- 查看 [数据库设计](./database.md) 了解数据模型


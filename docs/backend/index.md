# 后端文档

欢迎来到后端开发文档！

## 概述

后端采用 NestJS 框架构建，提供 RESTful API 服务，处理业务逻辑和数据管理。项目采用模块化架构，支持完整的用户认证、权限管理、数据字典等功能。

## 目录

- [快速开始](./getting-started.md)
- [项目配置](./configuration.md)
- [项目结构](./structure.md)
- [API 开发](./api.md)
- [数据库设计](./database.md)
- [开发指南](./development.md)
- [部署指南](./deployment.md)

## 技术栈

### 核心框架

- **NestJS** - 渐进式 Node.js 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Express** - Web 应用框架（NestJS 底层）

### 数据库

- **MySQL** - 关系型数据库
- **TypeORM** - ORM 框架，支持数据库迁移和实体管理

### 认证授权

- **JWT** - JSON Web Token 身份认证
- **Passport** - 认证中间件
- **bcrypt** - 密码加密

### 工具库

- **class-validator** - DTO 验证
- **class-transformer** - 对象转换
- **Swagger** - API 文档生成
- **multer** - 文件上传处理

## 项目特点

- 🏗️ **模块化架构**：采用 NestJS 模块化设计，代码组织清晰
- 🔐 **完善的权限系统**：支持用户、角色、权限三级权限管理
- 📝 **类型安全**：全面使用 TypeScript，提供完整的类型定义
- 📚 **API 文档**：集成 Swagger，自动生成 API 文档
- 🛡️ **统一异常处理**：全局异常过滤器和响应拦截器
- ✅ **数据验证**：使用 DTO 和 class-validator 进行数据验证
- 📊 **操作日志**：记录登录日志和操作日志

## 开发环境

后端服务支持热重载，修改代码后会自动重启。

### 启动后端服务

```bash
# Docker 方式（推荐）
npm run backend:start

# 本地开发
cd backend
pnpm run start:dev
```

### 查看日志

```bash
npm run backend:logs
```

### 进入容器

```bash
npm run backend:shell
```

### 初始化数据库

```bash
npm run backend:init-db
```

### 访问 Swagger 文档

启动服务后访问：`http://localhost:3000/api`

## 相关链接

- [总体介绍](../guide/introduction.md)
- [前端文档](../frontend/)


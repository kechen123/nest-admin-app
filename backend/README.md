# NestJS 后端服务

## 技术栈

- NestJS
- TypeScript
- MySQL
- TypeORM
- JWT
- Swagger

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动 MySQL 数据库

使用 Docker Compose：

```bash
docker-compose up -d
```

或使用本地 MySQL，确保配置正确。

### 3.1 初始化数据库

执行数据库初始化脚本（推荐使用自动化脚本）：

```bash
# 等待 MySQL 启动完成（约10秒）
sleep 10  # Linux/Mac
# 或
Start-Sleep -Seconds 10  # PowerShell

# 使用 npm 脚本（需要先配置 .env 文件）
npm run db:init
```

详细说明请查看 [database/README.md](./database/README.md)

### 4. 运行项目

开发模式：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

### 5. 访问 Swagger 文档

启动后访问：http://localhost:3000/api

## 项目结构

```
src/
├── common/          # 公共模块
│   ├── dto/        # 通用 DTO
│   ├── entities/   # 基础实体
│   ├── filters/    # 异常过滤器
│   ├── interceptors/ # 拦截器
│   └── interfaces/ # 接口定义
├── modules/         # 业务模块
│   └── user/       # 用户模块
├── auth/           # 认证模块
└── main.ts         # 入口文件
```

## API 说明

### 认证接口

- `POST /api/auth/login` - 用户登录

### 用户接口（需要 JWT 认证）

- `GET /api/users` - 分页查询用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PATCH /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

## 开发说明

- 使用 TypeORM 进行数据库操作
- 使用 JWT 进行身份认证
- 使用 Swagger 生成 API 文档
- 统一的响应格式和异常处理

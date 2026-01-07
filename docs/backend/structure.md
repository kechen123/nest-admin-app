# 项目结构

本文档详细介绍后端项目的目录结构和文件组织方式。

## 项目根目录

```
backend/
├── src/                    # 源代码目录
├── database/                # 数据库相关
│   ├── init.sql           # 初始化 SQL
│   ├── init-db.js         # 初始化脚本
│   └── README.md          # 数据库说明
├── uploads/                # 上传文件目录
├── .env.example            # 环境变量模板
├── .env                    # 环境变量（需创建）
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
└── nest-cli.json           # NestJS CLI 配置
```

## 源代码目录结构

```
src/
├── auth/                    # 认证模块
├── common/                  # 公共模块
├── modules/                 # 业务模块
├── app.module.ts           # 根模块
└── main.ts                 # 应用入口文件
```

## 目录详细说明

### auth/ - 认证模块

处理用户认证和授权相关功能：

```
auth/
├── auth.controller.ts       # 认证控制器（登录、注册等）
├── auth.service.ts         # 认证服务
├── auth.module.ts          # 认证模块
├── dto/                    # 认证相关 DTO
│   ├── login.dto.ts       # 登录 DTO
│   ├── update-profile.dto.ts  # 更新资料 DTO
│   └── change-password.dto.ts # 修改密码 DTO
├── guards/                 # 守卫
│   └── jwt-auth.guard.ts  # JWT 认证守卫
└── strategies/            # 认证策略
    └── jwt.strategy.ts    # JWT 策略
```

### common/ - 公共模块

存放公共代码，供所有模块使用：

```
common/
├── dto/                    # 通用 DTO
│   └── pagination.dto.ts  # 分页 DTO
├── entities/               # 基础实体
│   └── base.entity.ts     # 基础实体类
├── filters/                # 异常过滤器
│   └── http-exception.filter.ts  # HTTP 异常过滤器
├── interceptors/           # 拦截器
│   └── transform.interceptor.ts  # 响应转换拦截器
├── interfaces/             # 接口定义
│   └── response.interface.ts     # 响应接口
└── swagger/                # Swagger 配置
    ├── swagger.config.ts
    ├── swagger.service.ts
    └── swagger.setup.ts
```

### modules/ - 业务模块

按功能划分的业务模块，每个模块包含完整的 CRUD 功能：

```
modules/
├── user/                   # 用户模块
│   ├── user.controller.ts # 用户控制器
│   ├── user.service.ts    # 用户服务
│   ├── user.entity.ts     # 用户实体
│   ├── user.module.ts     # 用户模块
│   └── dto/               # 用户相关 DTO
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── query-user.dto.ts
├── role/                   # 角色模块
├── permission/             # 权限模块
├── menu/                   # 菜单模块
├── department/             # 部门模块
├── post/                   # 岗位模块
├── dict/                   # 字典模块
├── upload/                 # 上传模块
├── login-log/              # 登录日志模块
├── operation-log/          # 操作日志模块
└── monitor/                # 监控模块
```

### 模块结构规范

每个业务模块遵循相同的结构：

```
module-name/
├── module-name.controller.ts  # 控制器：处理 HTTP 请求
├── module-name.service.ts    # 服务：业务逻辑处理
├── module-name.entity.ts     # 实体：数据库模型
├── module-name.module.ts     # 模块：模块配置
└── dto/                      # DTO：数据传输对象
    ├── create-module-name.dto.ts    # 创建 DTO
    ├── update-module-name.dto.ts    # 更新 DTO
    └── query-module-name.dto.ts     # 查询 DTO
```

## 文件说明

### Controller（控制器）

处理 HTTP 请求，调用 Service 处理业务逻辑：

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll()
  }
}
```

### Service（服务）

包含业务逻辑，处理数据操作：

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find()
  }
}
```

### Entity（实体）

定义数据库表结构，使用 TypeORM 装饰器：

```typescript
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string
}
```

### DTO（数据传输对象）

定义数据传输格式和验证规则：

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string

  @IsEmail()
  email: string
}
```

### Module（模块）

配置模块的依赖和导出：

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

## 架构模式

项目采用 NestJS 的分层架构：

```
┌─────────────────┐
│   Controller    │  ← 处理 HTTP 请求
└────────┬────────┘
         │
┌────────▼────────┐
│    Service      │  ← 业务逻辑处理
└────────┬────────┘
         │
┌────────▼────────┐
│  Repository     │  ← 数据访问（TypeORM）
└────────┬────────┘
         │
┌────────▼────────┐
│   Database      │  ← MySQL 数据库
└─────────────────┘
```

### 数据流向

1. **请求** → Controller 接收 HTTP 请求
2. **验证** → DTO 验证请求数据
3. **处理** → Service 处理业务逻辑
4. **数据** → Repository 操作数据库
5. **响应** → Interceptor 转换响应格式
6. **返回** → Controller 返回响应

## 命名规范

### 文件命名

- **控制器**：`user.controller.ts`（kebab-case）
- **服务**：`user.service.ts`（kebab-case）
- **实体**：`user.entity.ts`（kebab-case）
- **模块**：`user.module.ts`（kebab-case）
- **DTO**：`create-user.dto.ts`（kebab-case）

### 类命名

- **控制器**：`UserController`（PascalCase）
- **服务**：`UserService`（PascalCase）
- **实体**：`User`（PascalCase）
- **模块**：`UserModule`（PascalCase）
- **DTO**：`CreateUserDto`（PascalCase）

### 路由命名

- 使用复数形式：`/users`、`/roles`、`/permissions`
- 使用 RESTful 风格：`GET /users`、`POST /users`、`PATCH /users/:id`

## 代码组织原则

1. **模块化**：按功能划分模块，每个模块独立
2. **单一职责**：每个类只负责一个功能
3. **依赖注入**：使用 NestJS 的依赖注入系统
4. **类型安全**：全面使用 TypeScript 类型
5. **代码复用**：公共代码放在 `common` 目录

## 下一步

- 查看 [项目配置](./configuration.md) 了解配置详情
- 查看 [API 开发](./api.md) 了解接口开发规范
- 查看 [数据库设计](./database.md) 了解数据模型


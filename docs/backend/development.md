# 开发指南

本文档介绍后端开发的规范、最佳实践和开发流程。

## 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/user-management
```

### 2. 开发新功能

按照以下步骤开发：

1. **创建 Entity**：定义数据库实体
2. **创建 DTO**：定义数据传输对象
3. **实现 Service**：编写业务逻辑
4. **实现 Controller**：处理 HTTP 请求
5. **配置 Module**：注册模块依赖

### 3. 运行测试

```bash
# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e

# 查看测试覆盖率
pnpm test:cov
```

### 4. 代码检查

```bash
# 运行 ESLint
pnpm lint

# 格式化代码
pnpm format
```

### 5. 提交代码

```bash
git add .
git commit -m "feat: 添加用户管理功能"
git push origin feature/user-management
```

## 代码规范

### TypeScript 规范

- 使用 TypeScript 严格模式
- 所有函数和类都要有类型定义
- 避免使用 `any`，使用 `unknown` 或具体类型

### 命名规范

#### 文件命名

- **Controller**：`user.controller.ts`（kebab-case）
- **Service**：`user.service.ts`（kebab-case）
- **Entity**：`user.entity.ts`（kebab-case）
- **DTO**：`create-user.dto.ts`（kebab-case）
- **Module**：`user.module.ts`（kebab-case）

#### 类命名

- **Controller**：`UserController`（PascalCase）
- **Service**：`UserService`（PascalCase）
- **Entity**：`User`（PascalCase）
- **DTO**：`CreateUserDto`（PascalCase）

#### 变量命名

- **变量和函数**：`camelCase`
- **常量**：`UPPER_SNAKE_CASE`
- **私有属性**：`private propertyName`

### 代码风格

- 使用 2 个空格缩进
- 使用单引号
- 行尾不加分号（根据项目配置）
- 使用尾随逗号

### 注释规范

- 公共方法必须添加注释
- 复杂逻辑添加说明注释
- 使用 JSDoc 格式

```typescript
/**
 * 创建用户
 * @param createUserDto 用户创建数据
 * @returns 创建的用户信息
 */
async create(createUserDto: CreateUserDto): Promise<User> {
  // ...
}
```

## 模块开发

### 创建新模块

使用 NestJS CLI 创建模块：

```bash
nest g module modules/product
nest g controller modules/product
nest g service modules/product
```

### 模块结构

每个模块应包含：

```
product/
├── product.controller.ts    # 控制器
├── product.service.ts       # 服务
├── product.entity.ts        # 实体
├── product.module.ts        # 模块
└── dto/                     # DTO
    ├── create-product.dto.ts
    ├── update-product.dto.ts
    └── query-product.dto.ts
```

### 模块注册

在 `app.module.ts` 中注册新模块：

```typescript
@Module({
  imports: [
    // ... 其他模块
    ProductModule,
  ],
})
export class AppModule {}
```

## DTO 开发

### DTO 验证规则

使用 `class-validator` 装饰器定义验证规则：

```typescript
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  nickname?: string
}
```

### 常用验证装饰器

- `@IsString()` - 字符串类型
- `@IsEmail()` - 邮箱格式
- `@IsNumber()` - 数字类型
- `@IsOptional()` - 可选字段
- `@MinLength(n)` - 最小长度
- `@MaxLength(n)` - 最大长度
- `@IsIn([...])` - 值必须在指定数组中
- `@IsInt()` - 整数类型
- `@IsBoolean()` - 布尔类型

## Service 开发

### Service 职责

Service 层负责：

- 业务逻辑处理
- 数据验证和处理
- 数据库操作
- 调用其他服务

### Service 示例

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException('用户名已存在')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    // 创建用户
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return this.userRepository.save(user)
  }
}
```

### 查询构建器

使用 QueryBuilder 构建复杂查询：

```typescript
async findAll(queryDto: QueryUserDto) {
  const { page = 1, pageSize = 10, username, email } = queryDto
  const queryBuilder = this.userRepository.createQueryBuilder('user')

  if (username) {
    queryBuilder.where('user.username LIKE :username', {
      username: `%${username}%`,
    })
  }

  if (email) {
    queryBuilder.andWhere('user.email LIKE :email', {
      email: `%${email}%`,
    })
  }

  const [list, total] = await queryBuilder
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount()

  return { list, total, page, pageSize }
}
```

## Controller 开发

### Controller 职责

Controller 层负责：

- 接收 HTTP 请求
- 调用 Service 处理业务逻辑
- 返回 HTTP 响应

### Controller 示例

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @ApiOperation({ summary: '分页查询用户列表' })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAll(queryDto)
  }
}
```

## 错误处理

### 使用 NestJS 异常

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'

// 资源不存在
throw new NotFoundException('用户不存在')

// 参数错误
throw new BadRequestException('参数验证失败')

// 资源冲突
throw new ConflictException('用户名已存在')

// 未授权
throw new UnauthorizedException('未登录')

// 禁止访问
throw new ForbiddenException('权限不足')
```

### 全局异常处理

全局异常过滤器会自动处理所有异常，统一返回格式：

```json
{
  "code": 404,
  "message": "用户不存在",
  "error": "Not Found"
}
```

## 日志记录

### 使用 NestJS Logger

```typescript
import { Logger } from '@nestjs/common'

export class UserService {
  private readonly logger = new Logger(UserService.name)

  async create(createUserDto: CreateUserDto) {
    this.logger.log('创建用户', { username: createUserDto.username })
    try {
      // ...
    } catch (error) {
      this.logger.error('创建用户失败', error.stack)
      throw error
    }
  }
}
```

### 日志级别

- `logger.log()` - 一般信息
- `logger.error()` - 错误信息
- `logger.warn()` - 警告信息
- `logger.debug()` - 调试信息
- `logger.verbose()` - 详细信息

## 测试

### 单元测试

为 Service 编写单元测试：

```typescript
describe('UserService', () => {
  let service: UserService
  let repository: Repository<User>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should create user', async () => {
    const createUserDto = { username: 'test', email: 'test@example.com', password: '123456' }
    const result = await service.create(createUserDto)
    expect(result).toBeDefined()
  })
})
```

### E2E 测试

测试 API 端点：

```typescript
describe('Users (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ username: 'test', email: 'test@example.com', password: '123456' })
      .expect(201)
  })
})
```

## 性能优化

### 数据库优化

- **使用索引**：为常用查询字段添加索引
- **避免 N+1 查询**：使用 `relations` 或 `join` 预加载关联数据
- **分页查询**：使用 `skip` 和 `take` 实现分页
- **查询优化**：只查询需要的字段

```typescript
// ✅ 使用 relations 预加载
const users = await this.userRepository.find({
  relations: ['department', 'roles'],
})

// ❌ 避免 N+1 查询
const users = await this.userRepository.find()
for (const user of users) {
  user.department = await this.departmentRepository.findOne({ where: { id: user.deptId } })
}
```

### 缓存策略

对于频繁查询的数据，可以考虑使用缓存：

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'

constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

async findOne(id: number) {
  const cached = await this.cacheManager.get(`user:${id}`)
  if (cached) {
    return cached
  }

  const user = await this.userRepository.findOne({ where: { id } })
  await this.cacheManager.set(`user:${id}`, user, 3600)
  return user
}
```

## 安全实践

### 密码加密

使用 bcrypt 加密密码：

```typescript
import * as bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 10)
const isMatch = await bcrypt.compare(password, hashedPassword)
```

### 参数验证

使用 DTO 和 class-validator 验证所有输入：

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // DTO 会自动验证数据
}
```

### SQL 注入防护

使用 TypeORM 的参数化查询，避免直接拼接 SQL：

```typescript
// ✅ 正确：使用参数化查询
queryBuilder.where('user.username LIKE :username', { username: `%${username}%` })

// ❌ 错误：直接拼接 SQL
queryBuilder.where(`user.username LIKE '%${username}%'`)
```

### 权限控制

使用 Guard 保护路由：

```typescript
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  // ...
}
```

## 调试技巧

### 使用日志

```typescript
this.logger.debug('变量值', { variable: value })
this.logger.log('执行流程', { step: 'step1' })
```

### 使用调试器

启动调试模式：

```bash
pnpm run start:debug
```

在 VS Code 中配置调试：

```json
{
  "type": "node",
  "request": "attach",
  "name": "Debug NestJS",
  "port": 9229
}
```

## 代码审查清单

提交代码前检查：

- [ ] 代码符合 TypeScript 规范
- [ ] 所有 DTO 都有验证规则
- [ ] Service 方法有错误处理
- [ ] Controller 有 Swagger 文档
- [ ] 有适当的日志记录
- [ ] 性能考虑合理（索引、分页等）
- [ ] 安全性检查通过（密码加密、参数验证等）
- [ ] 测试通过

## 下一步

- 查看 [项目配置](./configuration.md) 了解配置详情
- 查看 [API 开发](./api.md) 了解接口开发规范
- 查看 [数据库设计](./database.md) 了解数据模型


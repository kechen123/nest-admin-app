# API 开发

本文档介绍后端 API 接口开发规范和最佳实践。

## API 基础信息

- **Base URL**: `http://localhost:3000/api`
- **API 版本**: v1
- **数据格式**: JSON
- **认证方式**: JWT Bearer Token

## 接口开发流程

开发一个完整的 API 接口通常包括以下步骤：

1. **定义 Entity**：创建数据库实体
2. **定义 DTO**：创建数据传输对象
3. **实现 Service**：编写业务逻辑
4. **实现 Controller**：处理 HTTP 请求
5. **配置 Module**：注册模块依赖

## 认证方式

### 获取 Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 使用 Token

在请求头中添加 Authorization：

```http
Authorization: Bearer <token>
```

### 保护路由

使用 `@UseGuards(JwtAuthGuard)` 保护路由：

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  // ...
}
```

## 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

## HTTP 状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误（参数验证失败）
- `401`: 未授权（Token 无效或过期）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器错误

## DTO 开发

### 创建 DTO

DTO（Data Transfer Object）用于定义数据传输格式和验证规则。

#### Create DTO

```typescript
// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string
}
```

#### Update DTO

```typescript
// dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickname?: string
}
```

#### Query DTO

```typescript
// dto/query-user.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QueryUserDto extends PaginationDto {
  @ApiProperty({ description: '用户名（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  username?: string

  @ApiProperty({ description: '邮箱（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  email?: string
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

## Controller 开发

### 基础 Controller

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { UseGuards } from '@nestjs/common'

@ApiTags('用户管理')
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

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询用户' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id)
  }
}
```

### RESTful 路由规范

- `GET /users` - 获取列表
- `GET /users/:id` - 获取详情
- `POST /users` - 创建
- `PATCH /users/:id` - 更新（部分）
- `PUT /users/:id` - 更新（全部）
- `DELETE /users/:id` - 删除

## Service 开发

### 基础 Service

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })
    return this.userRepository.save(user)
  }

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

    return {
      list,
      total,
      page,
      pageSize,
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
    Object.assign(user, updateUserDto)
    return this.userRepository.save(user)
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    return this.userRepository.remove(user)
  }
}
```

## Swagger 文档

### 添加 API 文档

使用装饰器添加 Swagger 文档：

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('用户管理')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }
}
```

### 访问 Swagger

启动服务后访问：`http://localhost:3000/api`

## 错误处理

### 抛出异常

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common'

// 资源不存在
throw new NotFoundException('用户不存在')

// 参数错误
throw new BadRequestException('参数验证失败')
```

### 全局异常处理

全局异常过滤器会自动处理所有异常，统一返回格式。

## 最佳实践

### 1. 使用 DTO 验证

所有输入数据都应该使用 DTO 进行验证：

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // DTO 会自动验证数据
}
```

### 2. 使用类型安全

充分利用 TypeScript 的类型系统：

```typescript
async findOne(id: number): Promise<User> {
  // 返回类型明确
}
```

### 3. 统一响应格式

使用拦截器统一响应格式，确保所有接口返回格式一致。

### 4. 错误处理

使用 NestJS 内置异常类，不要直接返回错误对象：

```typescript
// ✅ 正确
throw new NotFoundException('用户不存在')

// ❌ 错误
return { error: '用户不存在' }
```

### 5. 分页查询

统一使用分页 DTO：

```typescript
export class QueryUserDto extends PaginationDto {
  // 查询条件
}
```

## 下一步

- 查看 [项目结构](./structure.md) 了解目录组织
- 查看 [数据库设计](./database.md) 了解数据模型
- 查看 [开发指南](./development.md) 了解开发规范


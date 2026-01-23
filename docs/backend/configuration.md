# 项目配置

本文档介绍后端项目的配置项和配置方法。

## 环境变量配置

### 环境变量文件

项目支持通过环境变量进行配置，环境变量文件命名规则：

- `.env` - 所有环境都会加载
- `.env.local` - 本地环境配置（优先级最高，会被 git 忽略）

### 配置项说明

在 `backend/.env.example` 中查看完整的配置模板，主要配置项包括：

```env
# 应用配置
NODE_ENV=development          # 环境：development/production
PORT=3000                     # 服务端口
CORS_ORIGIN=*                 # CORS 允许的源，多个用逗号分隔

# 数据库配置
DB_HOST=localhost             # 数据库主机
DB_PORT=3306                  # 数据库端口
DB_USERNAME=root              # 数据库用户名
DB_PASSWORD=root              # 数据库密码
DB_DATABASE=yl_db             # 数据库名称

# JWT 配置
JWT_SECRET=your-secret-key    # JWT 密钥（生产环境请使用强密钥）
JWT_EXPIRES_IN=7d            # Token 过期时间

# 文件上传配置
UPLOAD_DEST=./uploads        # 上传文件存储目录（本地存储接口使用）
MAX_FILE_SIZE=10485760       # 最大文件大小（字节）

# 腾讯云COS配置（可选，用于COS上传接口）
COS_SECRET_ID=您的SecretId           # 腾讯云SecretId
COS_SECRET_KEY=您的SecretKey         # 腾讯云SecretKey
COS_BUCKET=examplebucket-1250000000  # 存储桶名称
COS_REGION=ap-beijing                # 地域（如：ap-beijing、ap-shanghai等）
COS_DOMAIN=https://your-domain.com   # 可选：自定义域名（如果不配置则使用COS默认域名）
```

### 配置加载

项目使用 `@nestjs/config` 模块加载环境变量：

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    join(__dirname, '..', '.env.local'),
    join(__dirname, '..', '.env'),
  ],
})
```

### 使用配置

在代码中使用配置：

```typescript
import { ConfigService } from '@nestjs/config'

constructor(private configService: ConfigService) {}

// 获取配置
const port = this.configService.get<number>('PORT', 3000)
const dbHost = this.configService.get<string>('DB_HOST')
```

## 数据库配置

### TypeORM 配置

数据库配置在 `app.module.ts` 中：

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', 'root'),
    database: configService.get<string>('DB_DATABASE', 'yl_db'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false, // 禁用自动同步，使用迁移管理
    logging: configService.get<string>('NODE_ENV') === 'development',
    timezone: '+08:00',
  }),
})
```

### 重要配置说明

- **synchronize**: 设置为 `false`，禁用自动同步表结构，使用 SQL 脚本管理数据库
- **entities**: 自动加载所有 `.entity.ts` 文件
- **logging**: 开发环境启用 SQL 日志，生产环境关闭
- **timezone**: 设置时区为东八区

## 应用配置

### 全局前缀

所有 API 路由都添加了 `/api` 前缀：

```typescript
// main.ts
app.setGlobalPrefix('api')
```

访问示例：`http://localhost:3000/api/users`

### CORS 配置

跨域资源共享配置：

```typescript
app.enableCors({
  origin: corsOrigin.split(',').map((origin) => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
})
```

### 静态文件服务

配置上传文件的静态访问：

```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads',
})
```

访问示例：`http://localhost:3000/uploads/image.jpg`

## 验证管道配置

全局验证管道配置：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // 自动去除未定义的属性
    forbidNonWhitelisted: true,   // 禁止未定义的属性
    transform: true,               // 自动转换类型
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
)
```

### 验证规则

使用 `class-validator` 装饰器定义验证规则：

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string

  @IsEmail()
  email: string
}
```

## 异常处理配置

### 全局异常过滤器

统一处理所有异常：

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 统一异常处理逻辑
  }
}
```

注册全局过滤器：

```typescript
app.useGlobalFilters(new HttpExceptionFilter())
```

### 响应拦截器

统一响应格式：

```typescript
// common/interceptors/transform.interceptor.ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
      }))
    )
  }
}
```

注册全局拦截器：

```typescript
app.useGlobalInterceptors(new TransformInterceptor())
```

## JWT 配置

### JWT 模块配置

在 `auth.module.ts` 中配置：

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
    },
  }),
  inject: [ConfigService],
})
```

### JWT 策略配置

```typescript
// auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }
  }
}
```

## Swagger 配置

### Swagger 设置

Swagger 文档配置在 `common/swagger/swagger.setup.ts`：

```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
  },
})
```

访问地址：`http://localhost:3000/api`

### API 文档注解

使用装饰器添加 API 文档：

```typescript
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  @ApiOperation({ summary: '获取用户列表' })
  @Get()
  findAll() {
    // ...
  }
}
```

## 文件上传配置

### 腾讯云COS配置

项目使用腾讯云对象存储（COS）来存储上传的图片文件。

#### 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# 腾讯云COS配置
COS_SECRET_ID=您的SecretId           # 腾讯云SecretId
COS_SECRET_KEY=您的SecretKey         # 腾讯云SecretKey
COS_BUCKET=examplebucket-1250000000  # 存储桶名称
COS_REGION=ap-beijing                # 地域（如：ap-beijing、ap-shanghai等）
COS_DOMAIN=https://your-domain.com   # 可选：自定义域名（如果不配置则使用COS默认域名）
```

#### 获取配置信息

1. **SecretId 和 SecretKey**：
   - 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
   - 进入 [访问管理](https://console.cloud.tencent.com/cam) → API密钥管理
   - 创建或查看密钥，获取 SecretId 和 SecretKey

2. **Bucket 和 Region**：
   - 进入 [对象存储控制台](https://console.cloud.tencent.com/cos)
   - 创建或选择存储桶
   - 在存储桶详情中查看存储桶名称（Bucket）和所属地域（Region）

3. **自定义域名（可选）**：
   - 在存储桶的"域名管理"中配置自定义域名
   - 配置后可以使用自定义域名访问文件

#### 上传接口

项目提供两个上传接口：

**1. 本地存储接口：`POST /api/upload/image`**
- 文件存储在服务器本地 `./uploads/images` 目录
- 不需要额外配置，开箱即用
- 适用于开发环境或小规模应用

**2. COS上传接口：`POST /api/upload/image/cos`**
- 文件上传到腾讯云对象存储
- 需要配置COS相关环境变量
- 适用于生产环境，支持CDN加速

**请求参数：**
- `file`: 图片文件（multipart/form-data）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/images/xxx.jpg",
    "path": "images/xxx.jpg",
    "filename": "xxx.jpg",
    "originalname": "photo.jpg",
    "mimetype": "image/jpeg",
    "size": 102400
  }
}
```

#### Multer 配置

**本地存储接口**使用磁盘存储：

```typescript
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/images',
      filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${extname(file.originalname)}`
        cb(null, uniqueName)
      },
    }),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new BadRequestException('只允许上传图片文件'), false)
      }
    },
  })
)
```

**COS上传接口**使用内存存储以便获取文件流：

```typescript
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

@UseInterceptors(
  FileInterceptor('file', {
    storage: memoryStorage(), // 使用内存存储
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new BadRequestException('只允许上传图片文件'), false)
      }
    },
  })
)
```

## 日志配置

### 开发环境日志

开发环境启用 TypeORM SQL 日志：

```typescript
logging: configService.get<string>('NODE_ENV') === 'development'
```

### 应用日志

使用 NestJS 内置日志：

```typescript
import { Logger } from '@nestjs/common'

const logger = new Logger('App')

logger.log('应用启动成功')
logger.error('错误信息', error.stack)
logger.warn('警告信息')
logger.debug('调试信息')
```

## 性能优化配置

### 信任代理

配置信任代理以正确获取客户端 IP：

```typescript
app.set('trust proxy', true)
```

### 生产环境优化

生产环境配置：

- 关闭 SQL 日志：`logging: false`
- 移除 console：使用构建工具移除
- 启用压缩：使用 Nginx 或 Express 压缩中间件

## 下一步

- 查看 [项目结构](./structure.md) 了解目录组织
- 查看 [API 开发](./api.md) 了解接口开发规范
- 查看 [数据库设计](./database.md) 了解数据模型


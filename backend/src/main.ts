import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const corsOrigin = configService.get<string>("CORS_ORIGIN", "*");

  // 全局前缀
  app.setGlobalPrefix("api");

  // 配置信任代理，以便正确获取客户端 IP 地址
  app.set("trust proxy", true);

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除未定义的属性
      forbidNonWhitelisted: true, // 禁止未定义的属性
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS 配置
  app.enableCors({
    origin: corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Authorization"],
  });

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>("SWAGGER_TITLE", "API 文档"))
    .setDescription(configService.get<string>("SWAGGER_DESCRIPTION", "API 文档 - 管理端和小程序端接口文档"))
    .setVersion(configService.get<string>("SWAGGER_VERSION", "1.0"))
    // ========== 管理端接口标签 ==========
    .addTag("认证管理", "管理员登录、个人信息等认证相关接口")
    .addTag("用户管理", "系统用户管理接口")
    .addTag("角色管理", "角色权限管理接口")
    .addTag("菜单管理", "系统菜单管理接口")
    .addTag("权限管理", "权限点管理接口")
    .addTag("部门管理", "部门组织架构管理接口")
    .addTag("岗位管理", "岗位信息管理接口")
    .addTag("字典管理", "数据字典管理接口")
    .addTag("商品管理", "商品信息管理接口")
    .addTag("商品分类管理", "商品分类管理接口")
    .addTag("订单管理", "订单管理接口")
    .addTag("小程序用户管理", "小程序用户管理接口")
    .addTag("登录日志", "登录日志查询接口")
    .addTag("操作日志", "操作日志查询接口")
    .addTag("服务监控", "系统服务监控接口")
    .addTag("文件上传", "文件上传接口")
    // ========== 小程序端接口标签 ==========
    .addTag("小程序认证", "小程序用户认证相关接口")
    .addTag("小程序-商品", "小程序商品相关接口")
    .addTag("小程序-订单", "小程序订单相关接口")
    .addTag("小程序-购物车", "小程序购物车相关接口")
    .addTag("小程序-收货地址", "小程序收货地址相关接口")
    .addTag("小程序-个人中心", "小程序个人中心相关接口")
    .addTag("小程序-轮播图", "小程序轮播图相关接口")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "请输入 JWT Token",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 添加全局 security 配置，使所有接口默认需要 JWT 认证
  // 这样 Scalar 会自动显示认证输入框
  // 注意：这里设置为全局，但实际某些接口（如登录接口）可能不需要认证
  // 可以在具体的 Controller 中使用 @ApiSecurity('') 来覆盖全局配置
  document.security = [
    {
      "JWT-auth": [] as string[],
    },
  ];

  // 添加标签分组（用于 Swagger UI 的菜单分组显示）
  // 注意：这需要 Swagger UI 4.9.0+ 版本支持
  document["x-tagGroups"] = [
    {
      name: "📱 管理端接口",
      tags: ["认证管理", "用户管理", "角色管理", "菜单管理", "权限管理", "部门管理", "岗位管理", "字典管理", "商品管理", "商品分类管理", "订单管理", "小程序用户管理", "登录日志", "操作日志", "服务监控", "文件上传"],
    },
    {
      name: "🛒 小程序端接口",
      tags: ["小程序认证", "小程序-商品", "小程序-订单", "小程序-购物车", "小程序-收货地址", "小程序-个人中心", "小程序-轮播图"],
    },
  ];

  // 使用 Scalar 替代 Swagger UI
  // Scalar 提供更现代的 UI 和更好的导航体验
  // 注意：getHttpAdapter().get() 注册的路由不会自动应用全局前缀
  // 所以需要手动加上全局前缀，或者使用完整路径
  const swaggerPathConfig = configService.get<string>("SWAGGER_PATH", "api");
  const globalPrefix = "api";

  // 构建完整路径：如果配置是 "api"，则使用 "/api"，否则使用 "/api/{配置路径}"
  const scalarRoute = swaggerPathConfig === "api" ? `/${globalPrefix}` : swaggerPathConfig.startsWith("/") ? `/${globalPrefix}${swaggerPathConfig}` : `/${globalPrefix}/${swaggerPathConfig}`;

  app.getHttpAdapter().get(scalarRoute, (req: any, res: any) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>API 文档</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/favicon.png" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="${scalarRoute}-json"
            data-configuration='{
              "theme": "default",
              "layout": "modern",
              "defaultHttpClient": {
                "targetKey": "javascript",
                "clientKey": "fetch"
              },
              "hideDownloadButton": false,
              "hideModels": false,
              "hideSidebar": false,
              "sidebar": {
                "showOperations": true,
                "showServers": true,
                "showModels": true
              },
              "searchHotKey": "k",
              "i18n": {
                "locale": "zh-CN"
              },
              "metaData": {
                "title": "${configService.get<string>("SWAGGER_TITLE", "API 文档")}",
                "description": "${configService.get<string>("SWAGGER_DESCRIPTION", "API 文档 - 管理端和小程序端接口文档")}",
                "version": "${configService.get<string>("SWAGGER_VERSION", "1.0")}"
              },
              "tagGroups": [
                {
                  "name": "📱 管理端接口",
                  "tags": ["认证管理", "用户管理", "角色管理", "菜单管理", "权限管理", "部门管理", "岗位管理", "字典管理", "商品管理", "商品分类管理", "订单管理", "小程序用户管理", "登录日志", "操作日志", "服务监控", "文件上传"]
                },
                {
                  "name": "🛒 小程序端接口",
                  "tags": ["小程序认证", "小程序-商品", "小程序-订单", "小程序-购物车", "小程序-收货地址", "小程序-个人中心", "小程序-轮播图"]
                }
              ]
            }'
          ></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js"></script>
        </body>
      </html>
    `);
  });

  // 提供 OpenAPI JSON
  const jsonRoute = `${scalarRoute}-json`;
  app.getHttpAdapter().get(jsonRoute, (req: any, res: any) => {
    res.json(document);
  });

  // 保留 SwaggerModule 用于生成文档（但不设置 UI）
  // SwaggerModule.setup 已被上面的 Scalar 替代

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}${scalarRoute}`);
}
bootstrap();

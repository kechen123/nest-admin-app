import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { SwaggerSetup } from "./common/swagger/swagger.setup";

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
    origin: (origin, callback) => {
      // 如果 CORS_ORIGIN 为 "*"，允许所有来源
      if (corsOrigin === "*") {
        callback(null, true);
        return;
      }
      
      const allowedOrigins = corsOrigin.split(",").map((origin) => origin.trim());
      
      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // 检查是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      
      // 开发环境：允许本地 IP 访问（192.168.x.x, 10.x.x.x, 172.16-31.x.x）
      // 匹配格式：http://192.168.x.x:port 或 https://192.168.x.x:port
      const isLocalNetwork = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)(:\d+)?/.test(origin);
      if (isLocalNetwork && configService.get<string>("NODE_ENV") !== "production") {
        callback(null, true);
        return;
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Authorization"],
  });

  // 设置 Swagger 文档
  SwaggerSetup.setup(app, configService);

  // 监听所有网络接口（0.0.0.0），允许通过本地 IP 访问
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Application is also accessible via your local IP: http://<your-ip>:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api`);
}
bootstrap();

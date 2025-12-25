import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./auth/auth.module";
import { PermissionModule } from "./modules/permission/permission.module";
import { RoleModule } from "./modules/role/role.module";
import { MenuModule } from "./modules/menu/menu.module";
import { UploadModule } from "./modules/upload/upload.module";
import { DictModule } from "./modules/dict/dict.module";
import { DepartmentModule } from "./modules/department/department.module";
import { PostModule } from "./modules/post/post.module";
import { OperationLogModule } from "./modules/operation-log/operation-log.module";
import { LoginLogModule } from "./modules/login-log/login-log.module";
import { MonitorModule } from "./modules/monitor/monitor.module";
import { MiniappModule } from "./miniapp/miniapp.module";
import { MallModule } from "./modules/mall/mall.module";

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, "..", ".env.local"), join(__dirname, "..", ".env")],
    }),
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // #region agent log
        fetch("http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "app.module.ts:20", message: "TypeORM配置开始", data: { synchronize: configService.get<string>("NODE_ENV") !== "production", database: configService.get<string>("DB_DATABASE", "myapp_db") }, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "A" }) }).catch(() => {});
        // #endregion

        // 禁用 synchronize，使用 SQL 初始化脚本管理数据库结构
        // synchronize 会在启动时自动修改表结构，可能导致数据丢失
        const synchronize = false;

        // #region agent log
        fetch("http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "app.module.ts:35", message: "TypeORM配置完成", data: { synchronize }, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "A" }) }).catch(() => {});
        // #endregion

        return {
          type: "mysql" as const,
          host: configService.get<string>("DB_HOST", "localhost"),
          port: configService.get<number>("DB_PORT", 3306),
          username: configService.get<string>("DB_USERNAME", "root"),
          password: configService.get<string>("DB_PASSWORD", "root"),
          database: configService.get<string>("DB_DATABASE", "myapp_db"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize,
          logging: configService.get<string>("NODE_ENV") === "development",
          timezone: "+08:00",
        };
      },
      inject: [ConfigService],
    }),
    // 业务模块
    UserModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    MenuModule,
    UploadModule,
    DictModule,
    DepartmentModule,
    PostModule,
    OperationLogModule,
    LoginLogModule,
    MonitorModule,
    // 小程序模块
    MiniappModule,
    // 商城管理模块
    MallModule,
  ],
})
export class AppModule {}

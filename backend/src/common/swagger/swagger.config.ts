import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

/**
 * Swagger 配置
 */
export class SwaggerConfig {
  /**
   * 管理端接口标签
   */
  static readonly ADMIN_TAGS = [
    '用户管理',
    '角色管理',
    '权限管理',
    '菜单管理',
    '部门管理',
    '岗位管理',
    '字典管理',
    '登录日志',
    '操作日志',
    '服务监控',
    '文件上传',
  ];

  /**
   * 前端页面接口标签
   */
  static readonly FRONTEND_TAGS = [
    '认证',
    '小程序用户',
    '用户绑定',
    '打卡记录',
    '文件上传',
  ];

  /**
   * 创建 Swagger 基础配置
   */
  static createDocumentBuilder(configService: ConfigService): DocumentBuilder {
    return new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'API Documentation'))
      .setDescription(
        configService.get<string>('SWAGGER_DESCRIPTION', 'API Documentation'),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // 这个名称用于在 Controller 中使用 @ApiBearerAuth('JWT-auth')
      );
  }
}


import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfig } from './swagger.config';
import { SwaggerService } from './swagger.service';
import { OpenAPIObject } from '@nestjs/swagger';

/**
 * 设置 Swagger 文档
 */
export class SwaggerSetup {
  /**
   * 初始化并设置 Swagger 文档
   */
  static setup(app: INestApplication, configService: ConfigService): void {
    // 创建 Swagger 配置
    const baseConfig = SwaggerConfig.createDocumentBuilder(
      configService,
    ).build();

    // 创建完整的 OpenAPI 文档
    const fullDocument = SwaggerModule.createDocument(app, baseConfig);

    // 创建分类文档
    const adminDocument = SwaggerService.createAdminDocument(fullDocument);
    const frontendDocument = SwaggerService.createFrontendDocument(
      fullDocument,
    );

    // 设置路由
    this.setupRoutes(app, adminDocument, frontendDocument);
  }

  /**
   * 设置文档路由
   */
  private static setupRoutes(
    app: INestApplication,
    adminDocument: OpenAPIObject,
    frontendDocument: OpenAPIObject,
  ): void {
    const httpAdapter = app.getHttpAdapter();

    // 提供 OpenAPI JSON 端点
    httpAdapter.get('/api-docs/admin.json', (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(adminDocument);
    });

    httpAdapter.get('/api-docs/frontend.json', (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(frontendDocument);
    });

    // 设置统一的 Scalar 文档页面
    httpAdapter.get('/api', (req: any, res: any) => {
      const html = SwaggerService.generateUnifiedScalarHTML();
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });

    // 设置独立的 Scalar 页面（用于 iframe）
    httpAdapter.get('/api-docs/admin-page', (req: any, res: any) => {
      const html = SwaggerService.generateScalarPage(
        '/api-docs/admin.json',
        '管理端 API 文档',
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });

    httpAdapter.get('/api-docs/frontend-page', (req: any, res: any) => {
      const html = SwaggerService.generateScalarPage(
        '/api-docs/frontend.json',
        '前端页面 API 文档',
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });
  }
}


import { OpenAPIObject } from '@nestjs/swagger';
import { SwaggerConfig } from './swagger.config';

/**
 * Swagger 文档服务
 */
export class SwaggerService {
  /**
   * 根据标签过滤文档
   */
  static filterDocumentByTags(
    document: OpenAPIObject,
    allowedTags: string[],
  ): OpenAPIObject {
    const filtered = JSON.parse(JSON.stringify(document));

    if (filtered.paths) {
      Object.keys(filtered.paths).forEach((path) => {
        Object.keys(filtered.paths[path]).forEach((method) => {
          const operation = filtered.paths[path][method];
          if (operation.tags && operation.tags.length > 0) {
            const hasAllowedTag = operation.tags.some((tag: string) =>
              allowedTags.includes(tag),
            );
            if (!hasAllowedTag) {
              delete filtered.paths[path][method];
            }
          } else {
            delete filtered.paths[path][method];
          }
        });
        // 如果路径下没有方法了，删除该路径
        if (Object.keys(filtered.paths[path]).length === 0) {
          delete filtered.paths[path];
        }
      });
    }

    // 过滤 tags
    if (filtered.tags) {
      filtered.tags = filtered.tags.filter((tag: any) =>
        allowedTags.includes(tag.name),
      );
    }

    return filtered;
  }

  /**
   * 创建管理端文档
   */
  static createAdminDocument(
    fullDocument: OpenAPIObject,
  ): OpenAPIObject {
    const adminDocument = this.filterDocumentByTags(
      fullDocument,
      SwaggerConfig.ADMIN_TAGS,
    );
    adminDocument.info = {
      ...adminDocument.info,
      title: '管理端 API 文档',
      description: '管理端接口文档',
    };
    return adminDocument;
  }

  /**
   * 创建前端文档
   */
  static createFrontendDocument(
    fullDocument: OpenAPIObject,
  ): OpenAPIObject {
    const frontendDocument = this.filterDocumentByTags(
      fullDocument,
      SwaggerConfig.FRONTEND_TAGS,
    );
    frontendDocument.info = {
      ...frontendDocument.info,
      title: '前端页面 API 文档',
      description: '前端页面接口文档',
    };
    return frontendDocument;
  }

  /**
   * 生成统一的 Scalar HTML 页面（带标签页切换）
   */
  static generateUnifiedScalarHTML(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 文档</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .tab-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .tabs {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .tab {
      padding: 16px 24px;
      cursor: pointer;
      border: none;
      background: transparent;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab:hover {
      color: #111827;
      background: #f9fafb;
    }
    .tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }
    .scalar-container {
      margin-top: 57px;
      height: calc(100vh - 57px);
    }
    .scalar-wrapper {
      display: none;
      height: 100%;
      width: 100%;
    }
    .scalar-wrapper.active {
      display: block;
    }
    .scalar-wrapper > * {
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="tab-container">
    <div class="tabs">
      <button class="tab active" data-tab="admin">管理端接口</button>
      <button class="tab" data-tab="frontend">前端页面接口</button>
    </div>
  </div>
  
  <div class="scalar-container">
    <div class="scalar-wrapper active" id="admin-wrapper">
      <iframe id="admin-iframe" src="/api-docs/admin-page" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
    <div class="scalar-wrapper" id="frontend-wrapper">
      <iframe id="frontend-iframe" src="/api-docs/frontend-page" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
  </div>

  <script>
    function switchTab(tabName) {
      // 更新标签页状态
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
          tab.classList.add('active');
        }
      });
      
      // 更新内容显示
      document.querySelectorAll('.scalar-wrapper').forEach(wrapper => {
        wrapper.classList.remove('active');
      });
      
      const activeWrapper = document.getElementById(tabName + '-wrapper');
      if (activeWrapper) {
        activeWrapper.classList.add('active');
      }
    }
    
    // 标签页切换事件
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, setting up tabs');
      
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          console.log('Tab clicked:', tab.dataset.tab);
          switchTab(tab.dataset.tab);
        });
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * 生成单个 Scalar 页面（用于 iframe）
   */
  static generateScalarPage(specUrl: string, title: string): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script
    id="api-reference"
    type="application/json"
    data-configuration='{"theme":"default","layout":"modern","spec":{"url":"${specUrl}"}}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js"></script>
</body>
</html>`;
  }
}


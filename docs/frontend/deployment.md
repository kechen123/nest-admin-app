# 前端构建部署

本文档介绍前端项目的构建和部署流程。

## 构建

### 开发环境构建

```bash
npm run web:start
```

### 生产环境构建

```bash
# 在容器中构建
docker-compose -f docker-compose.prod.yml build web

# 本地构建
cd frontend
npm run build
```

## 构建产物

构建完成后，产物通常位于：

```
frontend/dist/
```

## 部署

### Docker 部署

使用 Docker Compose 部署：

```bash
# 生产环境部署
npm run prod:up

# 仅部署前端
npm run deploy:web
```

### 静态文件部署

如果只需要部署静态文件：

1. 构建项目：`npm run build`
2. 将 `dist/` 目录上传到服务器
3. 配置 Web 服务器（Nginx/Apache）

## 环境变量

生产环境需要配置以下环境变量：

- `VITE_API_BASE_URL`: API 基础地址
- `VITE_APP_TITLE`: 应用标题
- 其他环境相关配置

## 性能优化

### 构建优化

- 启用代码分割
- 压缩资源文件
- 启用 Tree Shaking

### 运行时优化

- 启用 CDN 加速
- 配置缓存策略
- 启用 Gzip 压缩

## 监控

部署后需要监控：

- 页面加载时间
- API 请求成功率
- 错误日志
- 用户行为分析

## 回滚

如果部署出现问题，可以快速回滚：

```bash
# 回滚到上一个版本
docker-compose -f docker-compose.prod.yml down
# 重新部署上一个版本
```


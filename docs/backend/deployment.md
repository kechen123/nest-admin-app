# 后端部署指南

本文档介绍后端项目的部署流程和注意事项。

## 部署前准备

### 环境检查

- Docker 和 Docker Compose 已安装
- 环境变量已配置
- 数据库已准备就绪
- 依赖包已安装

### 配置文件

确保生产环境配置文件正确：

- `.env.production`
- 数据库连接配置
- API 密钥和令牌
- 其他服务配置

## 构建

### Docker 构建

```bash
# 构建生产镜像
npm run prod:build

# 或仅构建后端
docker-compose -f docker-compose.prod.yml build backend
```

### 本地构建

```bash
cd backend
npm run build  # 或相应的构建命令
```

## 部署

### 使用 Docker Compose

```bash
# 启动生产环境
npm run prod:up

# 仅启动后端
docker-compose -f docker-compose.prod.yml up -d backend
```

### 使用部署脚本

```bash
# 部署所有服务
npm run deploy

# 仅部署后端
npm run deploy:backend
```

## 数据库迁移

部署后需要运行数据库迁移：

```bash
npm run backend:init-db
```

## 健康检查

部署完成后进行健康检查：

```bash
# 检查服务状态
npm run health

# 检查进程状态
npm run ps

# 验证 API
curl http://your-domain.com/api/health
```

## 监控

### 日志监控

```bash
# 查看日志
npm run prod:logs

# 查看后端日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 性能监控

- API 响应时间
- 数据库查询性能
- 服务器资源使用
- 错误率统计

## 回滚

如果部署出现问题，可以快速回滚：

```bash
# 停止当前版本
docker-compose -f docker-compose.prod.yml down

# 回滚到上一个版本
# （需要版本管理策略）
```

## 备份

### 数据库备份

```bash
# 备份数据库
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p database_name > backup_$(date +%Y%m%d).sql
```

### 配置文件备份

确保配置文件已备份到安全位置。

## 安全注意事项

- 使用 HTTPS
- 配置防火墙规则
- 限制数据库访问
- 定期更新依赖包
- 监控异常访问

## 性能优化

- 启用缓存
- 配置负载均衡（如需要）
- 优化数据库查询
- 使用 CDN（如适用）

## 维护

### 定期任务

- 检查日志文件大小
- 清理旧数据
- 更新依赖包
- 备份数据库

### 更新流程

1. 在测试环境验证
2. 备份生产数据
3. 部署新版本
4. 验证功能
5. 监控错误日志

## 故障排查

常见问题：

1. **服务无法启动**
   - 检查端口是否被占用
   - 查看日志文件
   - 验证环境变量

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接配置
   - 检查网络连接

3. **API 响应慢**
   - 检查数据库查询性能
   - 查看服务器资源使用
   - 分析慢查询日志


# 前端开发指南

本文档介绍前端开发的规范和最佳实践。

## 开发流程

1. 从主分支创建功能分支
2. 进行开发和测试
3. 提交代码并创建 Pull Request
4. 代码审查后合并

## 代码规范

### 组件开发

- 使用函数式组件或组合式 API
- 保持组件单一职责
- 合理使用 Props 和 Events

### 样式规范

- 使用 CSS Modules 或 Scoped CSS
- 遵循 BEM 命名规范
- 使用 CSS 变量管理主题

### 状态管理

- 合理使用全局状态和局部状态
- 避免过度使用状态管理库
- 保持状态的可预测性

## API 调用

### 请求封装

使用统一的 API 请求封装：

```javascript
import { request } from '@/utils/request'

export function getUserInfo(id) {
  return request.get(`/api/users/${id}`)
}
```

### 错误处理

统一处理 API 错误：

```javascript
try {
  const data = await getUserInfo(1)
} catch (error) {
  // 统一错误处理
  handleError(error)
}
```

## 性能优化

- 使用懒加载路由
- 图片使用懒加载
- 合理使用缓存
- 避免不必要的重渲染

## 测试

- 编写单元测试
- 进行组件测试
- 端到端测试

## 调试技巧

### 使用浏览器 DevTools

- React DevTools / Vue DevTools
- Network 面板查看请求
- Console 查看日志

### 使用日志

```javascript
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

## 下一步

- 查看 [构建部署](./deployment.md) 了解部署流程


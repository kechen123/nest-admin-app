# API 接口文档

本文档整理了后端所有的 API 接口，按照管理端和前端页面进行分类。

## 一、管理端接口

### 1. 认证相关 (`/api/auth`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/auth/login` | 用户登录 | ❌ |
| GET | `/api/auth/profile` | 获取当前用户信息 | ✅ |
| PATCH | `/api/auth/profile` | 更新个人信息 | ✅ |
| POST | `/api/auth/change-password` | 修改密码 | ✅ |
| POST | `/api/auth/logout` | 退出登录 | ✅ |

### 2. 用户管理 (`/api/users`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/users` | 创建用户 | ✅ |
| GET | `/api/users` | 分页查询用户列表 | ✅ |
| GET | `/api/users/:id` | 根据ID查询用户 | ✅ |
| PATCH | `/api/users/:id` | 更新用户 | ✅ |
| DELETE | `/api/users/:id` | 删除用户 | ✅ |

### 3. 角色管理 (`/api/roles`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/roles` | 创建角色 | ✅ |
| GET | `/api/roles/all` | 获取所有角色列表（不分页） | ✅ |
| GET | `/api/roles` | 分页查询角色列表 | ✅ |
| GET | `/api/roles/:id` | 根据ID查询角色 | ✅ |
| PATCH | `/api/roles/:id` | 更新角色 | ✅ |
| POST | `/api/roles/:id/permissions` | 分配权限 | ✅ |
| POST | `/api/roles/:id/menus` | 分配菜单 | ✅ |
| DELETE | `/api/roles/:id` | 删除角色 | ✅ |

### 4. 权限管理 (`/api/permissions`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/permissions` | 创建权限 | ✅ |
| GET | `/api/permissions/tree` | 获取权限树 | ✅ |
| GET | `/api/permissions` | 分页查询权限列表 | ✅ |
| GET | `/api/permissions/:id` | 根据ID查询权限 | ✅ |
| PATCH | `/api/permissions/:id` | 更新权限 | ✅ |
| DELETE | `/api/permissions/:id` | 删除权限 | ✅ |

### 5. 菜单管理 (`/api/menus`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/menus` | 创建菜单 | ✅ |
| GET | `/api/menus/tree` | 获取菜单树（只返回启用的菜单，管理页面使用） | ✅ |
| GET | `/api/menus/page-tree` | 获取页面菜单树（登录后使用，根据角色权限过滤） | ✅ |
| GET | `/api/menus` | 分页查询菜单列表 | ✅ |
| GET | `/api/menus/:id` | 根据ID查询菜单 | ✅ |
| PATCH | `/api/menus/:id` | 更新菜单 | ✅ |
| DELETE | `/api/menus/:id` | 删除菜单 | ✅ |

### 6. 部门管理 (`/api/departments`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/departments` | 创建部门 | ✅ |
| GET | `/api/departments/tree` | 获取部门树 | ✅ |
| GET | `/api/departments/all` | 获取所有部门列表（不分页，用于下拉选择） | ✅ |
| GET | `/api/departments` | 分页查询部门列表 | ✅ |
| GET | `/api/departments/:id` | 根据ID查询部门 | ✅ |
| PATCH | `/api/departments/:id` | 更新部门 | ✅ |
| DELETE | `/api/departments/:id` | 删除部门 | ✅ |

### 7. 岗位管理 (`/api/posts`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/posts` | 创建岗位 | ✅ |
| GET | `/api/posts/all` | 获取所有岗位列表（不分页，用于下拉选择） | ✅ |
| GET | `/api/posts` | 分页查询岗位列表 | ✅ |
| GET | `/api/posts/:id` | 根据ID查询岗位 | ✅ |
| PATCH | `/api/posts/:id` | 更新岗位 | ✅ |
| DELETE | `/api/posts/:id` | 删除岗位 | ✅ |

### 8. 字典管理 (`/api/dict`)

#### 8.1 字典类型管理

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/dict/types` | 创建字典类型 | ✅ |
| GET | `/api/dict/types/all` | 获取所有字典类型（不分页，用于下拉选择） | ✅ |
| GET | `/api/dict/types` | 分页查询字典类型列表 | ✅ |
| GET | `/api/dict/types/:id` | 根据ID查询字典类型 | ✅ |
| PATCH | `/api/dict/types/:id` | 更新字典类型 | ✅ |
| DELETE | `/api/dict/types/:id` | 删除字典类型 | ✅ |

#### 8.2 字典数据管理

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/dict/data` | 创建字典数据 | ✅ |
| GET | `/api/dict/data` | 分页查询字典数据列表 | ✅ |
| GET | `/api/dict/data/:dictType` | 根据字典类型获取字典数据（不分页） | ✅ |
| GET | `/api/dict/data/id/:id` | 根据ID查询字典数据 | ✅ |
| PATCH | `/api/dict/data/:id` | 更新字典数据 | ✅ |
| DELETE | `/api/dict/data/:id` | 删除字典数据 | ✅ |

#### 8.3 字典选项

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/dict/options/:dictType` | 根据字典类型获取字典选项（格式化） | ✅ |

### 9. 登录日志 (`/api/login-logs`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/login-logs` | 分页查询登录日志列表 | ✅ |
| GET | `/api/login-logs/:id` | 根据ID查询登录日志 | ✅ |
| POST | `/api/login-logs` | 创建登录日志 | ✅ |
| DELETE | `/api/login-logs/:id` | 删除登录日志 | ✅ |
| DELETE | `/api/login-logs/batch/:ids` | 批量删除登录日志 | ✅ |

### 10. 操作日志 (`/api/operation-logs`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/operation-logs` | 分页查询操作日志列表 | ✅ |
| GET | `/api/operation-logs/:id` | 根据ID查询操作日志 | ✅ |
| POST | `/api/operation-logs` | 创建操作日志 | ✅ |
| DELETE | `/api/operation-logs/:id` | 删除操作日志 | ✅ |
| DELETE | `/api/operation-logs/batch/:ids` | 批量删除操作日志 | ✅ |

### 11. 服务监控 (`/api/monitor`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/monitor/server` | 获取服务器信息 | ✅ |

### 12. 文件上传 (`/api/upload`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/upload/image` | 上传图片 | ✅ |

### 13. 商品分类管理 (`/api/mall/categories`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/mall/categories` | 创建分类 | ✅ |
| GET | `/api/mall/categories` | 分页查询分类列表 | ✅ |
| GET | `/api/mall/categories/tree` | 获取分类树 | ✅ |
| GET | `/api/mall/categories/:id` | 根据ID查询分类 | ✅ |
| PATCH | `/api/mall/categories/:id` | 更新分类 | ✅ |
| DELETE | `/api/mall/categories/:id` | 删除分类 | ✅ |

### 14. 商品管理 (`/api/mall/products`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/mall/products` | 创建商品 | ✅ |
| GET | `/api/mall/products` | 分页查询商品列表 | ✅ |
| GET | `/api/mall/products/:id` | 根据ID查询商品 | ✅ |
| PATCH | `/api/mall/products/:id` | 更新商品 | ✅ |
| PATCH | `/api/mall/products/:id/status` | 更新商品状态（上架/下架） | ✅ |
| DELETE | `/api/mall/products/:id` | 删除商品 | ✅ |

### 15. 商品规格管理 (`/api/mall/product-skus`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/mall/product-skus` | 创建商品规格 | ✅ |
| POST | `/api/mall/product-skus/batch` | 批量创建商品规格 | ✅ |
| GET | `/api/mall/product-skus` | 分页查询商品规格列表 | ✅ |
| GET | `/api/mall/product-skus/product/:productId` | 根据商品ID查询所有规格 | ✅ |
| GET | `/api/mall/product-skus/:id` | 根据ID查询商品规格 | ✅ |
| PATCH | `/api/mall/product-skus/:id` | 更新商品规格 | ✅ |
| PATCH | `/api/mall/product-skus/:id/status` | 更新商品规格状态（启用/禁用） | ✅ |
| DELETE | `/api/mall/product-skus/:id` | 删除商品规格 | ✅ |

### 16. 订单管理 (`/api/mall/orders`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/mall/orders` | 分页查询订单列表 | ✅ |
| GET | `/api/mall/orders/:id` | 根据ID查询订单详情 | ✅ |
| GET | `/api/mall/orders/order-no/:orderNo` | 根据订单号查询订单详情 | ✅ |
| PATCH | `/api/mall/orders/:id/status` | 更新订单状态 | ✅ |
| PATCH | `/api/mall/orders/:id/cancel` | 取消订单 | ✅ |
| PATCH | `/api/mall/orders/:id/ship` | 订单发货 | ✅ |

### 17. 小程序用户管理 (`/api/mall/miniapp-users`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/mall/miniapp-users` | 分页查询小程序用户列表 | ✅ |
| GET | `/api/mall/miniapp-users/:id` | 根据ID查询小程序用户 | ✅ |
| PATCH | `/api/mall/miniapp-users/:id` | 更新小程序用户信息 | ✅ |
| PATCH | `/api/mall/miniapp-users/:id/status` | 更新用户状态（启用/禁用） | ✅ |
| PATCH | `/api/mall/miniapp-users/:id/balance` | 调整用户余额 | ✅ |
| PATCH | `/api/mall/miniapp-users/:id/points` | 调整用户积分 | ✅ |

### 18. 轮播图管理 (`/api/mall/banners`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/mall/banners` | 创建轮播图 | ✅ |
| GET | `/api/mall/banners` | 分页查询轮播图列表 | ✅ |
| GET | `/api/mall/banners/:id` | 根据ID查询轮播图 | ✅ |
| PATCH | `/api/mall/banners/:id` | 更新轮播图 | ✅ |
| DELETE | `/api/mall/banners/:id` | 删除轮播图 | ✅ |

## 二、前端页面接口（小程序）

### 1. 小程序认证 (`/api/miniapp/auth`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/miniapp/auth/login` | 微信登录 | ❌ |
| POST | `/api/miniapp/auth/phone-login` | 手机号+密码登录 | ❌ |
| GET | `/api/miniapp/auth/profile` | 获取当前用户信息 | ✅ |
| PATCH | `/api/miniapp/auth/profile` | 更新个人信息 | ✅ |
| POST | `/api/miniapp/auth/bind-phone` | 绑定手机号 | ✅ |

### 2. 小程序-个人中心 (`/api/miniapp/user`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/miniapp/user/statistics` | 获取用户统计信息 | ✅ |

### 3. 小程序-商品 (`/api/miniapp/products`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/miniapp/products` | 获取商品列表 | ❌ |
| GET | `/api/miniapp/products/recommend` | 获取推荐商品 | ❌ |
| GET | `/api/miniapp/products/new` | 获取新品 | ❌ |
| GET | `/api/miniapp/products/categories` | 获取分类列表 | ❌ |
| GET | `/api/miniapp/products/:id` | 获取商品详情 | ❌ |

### 4. 小程序-订单 (`/api/miniapp/orders`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/api/miniapp/orders` | 创建订单 | ✅ |
| GET | `/api/miniapp/orders` | 获取订单列表 | ✅ |
| GET | `/api/miniapp/orders/:id` | 获取订单详情 | ✅ |
| PATCH | `/api/miniapp/orders/:id/cancel` | 取消订单 | ✅ |
| PATCH | `/api/miniapp/orders/:id/confirm` | 确认收货 | ✅ |

### 5. 小程序-购物车 (`/api/miniapp/cart`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/miniapp/cart` | 获取购物车列表 | ✅ |
| GET | `/api/miniapp/cart/count` | 获取购物车数量 | ✅ |
| POST | `/api/miniapp/cart` | 加入购物车 | ✅ |
| PATCH | `/api/miniapp/cart/:id` | 更新购物车 | ✅ |
| DELETE | `/api/miniapp/cart/:id` | 删除购物车项 | ✅ |
| DELETE | `/api/miniapp/cart` | 清空购物车 | ✅ |

### 6. 小程序-轮播图 (`/api/miniapp/banners`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/miniapp/banners` | 获取轮播图列表 | ❌ |

### 7. 小程序-收货地址 (`/api/miniapp/addresses`)

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/api/miniapp/addresses` | 获取地址列表 | ✅ |
| GET | `/api/miniapp/addresses/:id` | 获取地址详情 | ✅ |
| POST | `/api/miniapp/addresses` | 创建地址 | ✅ |
| PATCH | `/api/miniapp/addresses/:id` | 更新地址 | ✅ |
| PATCH | `/api/miniapp/addresses/:id/default` | 设置默认地址 | ✅ |
| DELETE | `/api/miniapp/addresses/:id` | 删除地址 | ✅ |

## 三、接口统计

### 管理端接口统计
- **认证相关**: 5 个接口
- **用户管理**: 5 个接口
- **角色管理**: 8 个接口
- **权限管理**: 6 个接口
- **菜单管理**: 7 个接口
- **部门管理**: 7 个接口
- **岗位管理**: 6 个接口
- **字典管理**: 13 个接口
- **登录日志**: 5 个接口
- **操作日志**: 5 个接口
- **服务监控**: 1 个接口
- **文件上传**: 1 个接口
- **商品分类管理**: 6 个接口
- **商品管理**: 6 个接口
- **商品规格管理**: 8 个接口
- **订单管理**: 6 个接口
- **小程序用户管理**: 6 个接口
- **轮播图管理**: 5 个接口

**管理端总计**: 110 个接口

### 前端页面接口统计（小程序）
- **小程序认证**: 5 个接口
- **小程序-个人中心**: 1 个接口
- **小程序-商品**: 5 个接口
- **小程序-订单**: 5 个接口
- **小程序-购物车**: 6 个接口
- **小程序-轮播图**: 1 个接口
- **小程序-收货地址**: 6 个接口

**前端页面总计**: 29 个接口

### 总计
**全部接口**: 139 个接口

## 四、接口访问说明

### 认证方式
- 需要认证的接口需要在请求头中携带 JWT Token: `Authorization: Bearer <token>`
- 登录接口返回的 `access_token` 即为 JWT Token

### 基础路径
- 所有接口的基础路径为: `/api`
- 完整路径 = 基础路径 + 接口路径

### 响应格式
所有接口统一返回格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1234567890
}
```

### 分页接口
分页查询接口统一使用以下查询参数：
- `page`: 页码（从 1 开始）
- `pageSize`: 每页数量
- 其他查询条件根据具体接口而定

### 文档访问
- 统一文档页面: `http://localhost:3000/api`
- 管理端文档: `http://localhost:3000/api-docs/admin-page`
- 前端页面文档: `http://localhost:3000/api-docs/frontend-page`
- JSON 格式文档:
  - 管理端: `http://localhost:3000/api-docs/admin.json`
  - 前端页面: `http://localhost:3000/api-docs/frontend.json`


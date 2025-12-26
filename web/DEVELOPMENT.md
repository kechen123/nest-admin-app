# 开发文档

本文档提供详细的开发指南，帮助开发者快速上手项目开发。

## 📋 目录

- [开发环境搭建](#开发环境搭建)
- [项目架构](#项目架构)
- [开发规范](#开发规范)
- [核心功能说明](#核心功能说明)
- [项目组件](#项目组件)
- [组件开发](#组件开发)
- [API 开发](#api-开发)
- [路由开发](#路由开发)
- [状态管理](#状态管理)
- [样式开发](#样式开发)
- [调试技巧](#调试技巧)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## 🛠 开发环境搭建

### 必需工具

1. **Node.js** >= 18.0.0
   - 下载地址: https://nodejs.org/
   - 推荐使用 LTS 版本

2. **包管理器**
   - **pnpm** (推荐): `npm install -g pnpm`
   - 或 **npm**: 随 Node.js 安装

3. **IDE 推荐**
   - **VSCode** + 以下插件：
     - Vue Language Features (Volar)
     - TypeScript Vue Plugin (Volar)
     - ESLint
     - Prettier

### 初始化项目

```bash
# 克隆项目
git clone [项目地址]

# 进入项目目录
cd web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 🏗 项目架构

### 技术选型说明

- **Vue 3**: 使用 Composition API，提供更好的逻辑复用和类型推导
- **TypeScript**: 提供类型安全，减少运行时错误
- **Vite**: 快速的构建工具，提供优秀的开发体验
- **Element Plus**: 成熟的 UI 组件库
- **Pinia**: 轻量级状态管理，替代 Vuex
- **Vue Router**: 使用自动路由，基于文件系统生成路由

### 目录结构详解

```
src/
├── api/                    # API 接口层
│   ├── auth.ts            # 认证相关接口
│   ├── user.ts            # 用户相关接口
│   └── ...                # 其他业务接口
│
├── assets/                 # 静态资源
│   ├── less/              # 全局样式
│   │   ├── app.less       # 应用主样式
│   │   ├── global.less    # 全局样式变量
│   │   └── nprogress.less # 进度条样式
│   └── svg/               # SVG 图标
│
├── components/             # 公共组件
│   ├── Kc/                # 自定义业务组件库
│   │   ├── Form/          # 表单组件
│   │   ├── Table/         # 表格组件
│   │   ├── Search/        # 搜索组件
│   │   └── Toolbar/       # 工具栏组件
│   ├── Layout/            # 布局组件
│   │   ├── Header/        # 顶部导航
│   │   ├── Aside/         # 侧边栏
│   │   └── Tags/          # 标签页
│   └── ...                # 其他公共组件
│
├── hooks/                  # 组合式函数
│   ├── useTable.ts        # 表格相关逻辑
│   └── useResizablePanel.ts # 可调整面板
│
├── layouts/                # 布局模板
│   ├── default.vue        # 默认布局
│   └── custom.vue         # 自定义布局
│
├── modules/                # 功能模块
│   ├── router/            # 路由模块
│   │   ├── index.ts       # 路由配置
│   │   └── permission.ts  # 路由权限控制
│   ├── pinia/             # Pinia 模块
│   └── nprogress/         # 进度条模块
│
├── pages/                  # 页面组件（自动路由）
│   ├── login.vue          # 登录页
│   ├── index.vue          # 首页
│   ├── system/            # 系统管理模块
│   │   ├── user/          # 用户管理
│   │   ├── role/          # 角色管理
│   │   └── ...
│   └── 404.vue   # 404 页面
│
├── stores/                 # Pinia 状态存储
│   ├── user.ts            # 用户状态
│   ├── layout.ts          # 布局状态
│   └── ...
│
└── utils/                  # 工具函数
    ├── http/              # HTTP 请求封装
    │   ├── axios.ts       # Axios 实例和拦截器
    │   └── errorCode.ts  # 错误码映射
    ├── permission.ts      # 权限工具
    ├── storage.ts         # 本地存储工具
    └── ...
```

## 📐 开发规范

### 代码风格

1. **命名规范**
   - 组件名: PascalCase (如: `UserProfile.vue`)
   - 文件名: kebab-case (如: `user-profile.vue`)
   - 变量/函数: camelCase (如: `getUserInfo`)
   - 常量: UPPER_SNAKE_CASE (如: `API_BASE_URL`)
   - 类型/接口: PascalCase (如: `UserInfo`)

2. **文件组织**
   - 每个组件一个文件
   - 相关文件放在同一目录
   - 使用 `index.vue` 作为主组件

3. **代码格式**
   - 使用 Prettier 自动格式化
   - 使用 ESLint 进行代码检查
   - 提交前运行 `pnpm lint` 和 `pnpm format`

### Vue 组件规范

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入依赖
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'

// 2. 定义 Props
interface Props {
  userId: number
  title?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '默认标题'
})

// 3. 定义 Emits
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

// 4. 响应式数据
const count = ref(0)
const userInfo = ref<UserInfo | null>(null)

// 5. 计算属性
const doubleCount = computed(() => count.value * 2)

// 6. 方法
const handleClick = () => {
  count.value++
  emit('update', 'value')
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped lang="less">
// 样式
</style>
```

### TypeScript 规范

1. **类型定义**
   - 优先使用 `interface` 定义对象类型
   - 使用 `type` 定义联合类型、工具类型
   - 避免使用 `any`，使用 `unknown` 替代

2. **导入顺序**
   ```typescript
   // 1. Vue 相关
   import { ref, computed } from 'vue'
   
   // 2. 第三方库
   import axios from 'axios'
   
   // 3. 项目内部
   import { getUserInfo } from '@/api/user'
   import type { UserInfo } from '@/types'
   ```

## 🔧 核心功能说明

### 自动导入

项目配置了自动导入，以下内容无需手动导入：

- **Vue API**: `ref`, `computed`, `watch` 等
- **Vue Router**: `useRouter`, `useRoute` 等
- **Pinia**: `defineStore`, `storeToRefs` 等
- **Element Plus**: 组件和图标
- **@/components**: 组件目录下的组件

### 路由系统

使用 `unplugin-vue-router` 实现基于文件系统的自动路由：

- 文件路径 = 路由路径
- `_detail.vue` 表示详情页（动态路由）
- `404.vue` 表示 404 页面
- 路由元信息通过 `<route>` 块定义

示例：
```vue
<route>
{
  meta: {
    title: '用户管理',
    requiresAuth: true,
    permissions: ['user:list']
  }
}
</route>
```

### 权限控制

1. **路由权限**: 在路由守卫中检查权限
2. **按钮权限**: 使用 `PermissionButton` 组件
3. **API 权限**: 后端接口控制

### HTTP 请求

使用封装的 Axios 实例：

```typescript
import axios from '@/utils/http/axios'
import type { ApiResponse } from '@/utils/http/axios'

// GET 请求
const getUserList = async () => {
  const data = await axios.get<ApiResponse<UserInfo[]>>('/user/list')
  return data
}

// POST 请求
const createUser = async (userData: CreateUserDto) => {
  const data = await axios.post<ApiResponse<UserInfo>>('/user', userData)
  return data
}

// 错误处理
try {
  await createUser(userData)
} catch (error) {
  // 错误已由拦截器处理，这里可以自定义处理
  handleApiError(error, '创建用户失败')
}
```

## 📦 项目组件

项目提供了丰富的组件和模块，帮助快速构建业务页面。以下是主要组件的介绍和使用指南。

### Kc 组件库

**位置**: `src/components/Kc/`  
**详细文档**: [Kc 组件库说明](./src/components/Kc/README.md)

Kc 是基于业务场景封装的表格/搜索/工具栏一体化组件库，提供快速搭建列表页的能力。

#### 核心组件

- **Kc** (`index.vue`): 组合页组件，内置搜索、工具栏、表格
- **KcSearch**: 搜索表单组件，支持字段配置与默认值
- **KcToolbar**: 工具栏按钮区，支持左右插槽
- **KcTable**: 数据表格组件，支持分页、远程请求、插槽列
- **KcForm**: 动态表单生成器
- **TableWithSlidePanel**: 集成右侧滑出面板的表格组件

#### 快速使用

```vue
<template>
  <Kc :config="kcConfig" ref="kcRef">
    <template #actions="{ row }">
      <el-button size="small" @click="openDetail(row)">详情</el-button>
    </template>
  </Kc>
</template>

<script setup lang="ts">
import Kc from '@/components/Kc'
import type { KcConfig } from '@/components/Kc/types'

const kcConfig: KcConfig = {
  toolbar: {
    leftButtons: [{ key: 'add', label: '新增', type: 'primary' }],
  },
  search: {
    fields: [
      { key: 'username', label: '用户名', type: 'input' },
    ],
  },
  table: {
    columns: [
      { type: 'index', label: '序号' },
      { type: 'text', prop: 'username', label: '用户名' },
      { type: 'slot', prop: 'actions', label: '操作' },
    ],
    request: fetchList,
  },
}
</script>
```

更多配置和 API 请参考 [Kc 组件库详细文档](./src/components/Kc/README.md)。

### Slide Panel 模块

**位置**: `src/modules/slide-panel/`  
**详细文档**: [Slide Panel 模块说明](./src/modules/slide-panel/README.md)

用于在页面右侧快速打开滑出面板，支持内容区域/右栏自适应宽度、拖拽调整、统一数据传递。

#### 核心组件

- **SlideContainer**: 核心容器，负责右栏滑出、数据下发与布局计算
- **AsideContainer**: 在左侧附带可折叠的辅助栏，并内置一个 `SlideContainer`

#### 快速使用

```vue
<template>
  <SlideContainer ref="containerRef">
    <MainTable @row-click="openDetail" />
  </SlideContainer>
</template>

<script setup lang="ts">
import { SlideContainer } from '@/modules/slide-panel'
import Detail from './Detail.vue'

const containerRef = ref()

const openDetail = (row) => {
  containerRef.value.open({
    default: {
      component: Detail,
      data: { rowId: row.id },
      width: 600,
      title: '用户详情',
    }
  })
}
</script>
```

更多 API 和使用方法请参考 [Slide Panel 模块详细文档](./src/modules/slide-panel/README.md)。

### PermissionButton 组件

**位置**: `src/components/PermissionButton/`  
**详细文档**: [PermissionButton 使用说明](./src/components/PermissionButton/README.md)

基于权限控制的按钮组件，只有当用户拥有指定权限时才会显示按钮。

#### 使用示例

```vue
<template>
  <!-- 单个权限 -->
  <PermissionButton 
    type="primary" 
    permission="system:user:add"
    @click="handleAdd"
  >
    新增用户
  </PermissionButton>

  <!-- 多个权限（任意一个） -->
  <PermissionButton 
    :any-permission="['system:user:edit', 'system:user:add']"
    @click="handleSave"
  >
    保存
  </PermissionButton>
</template>

<script setup lang="ts">
import PermissionButton from '@/components/PermissionButton'
</script>
```

### Layout 布局组件

**位置**: `src/components/Layout/`

提供系统布局相关的组件，包括：

- **Header**: 顶部导航栏组件
  - `Header/index.vue`: 主头部组件
  - `Header/left.vue`: 左侧区域（Logo、菜单折叠按钮）
  - `Header/navigation.vue`: 导航菜单
- **Aside**: 侧边栏组件
  - `Aside/index.vue`: 主侧边栏
  - `Aside/header.vue`: 侧边栏头部
  - `Aside/subItem.vue`: 子菜单项
- **Tags**: 标签页组件，用于多页面切换

这些组件通常在布局模板（`src/layouts/`）中使用。

### 其他常用组件

#### Echarts 图表组件

**位置**: `src/components/Echarts/`

封装了 ECharts 的 Vue 组件，简化图表使用：

```vue
<template>
  <Echarts :option="chartOption" :height="400" />
</template>
```

#### ImageUpload 图片上传组件

**位置**: `src/components/ImageUpload/`

图片上传组件，支持预览、裁剪等功能。

#### IconPicker 图标选择器

**位置**: `src/components/IconPicker/`

图标选择器组件，用于选择 Element Plus 图标。

#### SmartTable 智能表格

**位置**: `src/components/SmartTable/`

增强的表格组件，提供更多便捷功能。

### 组件使用建议

1. **优先使用项目组件**: 项目提供的组件已经过优化和测试，优先使用
2. **查看组件文档**: 每个组件都有对应的 README 文档，使用前请仔细阅读
3. **组件组合使用**: 多个组件可以组合使用，如 `TableWithSlidePanel` 就是 `Kc` 和 `SlideContainer` 的组合
4. **自定义扩展**: 如需扩展组件功能，建议通过插槽或组合式函数实现

## 🧩 组件开发

### 创建新组件

1. **公共组件**: 放在 `src/components/` 目录
2. **页面组件**: 放在 `src/pages/` 目录（自动路由）

### 组件通信

1. **Props / Emits**: 父子组件通信
2. **Provide / Inject**: 跨层级组件通信
3. **Pinia Store**: 全局状态共享
4. **Event Bus**: 使用 `mitt` 或类似库（不推荐）

## 📡 API 开发

### 创建 API 接口

在 `src/api/` 目录下创建对应的接口文件：

```typescript
// src/api/user.ts
import axios from '@/utils/http/axios'
import type { ApiResponse } from '@/utils/http/axios'

export interface UserInfo {
  id: number
  username: string
  email: string
}

export interface CreateUserDto {
  username: string
  email: string
  password: string
}

// 获取用户列表
export const getUserList = (params?: any) => {
  return axios.get<ApiResponse<UserInfo[]>>('/user/list', { params })
}

// 创建用户
export const createUser = (data: CreateUserDto) => {
  return axios.post<ApiResponse<UserInfo>>('/user', data)
}

// 更新用户
export const updateUser = (id: number, data: Partial<CreateUserDto>) => {
  return axios.put<ApiResponse<UserInfo>>(`/user/${id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return axios.delete<ApiResponse<void>>(`/user/${id}`)
}
```

### 使用 API

```vue
<script setup lang="ts">
import { getUserList, createUser } from '@/api/user'
import type { UserInfo } from '@/api/user'

const users = ref<UserInfo[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    users.value = await getUserList()
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
```

## 🗺 路由开发

### 创建新页面

在 `src/pages/` 目录下创建 `.vue` 文件即可自动生成路由：

```
src/pages/
├── about.vue              # /about
├── user/
│   ├── index.vue          # /user
│   └── profile.vue         # /user/profile
└── system/
    └── user/
        ├── index.vue      # /system/user
        └── _detail.vue     # /system/user/:id
```

### 路由元信息

```vue
<route>
{
  meta: {
    title: '用户管理',
    requiresAuth: true,
    permissions: ['user:list'],
    layout: 'default',
    keepAlive: true
  }
}
</route>
```

### 路由跳转

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 编程式导航
router.push('/user/profile')
router.push({ name: 'user-profile', params: { id: 1 } })

// 获取路由信息
const route = useRoute()
console.log(route.params.id)
```

## 💾 状态管理

### 创建 Store

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  
  const setUserInfo = (user: UserInfo) => {
    userInfo.value = user
  }
  
  const clearUserInfo = () => {
    userInfo.value = null
  }
  
  return {
    userInfo,
    setUserInfo,
    clearUserInfo
  }
})
```

### 使用 Store

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问状态
console.log(userStore.userInfo)

// 调用方法
userStore.setUserInfo(newUser)

// 响应式解构（保持响应性）
const { userInfo } = storeToRefs(userStore)
</script>
```

## 🎨 样式开发

### 使用 Less

项目使用 Less 作为 CSS 预处理器：

```vue
<style scoped lang="less">
.container {
  padding: 20px;
  
  .title {
    font-size: 18px;
    color: var(--el-text-color-primary);
  }
}
</style>
```

### 全局样式变量

在 `src/assets/less/global.less` 中定义全局变量：

```less
// 颜色
@primary-color: #409eff;
@success-color: #67c23a;

// 间距
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;
```

### 主题定制

Element Plus 支持主题定制，修改 `src/assets/less/app.less`：

```less
// 覆盖 Element Plus 变量
:root {
  --el-color-primary: #409eff;
}
```

## 🐛 调试技巧

### Vue DevTools

安装 Vue DevTools 浏览器扩展，可以：
- 查看组件树
- 检查状态
- 调试性能

### 开发工具

项目集成了 `vite-plugin-vue-devtools`，提供额外的调试功能。

### 调试技巧

1. **使用 console.log**: 开发时输出调试信息
2. **使用 debugger**: 在代码中设置断点
3. **Vue DevTools**: 检查组件状态和 props
4. **Network 面板**: 检查 API 请求

## ⚡ 性能优化

### 代码分割

路由级别的代码分割已自动配置，使用动态导入：

```typescript
const UserPage = () => import('@/pages/user/index.vue')
```

### 组件懒加载

对于大型组件，使用 `defineAsyncComponent`：

```typescript
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

### 图片优化

- 使用 WebP 格式
- 使用懒加载
- 压缩图片大小

### 其他优化

- 使用 `v-memo` 缓存列表项
- 使用 `v-once` 渲染静态内容
- 合理使用 `computed` 和 `watch`

## ❓ 常见问题

### 1. 类型错误

**问题**: TypeScript 类型检查失败

**解决**:
- 运行 `pnpm type-check` 查看详细错误
- 确保类型定义正确
- 使用类型断言（谨慎使用）

### 2. 路由不生效

**问题**: 新创建的页面路由不显示

**解决**:
- 确保文件在 `src/pages/` 目录
- 检查文件名是否正确
- 重启开发服务器

### 3. 自动导入不工作

**问题**: 组件或 API 无法自动导入

**解决**:
- 检查 `vite.config.ts` 配置
- 确保文件在正确的目录
- 重启开发服务器

### 4. 样式不生效

**问题**: 样式没有应用

**解决**:
- 检查 `scoped` 是否正确
- 确认 Less 文件已导入
- 检查样式优先级

### 5. API 请求失败

**问题**: 接口请求报错

**解决**:
- 检查后端服务是否启动
- 确认代理配置正确
- 检查请求参数和 headers

## 📚 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [TypeScript 文档](https://www.typescriptlang.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

如有问题，请提交 Issue 或联系开发团队。


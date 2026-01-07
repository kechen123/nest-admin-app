# 文件目录

本文档详细介绍前端项目的目录结构和文件组织方式。

## 项目根目录

```
web/
├── public/                 # 静态资源目录（不参与构建）
├── src/                    # 源代码目录
├── types/                  # TypeScript 类型定义
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置文件
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖配置
└── README.md               # 项目说明文档
```

## 源代码目录结构

```
src/
├── api/                    # API 接口定义
├── assets/                 # 静态资源文件
├── components/             # 公共组件
├── composables/            # 组合式函数
├── hooks/                  # 自定义 Hooks
├── layouts/                # 布局组件
├── modules/                 # 功能模块
├── pages/                  # 页面组件（自动路由）
├── stores/                 # Pinia 状态存储
├── utils/                  # 工具函数
├── App.vue                 # 根组件
└── main.ts                 # 应用入口文件
```

## 目录详细说明

### api/ - API 接口定义

存放所有 API 接口的定义文件，按业务模块划分：

```
api/
├── auth.ts                 # 认证相关接口
├── user.ts                 # 用户相关接口
├── role.ts                 # 角色相关接口
├── department.ts           # 部门相关接口
├── dict.ts                 # 字典相关接口
└── ...
```

**使用示例**：

```typescript
// api/user.ts
import axios from '@/utils/http/axios'

export const getUserList = (params?: any) => {
  return axios.get('/user/list', { params })
}

export const createUser = (data: any) => {
  return axios.post('/user', data)
}
```

### assets/ - 静态资源

存放项目中使用的静态资源文件：

```
assets/
├── less/                   # Less 样式文件
│   ├── global.less         # 全局变量和混入
│   ├── app.less            # 应用主样式
│   └── nprogress.less      # 进度条样式
└── svg/                    # SVG 图标
    ├── logo.svg
    └── login.svg
```

### components/ - 公共组件

存放可复用的公共组件，按功能分类：

```
components/
├── Kc/                     # 业务组件库（核心）
│   ├── Form/               # 表单组件
│   ├── Table/              # 表格组件
│   ├── Search/             # 搜索组件
│   ├── Toolbar/            # 工具栏组件
│   └── TableWithSlidePanel.vue  # 表格+侧边栏组合
├── Layout/                 # 布局组件
│   ├── Header/             # 顶部导航
│   ├── Aside/              # 侧边栏
│   └── Tags/                # 标签页
├── Echarts/                # ECharts 图表组件
├── ImageUpload/            # 图片上传组件
├── IconPicker/             # 图标选择器
├── PermissionButton/       # 权限按钮组件
└── ...
```

**组件命名规范**：
- 组件目录使用 PascalCase：`UserProfile/`
- 组件文件使用 PascalCase：`UserProfile.vue`
- 组件自动导入，无需手动 import

### composables/ - 组合式函数

存放可复用的组合式函数（Composables）：

```
composables/
└── usePanelDrag.ts         # 面板拖拽功能
```

### hooks/ - 自定义 Hooks

存放自定义的 Hooks 函数：

```
hooks/
├── useTable.ts             # 表格数据管理 Hook
├── useResizablePanel.ts    # 可调整面板 Hook
├── useDraggable.ts         # 拖拽功能 Hook
└── useThemeTransition.ts   # 主题过渡 Hook
```

**使用示例**：

```typescript
import { useTable } from '@/hooks/useTable'

const { data, loading, refresh } = useTable({
  request: fetchUserList,
  defaultParams: { page: 1, size: 10 },
})
```

### layouts/ - 布局组件

存放页面布局模板：

```
layouts/
├── default.vue             # 默认布局（包含 Header、Aside、Tags）
└── custom.vue              # 自定义布局
```

### modules/ - 功能模块

存放功能模块的配置和工具：

```
modules/
├── router/                 # 路由模块
│   ├── index.ts           # 路由配置
│   └── permission.ts      # 路由权限控制
├── pinia/                  # Pinia 模块
│   └── index.ts           # Pinia 配置
├── slide-panel/            # 侧边栏模块
│   ├── SlideContainer.vue # 侧边栏容器
│   └── README.md          # 使用文档
└── nprogress/              # 进度条模块
    └── index.ts
```

### pages/ - 页面组件

存放页面组件，支持自动路由：

```
pages/
├── index.vue               # 首页
├── login.vue               # 登录页
├── [...notFond].vue        # 404 页面
├── system/                 # 系统管理模块
│   ├── user/              # 用户管理
│   │   ├── index.vue      # 列表页
│   │   ├── _detail.vue     # 详情页（弹窗）
│   │   └── table.vue       # 表格组件
│   ├── role/              # 角色管理
│   └── ...
└── monitor/                # 监控模块
    ├── logininfor/         # 登录日志
    └── operlog/            # 操作日志
```

**路由规则**：
- `index.vue` -> `/`
- `login.vue` -> `/login`
- `system/user/index.vue` -> `/system/user`
- `system/user/_detail.vue` -> 详情弹窗（不生成路由）

### stores/ - 状态存储

存放 Pinia Store 定义：

```
stores/
├── user.ts                 # 用户状态
├── layout.ts               # 布局状态
├── router.ts               # 路由状态
└── tags.ts                 # 标签页状态
```

**使用示例**：

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token
    },
  },
  persist: true, // 持久化
})
```

### utils/ - 工具函数

存放工具函数和帮助方法：

```
utils/
├── http/                   # HTTP 相关
│   ├── axios.ts           # Axios 封装
│   └── errorCode.ts       # 错误码定义
├── common.ts              # 通用工具函数
├── dict.ts                # 字典工具
├── permission.ts          # 权限工具
├── storage.ts             # 存储工具
└── ...
```

## 文件命名规范

### 组件文件

- **组件目录**：使用 PascalCase，如 `UserProfile/`
- **组件文件**：使用 PascalCase，如 `UserProfile.vue`
- **组件入口**：通常为 `index.vue`

### 工具文件

- **工具函数文件**：使用 camelCase，如 `formatDate.ts`
- **常量文件**：使用 UPPER_SNAKE_CASE，如 `API_CONSTANTS.ts`

### 页面文件

- **页面文件**：使用 kebab-case，如 `user-list.vue`
- **详情页**：使用 `_detail.vue` 前缀，如 `_detail.vue`

### 类型文件

- **类型定义文件**：使用 `.d.ts` 后缀
- **类型文件**：使用 camelCase，如 `userTypes.ts`

## 导入路径规范

### 使用路径别名

项目配置了 `@` 别名指向 `src` 目录：

```typescript
// ✅ 推荐：使用别名
import { getUserList } from '@/api/user'
import UserTable from '@/components/Kc/Table'
import { useUserStore } from '@/stores/user'

// ❌ 不推荐：使用相对路径
import { getUserList } from '../../api/user'
```

### 自动导入

项目配置了自动导入，以下内容无需手动导入：

```typescript
// ✅ 无需导入，自动可用
const count = ref(0)
const router = useRouter()
const userStore = useUserStore()
ElMessage.success('操作成功')
```

## 代码组织原则

1. **按功能模块划分**：相关功能放在同一目录下
2. **组件复用优先**：优先使用项目提供的公共组件
3. **单一职责原则**：每个文件只负责一个功能
4. **命名清晰明确**：文件名和变量名要能表达其用途
5. **类型安全**：使用 TypeScript 确保类型安全

## 下一步

- 查看 [项目配置](./configuration.md) 了解配置详情
- 查看 [组件使用](./components.md) 了解组件使用方法
- 查看 [表格页面开发](./table-development.md) 了解页面开发流程



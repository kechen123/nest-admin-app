# 项目配置

本文档介绍前端项目的配置项和配置方法。

## 构建工具配置

### Vite 配置

项目使用 Vite 作为构建工具，配置文件位于 `vite.config.ts`。

#### 主要配置项

```typescript
export default defineConfig({
  // 插件配置
  plugins: [
    vue(),                    // Vue 3 支持
    vueJsx(),                 // JSX/TSX 支持
    vueDevTools(),            // Vue DevTools
    svgLoader(),              // SVG 加载器
    AutoImport({              // 自动导入 API
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
    }),
    Components({              // 自动导入组件
      dirs: ['src/components'],
      resolvers: [ElementPlusResolver()],
    }),
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // 开发服务器配置
  server: {
    host: '0.0.0.0',          // 监听所有网络接口
    port: 4000,               // 开发服务器端口
    open: false,              // 不自动打开浏览器
    cors: true,               // 允许跨域
    proxy: {                  // API 代理配置
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  // 构建配置
  build: {
    target: 'es2020',         // 兼容目标
    cssCodeSplit: false,     // CSS 不拆分
    minify: 'terser',        // 使用 terser 压缩
    sourcemap: false,         // 不生成 sourcemap
  },
})
```

#### 自动导入配置

项目配置了自动导入功能，无需手动导入常用的 API 和组件：

**自动导入的 API**：

- Vue 3 API：`ref`, `reactive`, `computed`, `watch` 等
- Vue Router API：`useRouter`, `useRoute` 等
- Pinia API：`defineStore`, `storeToRefs` 等
- VueUse API：`useMouse`, `useLocalStorage` 等
- Element Plus API：`ElMessage`, `ElMessageBox` 等

**自动导入的组件**：

- Element Plus 组件：`ElButton`, `ElTable`, `ElForm` 等
- 项目自定义组件：`src/components` 目录下的组件

类型定义文件会自动生成在 `types/auto-imports.d.ts` 和 `types/components.d.ts`。

## 环境变量配置

### 环境变量文件

项目支持通过环境变量进行配置，环境变量文件命名规则：

- `.env` - 所有环境都会加载
- `.env.local` - 所有环境都会加载，会被 git 忽略
- `.env.development` - 开发环境
- `.env.production` - 生产环境

### 常用环境变量

```env
# API 基础路径
VITE_API_TARGET=http://localhost:3000

# Docker 环境标识
DOCKER_ENV=true

# 应用标题
VITE_APP_TITLE=管理系统

# 其他配置...
```

### 使用环境变量

在代码中使用环境变量：

```typescript
// 获取环境变量
const apiTarget = import.meta.env.VITE_API_TARGET

// 判断环境
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE
```

**注意**：只有以 `VITE_` 开头的环境变量才会暴露给客户端代码。

## TypeScript 配置

### tsconfig.json

项目使用 TypeScript，配置文件位于 `tsconfig.json`。

主要配置项：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 类型定义

项目中的类型定义文件：

- `types/auto-imports.d.ts` - 自动导入的类型定义
- `types/components.d.ts` - 组件类型定义
- `src/vite-env.d.ts` - Vite 环境类型定义

## 样式配置

### Less 配置

项目使用 Less 作为 CSS 预处理器。

#### 全局样式变量

全局样式变量定义在 `src/assets/less/global.less`：

```less:src/assets/less/global.less
// 主题色
@primary-color: #409eff;
@success-color: #67c23a;
@warning-color: #e6a23c;
@danger-color: #f56c6c;

// 布局
@header-height: 60px;
@aside-width: 200px;

// 其他变量...
```

#### 样式文件结构

```text
src/assets/less/
├── global.less      # 全局变量和混入
├── app.less         # 应用主样式
└── nprogress.less   # 进度条样式
```

### 样式作用域

组件样式使用 `<style scoped>` 或 `<style module>` 实现作用域隔离：

```vue
<style scoped lang="less">
// 组件样式，不会影响其他组件
.component {
  color: @primary-color;
}
</style>
```

## 路由配置

### 路由文件

路由配置文件位于 `src/modules/router/index.ts`。

### 路由模式

项目使用 Vue Router，支持两种路由模式：

- **Hash 模式**：URL 中包含 `#`，兼容性更好
- **History 模式**：URL 更美观，需要服务器配置支持

### 路由权限

路由权限控制逻辑在 `src/modules/router/permission.ts`，实现：

- 登录状态检查
- 路由权限验证
- 动态路由加载

## 状态管理配置

### Pinia 配置

项目使用 Pinia 进行状态管理，配置文件位于 `src/modules/pinia/index.ts`。

#### Store 配置

```typescript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 持久化插件

export default pinia
```

#### Store 持久化

使用 `pinia-plugin-persistedstate` 插件实现状态持久化：

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
  }),
  persist: {
    key: 'user-store',
    storage: localStorage,
  },
})
```

## HTTP 请求配置

### Axios 配置

HTTP 请求封装在 `src/utils/http/axios.ts`。

#### 请求拦截器

```typescript
// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

#### 响应拦截器

```typescript
// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    const res = response.data
    // 统一处理响应数据
    if (res.code === 200) {
      return res
    } else {
      // 处理错误
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    // 处理 HTTP 错误
    return Promise.reject(error)
  }
)
```

### API 基础配置

```typescript
// API 基础 URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// 请求超时时间
const timeout = 10000
```

## 开发工具配置

### ESLint 配置

项目使用 ESLint 进行代码检查，配置文件位于 `.eslintrc.cjs`。

### Prettier 配置

项目使用 Prettier 进行代码格式化，配置文件位于 `.prettierrc`。

### 代码格式化命令

```bash
# 运行 ESLint
pnpm lint:eslint

# 运行 Oxlint
pnpm lint:oxlint

# 运行所有 linter
pnpm lint

# 格式化代码
pnpm format
```

## 构建配置

### 开发环境

```bash
# 启动开发服务器
pnpm dev
```

开发服务器配置：

- 端口：`4000`
- 热重载：已启用
- API 代理：`/api` -> `http://localhost:3000`

### 生产环境

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

构建配置：

- 目标：ES2020
- 压缩：terser
- Source Map：关闭
- 移除 console：是

## 下一步

- 查看 [文件目录](./structure.md) 了解项目结构
- 查看 [组件使用](./components.md) 了解组件使用方法
- 查看 [表格页面开发](./table-development.md) 了解页面开发流程


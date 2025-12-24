import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Layouts from 'vite-plugin-vue-layouts'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import { ElementPlusResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      exclude: ['**/_*.vue'],
    }),
    // ⚠️ Vue must be placed after VueRouter()
    vue(),
    // vue 可以使用 jsx/tsx 语法
    vueJsx(),
    vueDevTools(),
    svgLoader(),
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default',
    }),
    AutoImport({
      //引入element plus自动api支持
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'pinia',
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          // 'vue-router/auto': ['useLink'],
        },
      ],
      //为true时在项目根目录自动创建
      dts: 'types/auto-imports.d.ts',
    }),
    Components({
      //自动加载的组件目录，默认值为 ['src/components']
      dirs: ['src/components'],
      // 排除掉子目录中的组件
      exclude: ['src/components/**/components/**'],
      //组件名称包含目录，防止同名组件冲突
      directoryAsNamespace: true,
      //指定类型声明文件，为true时在项目根目录创建
      dts: 'types/components.d.ts',
      //引入element plus自动组件支持
      resolvers: [ElementPlusResolver(), VueUseComponentsResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/', // 设置打包路径
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许从容器外部访问
    port: 4000, // 设置服务启动端口号
    open: false, // 设置服务启动时是否自动打开浏览器
    cors: true, // 允许跨域

    // 文件监听配置 - 解决 Docker 环境中文件变化无法检测的问题
    // 在 Docker 环境中，文件系统事件可能无法正确传递，使用轮询模式
    watch: {
      usePolling: process.env.DOCKER_ENV === 'true', // 在 Docker 环境中启用轮询
      interval: 1000, // 轮询间隔（毫秒）
      // 排除 node_modules 等不需要监听的目录，提高性能
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },

    // 设置代理，指向 backend 服务
    // 在 Docker 环境中，使用服务名 'backend' 访问后端服务
    // 在本地开发环境中，使用 'localhost'
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // backend 已经有全局前缀 /api，所以不需要重写路径
        // 配置 websocket 代理（如果需要）
        ws: false,
      },
    },
  },
  build: {
    target: 'es2020', // 设置兼容目标
    cssCodeSplit: false, // 是否抽离css到单独文件
    minify: 'terser', // 混淆器,terser构建后文件体积更小
    sourcemap: false, // 是否构建source map文件
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true, // 生产环境移除debugger
      },
    },
    // rollupOptions: {
    //   treeshake: false, // 必须加上，否则会移除掉element-plus的样式
    //   output: {
    //     manualChunks: {
    //       echarts: ['echarts']
    //     }
    //   }
    // }
  },
})

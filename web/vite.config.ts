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
    port: 4000, // 设置服务启动端口号
    open: false, // 设置服务启动时是否自动打开浏览器
    cors: true, // 允许跨域

    // 设置代理，指向 backend 服务
    // 这样可以避免 CORS 问题，因为请求是从同一个源发出的
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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

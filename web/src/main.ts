import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'
import * as modules from '@/modules/index'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 导入 Element Plus 样式（确保 ElMessage 等组件样式正常显示）
import 'element-plus/dist/index.css'
import '@/assets/less/app.less'

import App from './App.vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
for (const [, module] of Object.entries(modules)) {
  app.use(module)
}

app.mount('#app')

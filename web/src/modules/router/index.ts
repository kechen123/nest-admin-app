// import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router/auto'
// import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router/auto'

import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

import { setupLayouts } from 'virtual:generated-layouts'
import { Auth, NotCheckRouter } from './permission'

export const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
})

// 在路由跳转前，检查用户是否有权限访问该路由
router.beforeEach(async (to, from) => {
  let b: boolean | Object = false
  for (const fn of Auth) {
    if (NotCheckRouter.indexOf(to.name?.toString() || '') > -1) {
      break
    }
    b = await fn({ to, from, router })
    if (b) {
      break
    }
  }
  if (b) return b
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
export default router

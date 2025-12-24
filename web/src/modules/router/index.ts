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
  // 检查是否在不需要权限检查的路由列表中（支持名称和路径匹配）
  const routeName = to.name?.toString() || ''
  const routePath = to.path
  const isNotCheckRoute = NotCheckRouter.some(notCheck => {
    // 匹配路由名称
    if (routeName === notCheck) return true
    // 匹配路由路径（精确匹配或路径前缀匹配）
    if (routePath === notCheck || routePath.startsWith(notCheck + '/')) return true
    return false
  })
  
  // 如果在白名单中，直接放行
  if (isNotCheckRoute) {
    return true
  }
  
  let b: boolean | Object = false
  for (const fn of Auth) {
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

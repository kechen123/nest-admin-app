import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router'
import { useRouterStore } from '@/stores/router'
import { Auth, NotCheckRouter } from './permission'
import { showPageLoading, hidePageLoading } from '@/utils/loading'
const baseRoutes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('@/pages/index.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login.vue'),
    meta: {
      layout: 'custom',
    },
  },
  // {
  //   path: '/404',
  //   name: '404',
  //   component: () => import('@/pages/[...notFond].vue'),
  // },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
})

// 在路由跳转前，检查用户是否有权限访问该路由
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  // 显示页面加载loading（仅在非相同路由时显示）
  if (to.path !== from.path) {
    showPageLoading()
  }
  
  const routeName = to.name?.toString() || ''
  const routePath = to.path
  const isNotCheckRoute = NotCheckRouter.some((notCheck) => {
    if (routeName === notCheck) return true
    if (routePath === notCheck || routePath.startsWith(notCheck + '/')) return true
    return false
  })
  if (isNotCheckRoute) {
    return true
  }
  let b: boolean | Object = false
  for (const fn of Auth) {
    b = await fn({ to, from, router })
    if (typeof b === 'object') {
      break
    }
  }
  if (b && typeof b === 'object') {
    return b
  }
  return true
})

// 路由跳转完成后隐藏loading
router.afterEach(() => {
  // 延迟隐藏loading，确保页面切换效果
  setTimeout(() => {
    hidePageLoading()
  }, 200)
})

// 路由错误时也隐藏loading
router.onError(() => {
  hidePageLoading()
})

export default router

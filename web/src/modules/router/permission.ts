import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useRouterStore } from '@/stores/router'
import { isValueExistsInTree } from '@/utils/common'
import { tokenStorage } from '@/utils/storage'

interface Check {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next?: NavigationGuardNext
  router?: Router
}

type CheckFun = (check: Check) => boolean | Object

const checkHasRoute: CheckFun = ({ to, from, router }) => {
  if (router && router.hasRoute(to.name as string)) {
    return false
  }
  console.log('checkHasRoute 检查未通过')
  // return { name: '/404' }
  return false
}

const checkLogin: CheckFun = ({ to, from }) => {
  const hasToken = tokenStorage.has()
  // 检查是否是登录页（支持名称和路径匹配）
  const isLoginPage = 
    (to.name && (to.name as string).indexOf('login') > -1) ||
    to.path === '/login' ||
    to.path.startsWith('/login/')
  
  // 如果已登录但访问登录页，重定向到首页
  if (hasToken && isLoginPage) {
    return { path: '/' }
  }
  
  // 如果未登录且不是登录页，重定向到登录页
  if (!hasToken && !isLoginPage) {
    console.log('checkLogin 检查未通过：未登录')
    return { path: '/login' }
  }
  
  return false
}

const checkToken: CheckFun = ({ to, from }) => {
  // 检查 token 是否存在且有效
  if (!tokenStorage.has()) {
    console.log('checkToken 检查未通过：token 无效')
    return { path: '/login' }
  }
  return false
}

const setMenu: CheckFun = async ({ to, from }) => {
  const routerStore = useRouterStore()
  // 如果菜单未初始化，尝试初始化菜单
  if (!routerStore.roles || routerStore.roles.length === 0) {
    try {
      const res = await routerStore.initMenu()
      if (res.status !== 200) {
        console.error('菜单初始化失败:', res)
        // 菜单初始化失败，可能是 token 过期，跳转到登录页
        return { path: '/login' }
      }
    } catch (error) {
      console.error('菜单初始化异常:', error)
      // 菜单初始化异常，跳转到登录页
      return { path: '/login' }
    }
  }
  return false
}

const checkToPath: CheckFun = async ({ to, from }) => {
  const routerStore = useRouterStore()
  const roles = routerStore.roles
  
  // 如果菜单为空，说明可能未初始化，先尝试初始化
  if (!roles || roles.length === 0) {
    // 已经在 setMenu 中处理了初始化，这里直接返回 false 继续后续检查
    return false
  }
  
  // 获取路由路径和名称，用于匹配菜单权限
  const routePath = to.path
  const routeName = to.name?.toString() || ''
  
  // 规范化路径：移除尾部斜杠（除了根路径）
  const normalizePath = (path: string): string => {
    if (path === '/') return '/'
    return path.replace(/\/$/, '')
  }
  
  const normalizedPath = normalizePath(routePath)
  
  // 检查路由是否在菜单权限中
  // 同时检查路径和名称，因为菜单中的 path 可能是路径格式
  const hasPermission = 
    isValueExistsInTree(roles, 'path', normalizedPath) ||
    isValueExistsInTree(roles, 'path', routePath) ||
    isValueExistsInTree(roles, 'path', routeName) ||
    isValueExistsInTree(roles, 'route_name', routeName)
  
  if (hasPermission) {
    return false
  }

  console.warn('checkToPath 检查未通过：没有访问权限', { 
    to, 
    routePath, 
    routeName, 
    normalizedPath,
    roles 
  })
  // 使用路径重定向到 404，避免整页刷新
  return { path: '/[...notFond]' }
}

const Auth = [checkLogin, checkToken, setMenu, checkToPath]

// 不需要权限检查的路由（支持名称和路径匹配）
const NotCheckRouter = ['/login', '/404', '/[...notFond]', '/about']

export { Auth, NotCheckRouter }

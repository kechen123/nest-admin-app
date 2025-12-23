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
  const isLoginPage = to.name && (to.name as string).indexOf('login') > -1
  
  // 如果已登录但访问登录页，重定向到首页
  if (hasToken && isLoginPage) {
    return { name: '/' }
  }
  
  // 如果未登录且不是登录页，重定向到登录页
  if (!hasToken && !isLoginPage) {
    console.log('checkLogin 检查未通过：未登录')
    return { name: '/login' }
  }
  
  return false
}

const checkToken: CheckFun = ({ to, from }) => {
  // 检查 token 是否存在且有效
  if (!tokenStorage.has()) {
    console.log('checkToken 检查未通过：token 无效')
    return { name: '/login' }
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
        return { name: '/login' }
      }
    } catch (error) {
      console.error('菜单初始化异常:', error)
      // 菜单初始化异常，跳转到登录页
      return { name: '/login' }
    }
  }
  return false
}

const checkToPath: CheckFun = async ({ to, from }) => {
  const routerStore = useRouterStore()
  const roles = routerStore.roles
  const toPath = to.name as string
  
  // 如果菜单为空，说明可能未初始化，先尝试初始化
  if (!roles || roles.length === 0) {
    // 已经在 setMenu 中处理了初始化，这里直接返回 false 继续后续检查
    return false
  }
  
  // 检查路由是否在菜单权限中
  if (isValueExistsInTree(roles, 'path', toPath)) {
    return false
  }

  console.warn('checkToPath 检查未通过：没有访问权限', { to, roles, toPath })
  return { name: '/404' }
}

const Auth = [checkLogin, checkToken, setMenu, checkToPath]

const NotCheckRouter = ['/login', '/404', '/[...notFond]']

export { Auth, NotCheckRouter }

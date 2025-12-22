import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useRouterStore } from '@/stores/router'
import { isValueExistsInTree } from '@/utils/common'

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
  const token = localStorage.getItem('token')
  const login = token && token !== 'undefined' && token !== 'null' && token !== ''
  const isLoginPage = to.name && (to.name as string).indexOf('login') > -1
  if (!login && !isLoginPage) {
    console.log('checkLogin 检查未通过')
    return { name: '/login' }
  }
  return false
}

const checkToken: CheckFun = ({ to, from }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('checkToken 检查未通过')
    return { name: '/login' }
  }
  return false
}

const setMenu: CheckFun = async ({ to, from }) => {
  const routerStore = useRouterStore()
  if (!routerStore.roles || routerStore.roles.length === 0) {
    const res = await routerStore.initMenu()
    if (res.status != 200) {
      console.log('/rs/menu 检查未通过')
      return { name: '/login' }
    }
  }
  return false
}

const checkToPath: CheckFun = async ({ to, from }) => {
  const roles = useRouterStore().roles
  const toPath = to.name as string
  if (isValueExistsInTree(roles, 'path', toPath)) {
    return false
  }

  console.log('checkToPath 检查未通过 没有访问权限', to, roles, toPath)
  return { name: '/404' }
}

const Auth = [checkLogin, checkToken, setMenu, checkToPath]

const NotCheckRouter = ['/login', '/404', '/[...notFond]']

export { Auth, NotCheckRouter }

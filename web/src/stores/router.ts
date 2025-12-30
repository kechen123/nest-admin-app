import { getMenuPageTree, type FrontendMenu } from '@/api/sys_menu'
import type { RouteRecordRaw } from 'vue-router'

const modules = import.meta.glob('@/pages/**/*.vue')

const generaRoutes = (menus: FrontendMenu[]) => {
  const routes: RouteRecordRaw[] = []
  menus.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      routes.push(...generaRoutes(menu.children))
    } else {
      let path = menu.component || menu.path
      if (path.startsWith('/')) {
        path = path.substring(1)
      }
      routes.push({
        path: menu.path,
        name: menu.name || menu.path || (menu.id as string),
        // redirect: menu.path,
        component: modules[`/src/pages/${path}.vue`],
        children: [],
        meta: {
          title: menu.title,
          icon: menu.icon,
          hidden: menu.hidden,
          permissionCode: menu.permissionCode,
        },
      })
    }
  })
  return routes
}

export const useRouterStore = defineStore(
  'router',
  () => {
    const roles = ref<FrontendMenu[]>([])

    /**
     * 初始化菜单（从后端获取菜单树并转换为前端格式）
     */
    const initMenu = async () => {
      try {
        const menus = await getMenuPageTree()
        roles.value = menus as FrontendMenu[]
        return { status: 200, data: menus }
      } catch (error: any) {
        console.error('获取菜单失败:', error)
        return { status: error?.response?.status || 500, data: [] }
      }
    }

    const initRoutes = async () => {
      const routes = await generaRoutes(roles.value)
      console.log(routes)
      return routes
    }

    /**
     * 手动设置角色/菜单数据
     */
    const addRoles = (r: FrontendMenu[]) => {
      roles.value = r
    }

    const clearRoles = () => {
      roles.value = []
    }

    return { roles, initMenu, initRoutes, addRoles, clearRoles }
  },
  {
    persist: true,
  },
)

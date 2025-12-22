import axios from '@/utils/http/axios'

// 后端菜单数据接口
export interface BackendMenu {
  id: number
  name: string
  path?: string
  icon?: string
  parentId?: number
  component?: string
  sort: number
  status: number
  permissionCode?: string
  isExternal: number
  children?: BackendMenu[]
  createdAt: Date
  updatedAt: Date
}

// 前端菜单数据接口
export interface FrontendMenu {
  id: number | string
  menu_name: string
  path: string
  route_name?: string
  icon?: string
  children?: FrontendMenu[]
}

/**
 * 将后端菜单数据转换为前端需要的格式
 */
const transformMenu = (menu: BackendMenu): FrontendMenu => {
  const frontendMenu: FrontendMenu = {
    id: menu.id,
    menu_name: menu.name,
    path: menu.path || '',
    route_name: menu.path || '',
    icon: menu.icon,
  }

  // 递归转换子菜单
  if (menu.children && menu.children.length > 0) {
    frontendMenu.children = menu.children.map((child) => transformMenu(child))
  }

  return frontendMenu
}

/**
 * 获取菜单列表（分页）
 */
export const getMenuList = (params: any) => {
  return axios.get('/menus', { params })
}

/**
 * 获取菜单树（适配后端接口）
 */
export const getMenuTree = () => {
  return axios.get<BackendMenu[]>('/menus/tree')
}

/**
 * 获取菜单树并转换为前端格式
 */
export const getMenuTreeTransformed = async (): Promise<FrontendMenu[]> => {
  const menus = await getMenuTree()
  return menus.map((menu) => transformMenu(menu))
}

/**
 * 根据ID获取菜单详情
 */
export const getMenu = (id: string | number) => {
  return axios.get(`/menus/${id}`)
}

/**
 * 创建菜单
 */
export const addMenu = (data: any) => {
  return axios.post('/menus', data)
}

/**
 * 更新菜单
 */
export const updateMenu = (id: string | number, data: any) => {
  return axios.patch(`/menus/${id}`, data)
}

/**
 * 删除菜单
 */
export const deleteMenu = (id: string | number) => {
  return axios.delete(`/menus/${id}`)
}

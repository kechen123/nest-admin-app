import axios from '@/utils/http/axios'

// 后端菜单数据接口
export interface BackendMenu {
  id: number
  name: string
  title: string
  path?: string
  icon?: string
  parentId?: number
  component?: string
  sort: number
  status: number
  permissionCode?: string
  menuType?: string
  isExternal: number
  visible?: number
  isCache?: number
  query?: string
  remark?: string
  children?: BackendMenu[]
  createdAt: Date
  updatedAt: Date
}

// 前端菜单数据接口
export interface FrontendMenu {
  id: number | string
  title: string
  path: string
  route_name?: string
  icon?: string
  children?: FrontendMenu[]
}

// 分页响应接口
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 拼接路径的辅助函数
 */
const joinPath = (parentPath: string, childPath: string): string => {
  // 如果子路径为空，使用父路径
  if (!childPath || !childPath.trim()) {
    return parentPath || ''
  }

  // 如果父路径为空，直接返回子路径
  if (!parentPath || !parentPath.trim()) {
    return childPath.startsWith('/') ? childPath : `/${childPath}`
  }

  // 确保父路径以 / 结尾，子路径不以 / 开头
  const normalizedParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
  const normalizedChild = childPath.startsWith('/') ? childPath.slice(1) : childPath

  return `${normalizedParent}/${normalizedChild}`
}

/**
 * 获取菜单列表（分页）
 */
export const getMenuList = (params: any) => {
  return axios.get<PaginationResponse<BackendMenu>>('/menus', { params })
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
  const menus = (await getMenuTree()) as any // axios拦截器已经返回了data字段，所以res就是BackendMenu[]
  return menus
}

/**
 * 将后端菜单格式转换为前端菜单格式
 */
const transformBackendMenuToFrontend = (menu: BackendMenu): FrontendMenu => {
  return {
    id: menu.id,
    title: menu.title,
    path: menu.path || '',
    route_name: menu.name || menu.component,
    icon: menu.icon,
    children: menu.children?.map(transformBackendMenuToFrontend),
  }
}

/**
 * 获取页面菜单树（登录后使用，已过滤按钮类型）
 */
export const getMenuPageTree = async (): Promise<FrontendMenu[]> => {
  // axios拦截器已经返回了data字段，所以res就是BackendMenu[]
  const menus = (await axios.get<BackendMenu[]>('/menus/page-tree')) as any as BackendMenu[]
  return menus.map(transformBackendMenuToFrontend)
}

/**
 * 根据ID获取菜单详情
 */
export const getMenu = (id: string | number) => {
  return axios.get<BackendMenu>(`/menus/${id}`)
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

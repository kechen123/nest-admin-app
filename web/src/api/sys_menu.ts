import axios from '@/utils/http/axios'

// 后端菜单数据接口（与数据库字段完全匹配）
export interface BackendMenu {
  id: number
  name: string
  title: string
  permissionCode?: string
  menuType: 'M' | 'C' | 'F' // M-目录, C-菜单, F-按钮
  path?: string
  component?: string
  query?: string
  isFrame: number // 是否外链: 0-是, 1-否
  isCache: number // 是否缓存: 0-缓存, 1-不缓存
  visible: number // 显示状态: 0-隐藏, 1-显示
  status: number // 状态: 0-禁用, 1-正常
  icon?: string
  parentId: number // 父菜单ID
  orderNum: number // 显示顺序
  remark?: string
  children?: BackendMenu[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

// 前端菜单数据接口（用于侧边栏展示）
export interface FrontendMenu {
  id: number | string
  title: string
  path: string
  component: string
  name?: string
  icon?: string
  children?: FrontendMenu[]
  hidden?: boolean
  permissionCode?: string
}

// 路由元信息接口
export interface RouteMeta {
  title: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  permissionCode?: string
  orderNum?: number
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 'M',
  MENU = 'C',
  BUTTON = 'F',
}

// 菜单状态枚举
export enum MenuStatus {
  DISABLED = 0,
  ENABLED = 1,
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
  const menus = (await getMenuTree()) as BackendMenu[] // axios拦截器已经返回了data字段，所以res就是BackendMenu[]
  return menus.map(transformBackendMenuToFrontend).filter(menu => menu !== null)
}

/**
 * 将后端菜单格式转换为前端菜单格式
 */
const transformBackendMenuToFrontend = (menu: BackendMenu): FrontendMenu => {
  // 过滤掉按钮类型的菜单项（只保留目录和菜单类型）
  if (menu.menuType === 'F') {
    return null as any // 过滤掉按钮类型
  }

  return {
    id: menu.id,
    title: menu.title,
    path: menu.path || '',
    name: menu.name,
    component: menu.component || '',
    icon: menu.icon,
    hidden: menu.visible === 0,
    permissionCode: menu.permissionCode,
    children: menu.children
      ?.map(transformBackendMenuToFrontend)
      .filter(child => child !== null), // 过滤掉null值
  }
}

/**
 * 获取页面菜单树（登录后使用，已过滤按钮类型）
 * 返回原始后端格式，用于路由转换
 */
export const getMenuPageTree = async (): Promise<BackendMenu[]> => {
  const menus = await axios.get<BackendMenu[]>('/menus/page-tree')
  return menus as unknown as BackendMenu[]
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

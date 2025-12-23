import axios from '@/utils/http/axios'
import type { Permission } from './permission'
import type { FrontendMenu } from './sys_menu'

export interface Role {
  id: number
  name: string
  code: string
  dataScope?: string
  orderNum?: number
  status?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
  permissions?: Permission[] | number[]
  menus?: FrontendMenu[] | number[]
}

export interface CreateRoleDto {
  name: string
  code: string
  dataScope?: string
  orderNum?: number
  status?: number
  remark?: string
  permissions?: number[]
  menuIds?: number[]
}

export interface UpdateRoleDto {
  name?: string
  code?: string
  dataScope?: string
  orderNum?: number
  status?: number
  remark?: string
  permissions?: number[]
  menuIds?: number[]
}

export interface QueryRoleParams {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 角色 API
export const roleApi = {
  // 获取所有角色列表（不分页）
  getAllRoles() {
    return axios.get<Role[]>('/roles/all')
  },

  // 获取角色列表
  getRoleList(params?: QueryRoleParams) {
    return axios.get<PaginationResponse<Role>>('/roles', { params })
  },

  // 获取角色详情
  getRoleById(id: number) {
    return axios.get<Role>(`/roles/${id}`)
  },

  // 创建角色
  createRole(data: CreateRoleDto) {
    return axios.post<Role>('/roles', data)
  },

  // 更新角色
  updateRole(id: number, data: UpdateRoleDto) {
    return axios.patch<Role>(`/roles/${id}`, data)
  },

  // 删除角色
  deleteRole(id: number) {
    return axios.delete(`/roles/${id}`)
  },

  // 分配权限
  assignPermissions(roleId: number, permissionIds: number[]) {
    return axios.post(`/roles/${roleId}/permissions`, { permissionIds })
  },

  // 分配菜单
  assignMenus(roleId: number, menuIds: number[]) {
    return axios.post(`/roles/${roleId}/menus`, { menuIds })
  },
}

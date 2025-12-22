import axios from '@/utils/http/axios'

export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number
  path?: string
  icon?: string
  sort: number
  createdAt: string
  children?: Permission[]
}

export interface CreatePermissionDto {
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  icon?: string
  sort?: number
}

export interface UpdatePermissionDto {
  name?: string
  code?: string
  type?: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  icon?: string
  sort?: number
}

export interface QueryPermissionParams {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  type?: string
  parentId?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 权限 API
export const permissionApi = {
  // 获取权限列表（树形结构）
  getPermissionTree() {
    return axios.get<Permission[]>('/permissions/tree')
  },

  // 获取权限列表（分页）
  getPermissionList(params?: QueryPermissionParams) {
    return axios.get<PaginationResponse<Permission>>('/permissions', { params })
  },

  // 获取权限详情
  getPermissionById(id: number) {
    return axios.get<Permission>(`/permissions/${id}`)
  },

  // 创建权限
  createPermission(data: CreatePermissionDto) {
    return axios.post<Permission>('/permissions', data)
  },

  // 更新权限
  updatePermission(id: number, data: UpdatePermissionDto) {
    return axios.patch<Permission>(`/permissions/${id}`, data)
  },

  // 删除权限
  deletePermission(id: number) {
    return axios.delete(`/permissions/${id}`)
  },
}


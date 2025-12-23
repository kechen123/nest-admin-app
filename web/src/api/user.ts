import axios from '@/utils/http/axios'

export interface Role {
  id: number
  name: string
  code: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  gender?: number
  deptId?: number
  postId?: number
  loginIp?: string
  loginDate?: string
  remark?: string
  status: number
  isAdmin?: number
  delFlag?: number
  createdBy?: number
  updatedBy?: number
  role?: string
  roles?: Role[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateUserDto {
  username: string
  email: string
  password: string
  nickname?: string
  avatar?: string
  phone?: string
  gender?: number
  deptId?: number
  postId?: number
  remark?: string
  status?: number
  isAdmin?: number
  role?: string
  roleIds?: number[]
}

export interface UpdateUserDto {
  email?: string
  password?: string
  nickname?: string
  avatar?: string
  phone?: string
  gender?: number
  deptId?: number
  postId?: number
  remark?: string
  status?: number
  isAdmin?: number
  role?: string
  roleIds?: number[]
}

export interface QueryUserParams {
  page?: number
  pageSize?: number
  username?: string
  email?: string
  role?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户 API
export const userApi = {
  // 获取用户列表
  getUserList(params?: QueryUserParams) {
    return axios.get<PaginationResponse<User>>('/users', { params })
  },

  // 获取用户详情
  getUserById(id: number) {
    return axios.get<User>(`/users/${id}`)
  },

  // 创建用户
  createUser(data: CreateUserDto) {
    return axios.post<User>('/users', data)
  },

  // 更新用户
  updateUser(id: number, data: UpdateUserDto) {
    return axios.patch<User>(`/users/${id}`, data)
  },

  // 删除用户
  deleteUser(id: number) {
    return axios.delete(`/users/${id}`)
  },
}


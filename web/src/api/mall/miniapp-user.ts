import axios from '@/utils/http/axios'

export interface MiniappUser {
  id: number
  openid: string
  unionid?: string
  nickname?: string
  avatar?: string
  phone?: string
  gender: number
  balance: number
  points: number
  memberLevel: number
  totalConsumption: number
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface UpdateMiniappUserDto {
  nickname?: string
  phone?: string
  status?: number
  memberLevel?: number
}

export interface QueryMiniappUserParams {
  page?: number
  pageSize?: number
  nickname?: string
  phone?: string
  status?: number
  memberLevel?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 小程序用户 API
export const miniappUserApi = {
  // 分页查询小程序用户列表
  getMiniappUserList(params?: QueryMiniappUserParams) {
    return axios.get<PaginationResponse<MiniappUser>>('/mall/miniapp-users', { params })
  },

  // 根据ID获取小程序用户详情
  getMiniappUserById(id: number) {
    return axios.get<MiniappUser>(`/mall/miniapp-users/${id}`)
  },

  // 更新小程序用户信息
  updateMiniappUser(id: number, data: UpdateMiniappUserDto) {
    return axios.patch<MiniappUser>(`/mall/miniapp-users/${id}`, data)
  },

  // 更新用户状态（启用/禁用）
  updateUserStatus(id: number, status: number) {
    return axios.patch<MiniappUser>(`/mall/miniapp-users/${id}/status`, { status })
  },

  // 调整用户余额
  adjustBalance(id: number, amount: number, remark?: string) {
    return axios.patch<MiniappUser>(`/mall/miniapp-users/${id}/balance`, { amount, remark })
  },

  // 调整用户积分
  adjustPoints(id: number, points: number, remark?: string) {
    return axios.patch<MiniappUser>(`/mall/miniapp-users/${id}/points`, { points, remark })
  },
}


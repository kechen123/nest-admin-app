import axios from '@/utils/http/axios'

export interface LoginLog {
  id: number
  username?: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  status: number
  msg?: string
  loginTime?: string
}

export interface QueryLoginLogParams {
  page?: number
  pageSize?: number
  username?: string
  ipaddr?: string
  status?: number
  startTime?: string
  endTime?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const loginLogApi = {
  // 获取登录日志列表
  getLoginLogList(params?: QueryLoginLogParams) {
    return axios.get<PaginationResponse<LoginLog>>('/login-logs', { params })
  },

  // 获取登录日志详情
  getLoginLogById(id: number) {
    return axios.get<LoginLog>(`/login-logs/${id}`)
  },

  // 创建登录日志
  createLoginLog(data: Partial<LoginLog>) {
    return axios.post<LoginLog>('/login-logs', data)
  },

  // 删除登录日志
  deleteLoginLog(id: number) {
    return axios.delete(`/login-logs/${id}`)
  },

  // 批量删除登录日志
  deleteLoginLogBatch(ids: number[]) {
    return axios.delete(`/login-logs/batch/${ids.join(',')}`)
  },
}


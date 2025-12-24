import axios from '@/utils/http/axios'

export interface OperationLog {
  id: number
  title?: string
  businessType?: string
  method?: string
  requestMethod?: string
  operatorType?: number
  userId?: number
  username?: string
  operUrl?: string
  operIp?: string
  operLocation?: string
  operParam?: string
  jsonResult?: string
  status: number
  errorMsg?: string
  operTime?: string
}

export interface QueryOperationLogParams {
  page?: number
  pageSize?: number
  title?: string
  businessType?: string
  username?: string
  status?: number
  userId?: number
  startTime?: string
  endTime?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const operationLogApi = {
  // 获取操作日志列表
  getOperationLogList(params?: QueryOperationLogParams) {
    return axios.get<PaginationResponse<OperationLog>>('/operation-logs', { params })
  },

  // 获取操作日志详情
  getOperationLogById(id: number) {
    return axios.get<OperationLog>(`/operation-logs/${id}`)
  },

  // 创建操作日志
  createOperationLog(data: Partial<OperationLog>) {
    return axios.post<OperationLog>('/operation-logs', data)
  },

  // 删除操作日志
  deleteOperationLog(id: number) {
    return axios.delete(`/operation-logs/${id}`)
  },

  // 批量删除操作日志
  deleteOperationLogBatch(ids: number[]) {
    return axios.delete(`/operation-logs/batch/${ids.join(',')}`)
  },
}


import { http } from '@/http/http'

/**
 * 打卡记录接口
 */
export interface ICheckinRecord {
  id: number
  userId: number
  latitude: number
  longitude: number
  address: string
  content?: string
  images?: string[]
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * 创建打卡记录DTO
 */
export interface ICreateCheckinDto {
  latitude: number
  longitude: number
  address: string
  content?: string
  images?: string[]
}

/**
 * 更新打卡记录DTO
 */
export interface IUpdateCheckinDto {
  latitude?: number
  longitude?: number
  address?: string
  content?: string
  images?: string[]
}

/**
 * 查询打卡记录参数
 */
export interface IQueryCheckinDto {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}

/**
 * 打卡统计信息
 */
export interface ICheckinStatistics {
  total: number
  thisMonth: number
  thisWeek: number
}

/**
 * 分页响应
 */
export interface IPaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 创建打卡记录
 */
export function createCheckin(data: ICreateCheckinDto) {
  return http.post<ICheckinRecord>('/miniapp/checkin', data)
}

/**
 * 获取打卡记录列表
 */
export function getCheckinList(params?: IQueryCheckinDto) {
  return http.get<IPaginationResponse<ICheckinRecord>>('/miniapp/checkin', {
    params,
  })
}

/**
 * 获取打卡记录详情
 */
export function getCheckinDetail(id: number) {
  return http.get<ICheckinRecord>(`/miniapp/checkin/${id}`)
}

/**
 * 更新打卡记录
 */
export function updateCheckin(id: number, data: IUpdateCheckinDto) {
  return http.patch<ICheckinRecord>(`/miniapp/checkin/${id}`, data)
}

/**
 * 删除打卡记录
 */
export function deleteCheckin(id: number) {
  return http.delete(`/miniapp/checkin/${id}`)
}

/**
 * 获取打卡统计
 */
export function getCheckinStatistics() {
  return http.get<ICheckinStatistics>('/miniapp/checkin/statistics')
}

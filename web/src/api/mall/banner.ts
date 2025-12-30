import axios from '@/utils/http/axios'

export interface Banner {
  id: number
  title: string
  image: string
  linkType: number
  linkValue?: string
  sortOrder: number
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateBannerDto {
  title: string
  image: string
  linkType?: number
  linkValue?: string
  sortOrder?: number
  status?: number
}

export interface UpdateBannerDto {
  title?: string
  image?: string
  linkType?: number
  linkValue?: string
  sortOrder?: number
  status?: number
}

export interface QueryBannerParams {
  page?: number
  pageSize?: number
  title?: string
  status?: number
  linkType?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 轮播图 API
export const bannerApi = {
  // 分页查询轮播图列表
  getBannerList(params?: QueryBannerParams) {
    return axios.get<PaginationResponse<Banner>>('/mall/banners', { params })
  },

  // 根据ID获取轮播图详情
  getBannerById(id: number) {
    return axios.get<Banner>(`/mall/banners/${id}`)
  },

  // 创建轮播图
  createBanner(data: CreateBannerDto) {
    return axios.post<Banner>('/mall/banners', data)
  },

  // 更新轮播图
  updateBanner(id: number, data: UpdateBannerDto) {
    return axios.patch<Banner>(`/mall/banners/${id}`, data)
  },

  // 删除轮播图
  deleteBanner(id: number) {
    return axios.delete<void>(`/mall/banners/${id}`)
  },
}


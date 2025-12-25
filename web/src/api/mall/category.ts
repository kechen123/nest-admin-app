import axios from '@/utils/http/axios'

export interface Category {
  id: number
  name: string
  icon?: string
  parentId: number
  orderNum: number
  status: number
  createdAt?: string
  updatedAt?: string
  parent?: Category
  children?: Category[]
}

export interface CreateCategoryDto {
  name: string
  icon?: string
  parentId?: number
  orderNum?: number
  status?: number
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
  parentId?: number
  orderNum?: number
  status?: number
}

export interface QueryCategoryParams {
  page?: number
  pageSize?: number
  name?: string
  parentId?: number
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 商品分类 API
export const categoryApi = {
  // 分页查询分类列表
  getCategoryList(params?: QueryCategoryParams) {
    return axios.get<PaginationResponse<Category>>('/mall/categories', { params })
  },

  // 获取分类树
  getCategoryTree() {
    return axios.get<Category[]>('/mall/categories/tree')
  },

  // 根据ID获取分类详情
  getCategoryById(id: number) {
    return axios.get<Category>(`/mall/categories/${id}`)
  },

  // 创建分类
  createCategory(data: CreateCategoryDto) {
    return axios.post<Category>('/mall/categories', data)
  },

  // 更新分类
  updateCategory(id: number, data: UpdateCategoryDto) {
    return axios.patch<Category>(`/mall/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: number) {
    return axios.delete(`/mall/categories/${id}`)
  },
}


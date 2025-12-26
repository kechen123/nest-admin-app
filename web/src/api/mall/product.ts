import axios from '@/utils/http/axios'

export interface Product {
  id: number
  name: string
  subtitle?: string
  categoryId: number
  category?: {
    id: number
    name: string
  }
  mainImage?: string
  detail?: string
  minPrice: number
  maxPrice: number
  sales: number
  stock: number
  sortOrder: number
  isRecommend: number
  isNew: number
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductSkuDto {
  skuCode: string
  specName: string
  specValues: string
  price: number
  originalPrice?: number
  stock?: number
  image?: string
  status?: number
}

export interface CreateProductDto {
  name: string
  subtitle?: string
  categoryId: number
  mainImage?: string
  detail?: string
  sortOrder?: number
  isRecommend?: number
  isNew?: number
  status?: number
  skus?: CreateProductSkuDto[]
}

export interface UpdateProductDto {
  name?: string
  subtitle?: string
  categoryId?: number
  mainImage?: string
  detail?: string
  sortOrder?: number
  isRecommend?: number
  isNew?: number
  status?: number
}

export interface QueryProductParams {
  page?: number
  pageSize?: number
  name?: string
  categoryId?: number
  status?: number
  isRecommend?: number
  isNew?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 商品 API
export const productApi = {
  // 分页查询商品列表
  getProductList(params?: QueryProductParams) {
    return axios.get<PaginationResponse<Product>>('/mall/products', { params })
  },

  // 根据ID获取商品详情
  getProductById(id: number) {
    return axios.get<Product>(`/mall/products/${id}`)
  },

  // 创建商品
  createProduct(data: CreateProductDto) {
    return axios.post<Product>('/mall/products', data)
  },

  // 更新商品
  updateProduct(id: number, data: UpdateProductDto) {
    return axios.patch<Product>(`/mall/products/${id}`, data)
  },

  // 更新商品状态（上架/下架）
  updateProductStatus(id: number, status: number) {
    return axios.patch<Product>(`/mall/products/${id}/status`, { status })
  },

  // 删除商品
  deleteProduct(id: number) {
    return axios.delete(`/mall/products/${id}`)
  },
}


import axios from '@/utils/http/axios'

export interface ProductSku {
  id: number
  productId: number
  product?: {
    id: number
    name: string
  }
  skuCode: string
  specName: string
  specValues: string
  price: number
  originalPrice?: number
  stock: number
  sales: number
  image?: string
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductSkuDto {
  productId: number
  skuCode: string
  specName: string
  specValues: string
  price: number
  originalPrice?: number
  stock?: number
  image?: string
  status?: number
}

export interface UpdateProductSkuDto {
  productId?: number
  skuCode?: string
  specName?: string
  specValues?: string
  price?: number
  originalPrice?: number
  stock?: number
  image?: string
  status?: number
}

export interface QueryProductSkuParams {
  page?: number
  pageSize?: number
  productId?: number
  productName?: string
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 商品规格 API
export const productSkuApi = {
  // 分页查询规格列表
  getSkuList(params?: QueryProductSkuParams) {
    return axios.get<PaginationResponse<ProductSku>>('/mall/product-skus', { params })
  },

  // 根据商品ID获取所有规格
  getSkusByProductId(productId: number) {
    return axios.get<ProductSku[]>(`/mall/product-skus/product/${productId}`)
  },

  // 根据ID获取规格详情
  getSkuById(id: number) {
    return axios.get<ProductSku>(`/mall/product-skus/${id}`)
  },

  // 创建规格
  createSku(data: CreateProductSkuDto) {
    return axios.post<ProductSku>('/mall/product-skus', data)
  },

  // 批量创建规格
  createBatchSkus(productId: number, skus: Omit<CreateProductSkuDto, 'productId'>[]) {
    return axios.post<ProductSku[]>('/mall/product-skus/batch', { productId, skus })
  },

  // 更新规格
  updateSku(id: number, data: UpdateProductSkuDto) {
    return axios.patch<ProductSku>(`/mall/product-skus/${id}`, data)
  },

  // 更新规格状态
  updateSkuStatus(id: number, status: number) {
    return axios.patch<ProductSku>(`/mall/product-skus/${id}/status`, { status })
  },

  // 删除规格
  deleteSku(id: number) {
    return axios.delete(`/mall/product-skus/${id}`)
  },
}


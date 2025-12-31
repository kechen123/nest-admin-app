import { http } from '@/http/http'

/**
 * 轮播图
 */
export interface IBanner {
  id: number
  title: string
  image: string
  linkType: number
  linkValue?: string
  sortOrder: number
}

/**
 * 商品分类（支持树形结构）
 */
export interface ICategory {
  id: number
  name: string
  icon?: string
  children?: ICategory[]
}

/**
 * 商品信息
 */
export interface IProduct {
  id: number
  name: string
  subtitle?: string
  mainImage?: string
  minPrice: number
  maxPrice: number
  sales: number
  stock: number
  isRecommend?: number
  isNew?: number
}

/**
 * 商品规格选项
 */
export interface IProductSpecOption {
  id: number
  name: string // 规格名称，如：颜色、尺寸
  values: Array<{
    id: number
    value: string // 规格值，如：红色、XL
  }>
}

/**
 * 商品SKU规格值（对象格式）
 */
export interface ISkuSpecValues {
  [key: string]: string // 如：{"storage":"256GB","color":"雅川青"}
}

/**
 * 商品SKU
 */
export interface IProductSku {
  id: number
  skuCode?: string // SKU编码
  specName?: string // 规格名称（显示用），如："256GB 雅川青"
  specValues: ISkuSpecValues | string // 规格值，可能是对象或字符串
  price: number | string // 价格（可能是字符串）
  originalPrice?: number | string // 原价
  stock: number
  image?: string
}

/**
 * 商品详情（扩展字段）
 */
export interface IProductDetail extends IProduct {
  categoryId?: number // 分类ID
  categoryName?: string // 分类名称
  images?: string[] // 商品图片列表
  description?: string // 商品描述
  detailImages?: string[] // 详情图片列表
  detailHtml?: string // 详情HTML内容
  detail?: string // 详情内容（HTML字符串）
  specs?: IProductSpecOption[] // 商品规格（可选，如果没有则从skus中提取）
  skus?: IProductSku[] // 商品SKU列表
}

/**
 * 订单商品项
 */
export interface IOrderItem {
  productId: number
  skuId: number // SKU ID，后端需要
  productName: string
  productImage?: string
  specValues?: string // 选中的规格
  price: number
  quantity: number
  totalPrice: number
}

/**
 * 创建订单参数
 */
export interface ICreateOrderParams {
  items: IOrderItem[]
  remark?: string
  addressId?: number // 可选：收货地址ID
  payType?: number // 可选：支付方式 1-微信支付, 2-余额支付
}

/**
 * 商品列表查询参数
 */
export interface IProductQuery {
  categoryId?: number
  keyword?: string
  isRecommend?: number
  isNew?: number
  sortBy?: 'sales' | 'price' | 'time'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

/**
 * 商品列表响应
 */
export interface IProductListResponse {
  items: IProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 获取轮播图列表
 */
export function getBanners() {
  return http.get<IBanner[]>('/miniapp/banners')
}

/**
 * 获取商品分类列表
 */
export function getCategories() {
  return http.get<ICategory[]>('/miniapp/products/categories')
}

/**
 * 获取商品列表
 */
export function getProducts(query?: IProductQuery) {
  return http.get<IProductListResponse>('/miniapp/products', query)
}

/**
 * 获取推荐商品
 */
export function getRecommendProducts(page?: number, pageSize?: number) {
  return http.get<IProductListResponse>('/miniapp/products/recommend', { page, pageSize })
}

/**
 * 获取新品
 */
export function getNewProducts(limit?: number) {
  return http.get<IProduct[]>('/miniapp/products/new', { limit })
}

/**
 * 获取商品详情
 */
export function getProductDetail(id: number) {
  return http.get<IProductDetail>(`/miniapp/products/${id}`)
}

/**
 * 创建订单
 */
export function createOrder(params: ICreateOrderParams) {
  return http.post<{ orderId: number }>('/miniapp/orders', params)
}


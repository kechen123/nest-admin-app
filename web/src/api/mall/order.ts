import axios from '@/utils/http/axios'

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  skuId: number
  specName: string
  image?: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  orderNo: string
  userId: number
  user?: {
    id: number
    nickname?: string
    phone?: string
  }
  status: number
  totalAmount: number
  shippingFee: number
  discountAmount: number
  payAmount: number
  addressId: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
  payType: number
  payTime?: string
  shipTime?: string
  confirmTime?: string
  items?: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface QueryOrderParams {
  page?: number
  pageSize?: number
  orderNo?: string
  userId?: number
  status?: number
  payType?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 订单 API
export const orderApi = {
  // 分页查询订单列表
  getOrderList(params?: QueryOrderParams) {
    return axios.get<PaginationResponse<Order>>('/mall/orders', { params })
  },

  // 根据ID获取订单详情
  getOrderById(id: number) {
    return axios.get<Order>(`/mall/orders/${id}`)
  },

  // 根据订单号获取订单详情
  getOrderByOrderNo(orderNo: string) {
    return axios.get<Order>(`/mall/orders/order-no/${orderNo}`)
  },

  // 更新订单状态
  updateOrderStatus(id: number, status: number) {
    return axios.patch<Order>(`/mall/orders/${id}/status`, { status })
  },

  // 取消订单
  cancelOrder(id: number) {
    return axios.patch<Order>(`/mall/orders/${id}/cancel`)
  },

  // 订单发货
  shipOrder(id: number) {
    return axios.patch<Order>(`/mall/orders/${id}/ship`)
  },
}


import axios from '@/utils/http/axios'

export interface Post {
  id: number
  code: string
  name: string
  orderNum?: number
  status: number
  remark?: string
  createdBy?: number
  updatedBy?: number
  createdAt?: string
  updatedAt?: string
}

// 岗位 API
export const postApi = {
  // 获取所有岗位列表
  getAllPosts() {
    return axios.get<Post[]>('/position')
  },

  // 根据ID获取岗位详情
  getPostById(id: number) {
    return axios.get<Post>(`/position/${id}`)
  },
}


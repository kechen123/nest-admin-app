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

export interface CreatePostDto {
  code: string
  name: string
  orderNum?: number
  status?: number
  remark?: string
}

export interface UpdatePostDto {
  code?: string
  name?: string
  orderNum?: number
  status?: number
  remark?: string
}

export interface QueryPostParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 岗位 API
export const postApi = {
  // 获取所有岗位列表（不分页，用于下拉选择）
  getAllPosts() {
    return axios.get<Post[]>('/posts/all')
  },

  // 分页查询岗位列表
  getPostList(params?: QueryPostParams) {
    return axios.get<PaginationResponse<Post>>('/posts', { params })
  },

  // 根据ID获取岗位详情
  getPostById(id: number) {
    return axios.get<Post>(`/posts/${id}`)
  },

  // 创建岗位
  createPost(data: CreatePostDto) {
    return axios.post<Post>('/posts', data)
  },

  // 更新岗位
  updatePost(id: number, data: UpdatePostDto) {
    return axios.patch<Post>(`/posts/${id}`, data)
  },

  // 删除岗位
  deletePost(id: number) {
    return axios.delete(`/posts/${id}`)
  },
}


import axios from '@/utils/http/axios'

export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    username: string
    email: string
    role: string
    roles?: string[]
    permissions?: string[]
    nickname?: string
    avatar?: string
    phone?: string
    gender?: number
  }
}

export interface UserProfile {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  gender?: number
  deptId?: number
  postId?: number
  loginIp?: string
  loginDate?: string
  remark?: string
  status: number
  isAdmin?: number
  roles?: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  gender?: number
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

// 认证 API
export const authApi = {
  // 登录
  login(data: LoginDto) {
    // 登录接口由页面自己处理错误，跳过 axios 全局错误处理
    return axios.post<LoginResponse>('/auth/login', data, {
      skipGlobalErrorHandler: true,
    })
  },

  // 获取当前用户信息
  getProfile() {
    return axios.get<UserProfile>('/auth/profile')
  },

  // 更新个人信息
  updateProfile(data: UpdateProfileDto) {
    return axios.patch<UserProfile>('/auth/profile', data)
  },

  // 修改密码
  changePassword(data: ChangePasswordDto) {
    return axios.post('/auth/change-password', data)
  },

  // 退出登录
  logout() {
    return axios.post('/auth/logout')
  },
}


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
  }
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
}


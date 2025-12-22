import request from './request';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// 认证 API
export const authApi = {
  // 登录
  login(data: LoginDto) {
    return request<LoginResponse>({
      url: '/auth/login',
      method: 'post',
      data,
    });
  },
};

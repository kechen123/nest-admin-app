import request from './request';

export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  status?: boolean;
}

export interface QueryUserParams {
  page?: number;
  pageSize?: number;
  username?: string;
  email?: string;
  role?: string;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户 API
export const userApi = {
  // 获取用户列表
  getUserList(params: QueryUserParams) {
    return request<PaginationResponse<User>>({
      url: '/users',
      method: 'get',
      params,
    });
  },

  // 获取用户详情
  getUserById(id: number) {
    return request<User>({
      url: `/users/${id}`,
      method: 'get',
    });
  },

  // 创建用户
  createUser(data: CreateUserDto) {
    return request<User>({
      url: '/users',
      method: 'post',
      data,
    });
  },

  // 更新用户
  updateUser(id: number, data: UpdateUserDto) {
    return request<User>({
      url: `/users/${id}`,
      method: 'patch',
      data,
    });
  },

  // 删除用户
  deleteUser(id: number) {
    return request({
      url: `/users/${id}`,
      method: 'delete',
    });
  },
};

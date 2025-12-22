import request from "./request";
import { Permission } from "./permission";

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  permissions?: Permission[] | number[];
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  permissions?: number[];
}

export interface QueryRoleParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 角色 API
export const roleApi = {
  // 获取角色列表
  getRoleList(params: QueryRoleParams) {
    return request<PaginationResponse<Role>>({
      url: "/roles",
      method: "get",
      params,
    });
  },

  // 获取角色详情
  getRoleById(id: number) {
    return request<Role>({
      url: `/roles/${id}`,
      method: "get",
    });
  },

  // 创建角色
  createRole(data: CreateRoleDto) {
    return request<Role>({
      url: "/roles",
      method: "post",
      data,
    });
  },

  // 更新角色
  updateRole(id: number, data: UpdateRoleDto) {
    return request<Role>({
      url: `/roles/${id}`,
      method: "patch",
      data,
    });
  },

  // 删除角色
  deleteRole(id: number) {
    return request({
      url: `/roles/${id}`,
      method: "delete",
    });
  },

  // 分配权限
  assignPermissions(roleId: number, permissionIds: number[]) {
    return request({
      url: `/roles/${roleId}/permissions`,
      method: "post",
      data: { permissionIds },
    });
  },
};

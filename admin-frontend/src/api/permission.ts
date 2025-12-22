import request from "./request";

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: "menu" | "button" | "api";
  parentId: number;
  path?: string;
  icon?: string;
  sort: number;
  createdAt: string;
  children?: Permission[];
}

export interface CreatePermissionDto {
  name: string;
  code: string;
  type: "menu" | "button" | "api";
  parentId?: number;
  path?: string;
  icon?: string;
  sort?: number;
}

export interface UpdatePermissionDto {
  name?: string;
  code?: string;
  type?: "menu" | "button" | "api";
  parentId?: number;
  path?: string;
  icon?: string;
  sort?: number;
}

export interface QueryPermissionParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  type?: string;
  parentId?: number;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 权限 API
export const permissionApi = {
  // 获取权限列表（树形结构）
  getPermissionTree() {
    return request<Permission[]>({
      url: "/permissions/tree",
      method: "get",
    });
  },

  // 获取权限列表（分页）
  getPermissionList(params: QueryPermissionParams) {
    return request<PaginationResponse<Permission>>({
      url: "/permissions",
      method: "get",
      params,
    });
  },

  // 获取权限详情
  getPermissionById(id: number) {
    return request<Permission>({
      url: `/permissions/${id}`,
      method: "get",
    });
  },

  // 创建权限
  createPermission(data: CreatePermissionDto) {
    return request<Permission>({
      url: "/permissions",
      method: "post",
      data,
    });
  },

  // 更新权限
  updatePermission(id: number, data: UpdatePermissionDto) {
    return request<Permission>({
      url: `/permissions/${id}`,
      method: "patch",
      data,
    });
  },

  // 删除权限
  deletePermission(id: number) {
    return request({
      url: `/permissions/${id}`,
      method: "delete",
    });
  },
};

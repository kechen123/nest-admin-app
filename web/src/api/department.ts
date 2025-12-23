import axios from '@/utils/http/axios'

export interface Department {
  id: number
  name: string
  parentId?: number
  ancestors?: string
  leader?: string
  phone?: string
  email?: string
  orderNum?: number
  status: number
  delFlag?: number
  remark?: string
  createdBy?: number
  updatedBy?: number
  createdAt?: string
  updatedAt?: string
  parent?: Department
  children?: Department[]
}

export interface CreateDepartmentDto {
  name: string
  parentId?: number
  ancestors?: string
  leader?: string
  phone?: string
  email?: string
  orderNum?: number
  status?: number
  remark?: string
}

export interface UpdateDepartmentDto {
  name?: string
  parentId?: number
  ancestors?: string
  leader?: string
  phone?: string
  email?: string
  orderNum?: number
  status?: number
  remark?: string
}

export interface QueryDepartmentParams {
  page?: number
  pageSize?: number
  name?: string
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 部门 API
export const departmentApi = {
  // 获取部门树
  getDepartmentTree() {
    return axios.get<Department[]>('/departments/tree')
  },

  // 获取所有部门列表（不分页，用于下拉选择）
  getAllDepartments() {
    return axios.get<Department[]>('/departments/all')
  },

  // 分页查询部门列表
  getDepartmentList(params?: QueryDepartmentParams) {
    return axios.get<PaginationResponse<Department>>('/departments', { params })
  },

  // 根据ID获取部门详情
  getDepartmentById(id: number) {
    return axios.get<Department>(`/departments/${id}`)
  },

  // 创建部门
  createDepartment(data: CreateDepartmentDto) {
    return axios.post<Department>('/departments', data)
  },

  // 更新部门
  updateDepartment(id: number, data: UpdateDepartmentDto) {
    return axios.patch<Department>(`/departments/${id}`, data)
  },

  // 删除部门
  deleteDepartment(id: number) {
    return axios.delete(`/departments/${id}`)
  },
}


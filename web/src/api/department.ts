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
}

// 部门 API
export const departmentApi = {
  // 获取所有部门列表
  getAllDepartments() {
    return axios.get<Department[]>('/department')
  },

  // 根据ID获取部门详情
  getDepartmentById(id: number) {
    return axios.get<Department>(`/department/${id}`)
  },
}


import axios from '@/utils/http/axios'

export interface DictType {
  id: number
  dictName: string
  dictType: string
  status: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface DictData {
  id: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault: number
  status: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface DictOption {
  label: string
  value: string
  tagType?: string
}

export interface CreateDictTypeDto {
  dictName: string
  dictType: string
  status?: number
  remark?: string
}

export interface UpdateDictTypeDto {
  dictName?: string
  dictType?: string
  status?: number
  remark?: string
}

export interface QueryDictTypeParams {
  page?: number
  pageSize?: number
  dictName?: string
  dictType?: string
  status?: number
}

export interface CreateDictDataDto {
  dictSort?: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault?: number
  status?: number
  remark?: string
}

export interface UpdateDictDataDto {
  dictSort?: number
  dictLabel?: string
  dictValue?: string
  dictType?: string
  cssClass?: string
  listClass?: string
  isDefault?: number
  status?: number
  remark?: string
}

export interface QueryDictDataParams {
  page?: number
  pageSize?: number
  dictType?: string
  dictLabel?: string
  status?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 字典 API
export const dictApi = {
  // ==================== 字典类型管理 ====================
  
  // 创建字典类型
  createDictType(data: CreateDictTypeDto) {
    return axios.post<DictType>('/dict/types', data)
  },

  // 获取所有字典类型（不分页，用于下拉选择）
  getAllDictTypes() {
    return axios.get<DictType[]>('/dict/types/all')
  },

  // 分页查询字典类型列表
  getDictTypeList(params?: QueryDictTypeParams) {
    return axios.get<PaginationResponse<DictType>>('/dict/types', { params })
  },

  // 根据ID获取字典类型详情
  getDictTypeById(id: number) {
    return axios.get<DictType>(`/dict/types/${id}`)
  },

  // 更新字典类型
  updateDictType(id: number, data: UpdateDictTypeDto) {
    return axios.patch<DictType>(`/dict/types/${id}`, data)
  },

  // 删除字典类型
  deleteDictType(id: number) {
    return axios.delete(`/dict/types/${id}`)
  },

  // ==================== 字典数据管理 ====================

  // 创建字典数据
  createDictData(data: CreateDictDataDto) {
    return axios.post<DictData>('/dict/data', data)
  },

  // 分页查询字典数据列表
  getDictDataList(params?: QueryDictDataParams) {
    return axios.get<PaginationResponse<DictData>>('/dict/data', { params })
  },

  // 根据字典类型获取字典数据（不分页）
  getDictDataByType(dictType: string) {
    return axios.get<DictData[]>(`/dict/data/${dictType}`)
  },

  // 根据ID获取字典数据详情
  getDictDataById(id: number) {
    return axios.get<DictData>(`/dict/data/id/${id}`)
  },

  // 更新字典数据
  updateDictData(id: number, data: UpdateDictDataDto) {
    return axios.patch<DictData>(`/dict/data/${id}`, data)
  },

  // 删除字典数据
  deleteDictData(id: number) {
    return axios.delete(`/dict/data/${id}`)
  },

  // ==================== 字典选项（格式化） ====================

  // 根据字典类型获取字典选项（格式化）
  getDictOptions(dictType: string) {
    return axios.get<DictOption[]>(`/dict/options/${dictType}`)
  },
}


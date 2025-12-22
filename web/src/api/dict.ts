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

// 字典 API
export const dictApi = {
  // 获取所有字典类型
  getAllDictTypes() {
    return axios.get<DictType[]>('/dict/types')
  },

  // 根据字典类型获取字典数据
  getDictDataByType(dictType: string) {
    return axios.get<DictData[]>(`/dict/data/${dictType}`)
  },

  // 根据字典类型获取字典选项（格式化）
  getDictOptions(dictType: string) {
    return axios.get<DictOption[]>(`/dict/options/${dictType}`)
  },
}


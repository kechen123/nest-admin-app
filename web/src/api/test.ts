import axios from '@/utils/http/axios'

export const getUser = (id: string) => {
  return axios.get('/rs/list/' + id)
}

export const getList = (params: any) => {
  return axios.get('/rs/list', { params })
}

export const getDepartment = (params?: any) => {
  return axios.get('/rs/department', { params })
}

export const getPosition = (params?: any) => {
  return axios.get('/rs/position', { params })
}

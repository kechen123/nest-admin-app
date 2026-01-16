import { http } from '@/http/http'

/**
 * 用户绑定关系
 */
export interface IUserCouple {
  id: number
  userId: number
  partnerId: number
  status: number
  bindTime?: string
  unbindTime?: string
  user?: {
    id: number
    nickname?: string
    avatar?: string
  }
  partner?: {
    id: number
    nickname?: string
    avatar?: string
  }
}

/**
 * 绑定另一半DTO
 */
export interface IBindPartnerDto {
  partnerId: number
}

/**
 * 解除绑定DTO
 */
export interface IUnbindPartnerDto {
  coupleId: number
}

/**
 * 绑定另一半
 */
export function bindPartner(data: IBindPartnerDto) {
  return http.post<IUserCouple>('/miniapp/couple/bind', data)
}

/**
 * 解除绑定
 */
export function unbindPartner(data: IUnbindPartnerDto) {
  return http.delete('/miniapp/couple/unbind', {
    data,
  })
}

/**
 * 获取绑定信息
 */
export function getCoupleInfo() {
  return http.get<IUserCouple>('/miniapp/couple/info')
}

/**
 * 获取另一半信息
 */
export function getPartnerInfo() {
  return http.get('/miniapp/couple/partner')
}

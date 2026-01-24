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

/**
 * 邀请码状态枚举
 */
export enum InviteCodeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/**
 * 生成邀请码请求DTO
 */
export interface IGenerateInviteDto {
  expireHours?: number
}

/**
 * 生成邀请码响应
 */
export interface IGenerateInviteResponse {
  id: number
  code: string
  expireTime: string
  inviteUrl: string
  shareParams: {
    title: string
    path: string
    imageUrl?: string
  }
}

/**
 * 邀请码信息
 */
export interface IInviteCodeInfo {
  id: number
  code: string
  inviter: {
    id: number
    nickname: string
    avatar?: string
  }
  status: InviteCodeStatus
  expireTime: string
  createdAt: string
  isExpired: boolean
  canAccept: boolean
}

/**
 * 接受邀请DTO
 */
export interface IAcceptInviteDto {
  code: string
}

/**
 * 取消邀请DTO
 */
export interface ICancelInviteDto {
  inviteCodeId: number
}

/**
 * 用户邀请码列表项
 */
export interface IUserInviteListItem {
  id: number
  code: string
  status: InviteCodeStatus
  expireTime: string
  acceptedAt?: string
  accepter?: {
    id: number
    nickname: string
    avatar?: string
  }
  createdAt: string
  isExpired: boolean
}

/**
 * 生成邀请码
 */
export function generateInviteCode(data?: IGenerateInviteDto) {
  return http.post<IGenerateInviteResponse>('/miniapp/invite/generate', data || {})
}

/**
 * 获取邀请码信息
 */
export function getInviteInfo(code: string) {
  return http.get<IInviteCodeInfo>(`/miniapp/invite/${code}/info`)
}

/**
 * 接受邀请
 */
export function acceptInvite(data: IAcceptInviteDto) {
  return http.post('/miniapp/invite/accept', data)
}

/**
 * 取消邀请
 */
export function cancelInvite(data: ICancelInviteDto) {
  return http.delete('/miniapp/invite/cancel', {
    data,
  })
}

/**
 * 获取我的邀请码列表
 */
export function getUserInviteCodes() {
  return http.get<IUserInviteListItem[]>('/miniapp/invite/my-codes')
}

import axios from '@/utils/http/axios'

// ==================== 小程序用户 ====================
export interface MiniappUser {
  id: number
  openid: string
  unionid?: string
  nickname?: string
  avatar?: string
  gender?: number
  phone?: string
  status: number
  lastLoginTime?: string
  lastLoginIp?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface QueryMiniappUserParams {
  page?: number
  pageSize?: number
  nickname?: string
  phone?: string
  status?: number
}

// ==================== 邀请码 ====================
export interface InviteCode {
  id: number
  code: string
  inviterId: number
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expireTime: string
  acceptedAt?: string
  acceptedBy?: number
  isShared: boolean
  inviter?: {
    id: number
    nickname?: string
    avatar?: string
  }
  accepter?: {
    id: number
    nickname?: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface QueryInviteCodeParams {
  page?: number
  pageSize?: number
  code?: string
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
  inviterNickname?: string
}

// ==================== 邀请配置 ====================
export interface InviteConfig {
  id: number
  title: string
  imageUrl: string
  isEnabled: number
  sortOrder: number
  remark?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateInviteConfigDto {
  title: string
  imageUrl: string
  sortOrder?: number
  remark?: string
}

export interface UpdateInviteConfigDto {
  title?: string
  imageUrl?: string
  sortOrder?: number
  remark?: string
}

export interface QueryInviteConfigParams {
  page?: number
  pageSize?: number
  isEnabled?: number
}

export interface ToggleEnabledDto {
  isEnabled: number
}

// ==================== 打卡记录 ====================
export interface CheckinRecord {
  id: number
  userId: number
  latitude: number
  longitude: number
  address: string
  content?: string
  images?: string[]
  isPublic: number
  status: number
  auditStatus: number
  auditRemark?: string
  auditTime?: string
  auditBy?: number
  user?: {
    id: number
    nickname?: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface QueryCheckinParams {
  page?: number
  pageSize?: number
  userNickname?: string
  auditStatus?: number
  status?: number
}

export interface AuditCheckinDto {
  auditStatus: number
  auditRemark?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== API ====================
export const miniappApi = {
  // 小程序用户
  getMiniappUserList(params?: QueryMiniappUserParams) {
    return axios.get<PaginationResponse<MiniappUser>>('/admin/miniapp/users', { params })
  },

  // 邀请码
  getInviteCodeList(params?: QueryInviteCodeParams) {
    return axios.get<PaginationResponse<InviteCode>>('/admin/miniapp/invite-codes', { params })
  },
  deleteInviteCode(id: number) {
    return axios.delete(`/admin/miniapp/invite-codes/${id}`)
  },

  // 邀请配置
  getInviteConfigList(params?: QueryInviteConfigParams) {
    return axios.get<PaginationResponse<InviteConfig>>('/admin/miniapp/invite-configs', { params })
  },
  getInviteConfigById(id: number) {
    return axios.get<InviteConfig>(`/admin/miniapp/invite-configs/${id}`)
  },
  createInviteConfig(data: CreateInviteConfigDto) {
    return axios.post<InviteConfig>('/admin/miniapp/invite-configs', data)
  },
  updateInviteConfig(id: number, data: UpdateInviteConfigDto) {
    return axios.patch<InviteConfig>(`/admin/miniapp/invite-configs/${id}`, data)
  },
  toggleInviteConfigEnabled(id: number, data: ToggleEnabledDto) {
    return axios.patch<InviteConfig>(`/admin/miniapp/invite-configs/${id}/toggle-enabled`, data)
  },
  deleteInviteConfig(id: number) {
    return axios.delete(`/admin/miniapp/invite-configs/${id}`)
  },

  // 打卡记录
  getCheckinList(params?: QueryCheckinParams) {
    return axios.get<PaginationResponse<CheckinRecord>>('/admin/miniapp/checkins', { params })
  },
  deleteCheckin(id: number) {
    return axios.delete(`/admin/miniapp/checkins/${id}`)
  },
  auditCheckin(id: number, data: AuditCheckinDto) {
    return axios.patch<CheckinRecord>(`/admin/miniapp/checkins/${id}/audit`, data)
  },
}

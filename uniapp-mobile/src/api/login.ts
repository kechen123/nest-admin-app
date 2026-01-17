import type { IAuthLoginRes, ICaptcha, IDoubleTokenRes, IUpdateInfo, IUpdatePassword, IUserInfoRes } from './types/login'
import { http } from '@/http/http'

/**
 * 登录表单
 */
export interface ILoginForm {
  username: string
  password: string
}

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  return http.get<ICaptcha>('/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  return http.post<IAuthLoginRes>('/auth/login', loginForm)
}

// 小程序登录
export function miniappLogin(data: { code: string }) {
  return http.post<{ userId: number; token: string; userInfo: IUserInfoRes }>('/miniapp/user/wxLogin', data)
}


/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<IDoubleTokenRes>('/auth/refreshToken', { refreshToken })
}

/**
 * 获取用户信息（后台管理系统）
 */
export function getUserInfo() {
  return http.get<IUserInfoRes>('/user/info')
}

/**
 * 获取小程序用户信息
 * @param userId 用户ID
 */
export function getMiniappUserInfo(userId: number) {
  return http.get<{ id: number; openid: string; nickname?: string; avatar?: string; gender?: number }>(`/miniapp/user/${userId}`)
}

/**
 * 退出登录
 */
export function logout() {
  return http.post<void>('/auth/logout')
}

/**
 * 修改用户信息
 */
export function updateInfo(data: IUpdateInfo) {
  return http.post('/user/updateInfo', data)
}

/**
 * 修改用户密码
 */
export function updateUserPassword(data: IUpdatePassword) {
  return http.post('/user/updatePassword', data)
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

/**
 * 获取微信用户授权信息（需要用户主动授权）
 * @returns Promise 包含用户信息
 */
export function getWxUserProfile() {
  return new Promise<UniApp.GetUserProfileRes>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: res => resolve(res),
      fail: err => reject(new Error(err.errMsg || '获取用户信息失败')),
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('仅支持微信小程序'))
    // #endif
  })
}

/**
 * 获取微信手机号（需要用户主动授权）
 * @param encryptedData 加密数据
 * @param iv 初始向量
 * @returns Promise 包含手机号信息
 */
export function getWxPhoneNumber(encryptedData: string, iv: string) {
  return new Promise<{ phoneNumber: string; purePhoneNumber: string; countryCode: string }>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // 注意：实际应该调用后端接口解密手机号
    // 这里只是示例，实际需要后端配合
    uni.request({
      url: '/miniapp/user/decryptPhone',
      method: 'POST',
      data: { encryptedData, iv },
      success: (res: any) => {
        if (res.data.code === 0 || res.data.code === 200) {
          resolve(res.data.data)
        } else {
          reject(new Error(res.data.message || '获取手机号失败'))
        }
      },
      fail: err => reject(new Error(err.errMsg || '获取手机号失败')),
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('仅支持微信小程序'))
    // #endif
  })
}

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export function wxLogin(data: { code: string }) {
  return http.post<IAuthLoginRes>('/auth/wxLogin', data)
}

/**
 * 小程序微信登录（授权登录）
 * @param data 微信登录参数，包含code、userInfo和phone
 * @returns Promise 包含登录结果
 */
export function miniappWxLogin(data: { 
  code: string
  userInfo?: { 
    nickName?: string
    avatarUrl?: string
    gender?: number
  }
  phone?: string
}) {
  return http.post<{ 
    userId: number
    token: string
    needBindPhone: boolean
    userInfo: IUserInfoRes & { phone?: string }
  }>('/miniapp/user/wxLogin', data)
}

/**
 * 绑定手机号
 * @param phone 手机号
 * @returns Promise 包含用户信息
 */
export function bindPhone(phone: string) {
  return http.put<IUserInfoRes>('/miniapp/user/bindPhone', { phone })
}

/**
 * 获取当前登录用户信息（小程序）
 * @returns Promise 包含用户信息
 */
export function getMiniappCurrentUserInfo() {
  return http.get<IUserInfoRes>('/miniapp/user/info')
}
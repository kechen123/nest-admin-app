import type { IAuthLoginRes, ICaptcha, IDoubleTokenRes, IUpdateInfo, IUpdateMiniappUserInfo, IUpdatePassword, IUserInfoRes } from './types/login'
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
 * 小程序登录响应（后端返回格式）
 */
interface IMiniappLoginResponse {
  access_token: string
  user?: any
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export async function login(loginForm: ILoginForm) {
  const res = await http.post<IMiniappLoginResponse>('/miniapp/auth/phone-login', loginForm)
  // 将后端返回的 access_token 转换为前端需要的格式
  // 默认过期时间为 7 天（604800 秒）
  const expiresIn = 7 * 24 * 60 * 60 // 7天
  return {
    token: res.access_token,
    expiresIn,
  } as IAuthLoginRes
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<IDoubleTokenRes>('/auth/refreshToken', { refreshToken })
}

/**
 * 获取用户信息（小程序）
 */
export function getUserInfo() {
  return http.get<IUserInfoRes>('/miniapp/auth/profile')
}

/**
 * 退出登录
 */
export function logout() {
  return http.get<void>('/auth/logout')
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
 * 修改小程序用户密码
 * @param data 密码修改数据
 * @returns Promise
 */
export function updateMiniappPassword(data: { oldPassword: string; newPassword: string }) {
  return http.post('/miniapp/auth/change-password', data)
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
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export async function wxLogin(data: { code: string }) {
  const res = await http.post<IMiniappLoginResponse>('/miniapp/auth/login', data)
  // 将后端返回的 access_token 转换为前端需要的格式
  // 默认过期时间为 7 天（604800 秒）
  const expiresIn = 7 * 24 * 60 * 60 // 7天
  return {
    token: res.access_token,
    expiresIn,
  } as IAuthLoginRes
}

/**
 * 更新小程序用户信息
 * @param data 用户信息更新数据
 * @returns Promise 包含更新后的用户信息
 */
export function updateMiniappUserInfo(data: IUpdateMiniappUserInfo) {
  return http<IUserInfoRes>({
    url: '/miniapp/auth/profile',
    method: 'PATCH',
    data,
  })
}

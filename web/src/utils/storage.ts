/**
 * 统一的存储工具类
 * 封装 localStorage 操作，提供类型安全的存储接口
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'user_info'

/**
 * Token 管理
 */
export const tokenStorage = {
  /**
   * 获取 token
   */
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * 设置 token
   */
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * 移除 token
   */
  remove(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  /**
   * 检查 token 是否存在且有效
   */
  has(): boolean {
    const token = this.get()
    return !!(token && token !== 'undefined' && token !== 'null' && token !== '')
  },
}

/**
 * 用户信息管理
 */
export const userStorage = {
  /**
   * 获取用户信息
   */
  get<T = any>(): T | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    if (!userInfo) return null
    try {
      return JSON.parse(userInfo) as T
    } catch {
      return null
    }
  },

  /**
   * 设置用户信息
   */
  set<T = any>(userInfo: T): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  },

  /**
   * 移除用户信息
   */
  remove(): void {
    localStorage.removeItem(USER_INFO_KEY)
  },

  /**
   * 检查用户信息是否存在
   */
  has(): boolean {
    return !!this.get()
  },
}

/**
 * 清除所有认证相关的存储
 */
export const clearAuthStorage = (): void => {
  tokenStorage.remove()
  userStorage.remove()
}


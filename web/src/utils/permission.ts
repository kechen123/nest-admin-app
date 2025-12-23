/**
 * 权限管理工具类
 * 提供统一的权限检查和管理功能
 */

import { tokenStorage, userStorage } from './storage'
import { useRouterStore } from '@/stores/router'
import { isValueExistsInTree } from './common'

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
  return tokenStorage.has()
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = <T = any>(): T | null => {
  return userStorage.get<T>()
}

/**
 * 检查用户是否有访问指定路由的权限
 * @param routePath 路由路径（route name）
 */
export const hasRoutePermission = (routePath: string): boolean => {
  const routerStore = useRouterStore()
  const roles = routerStore.roles
  
  if (!roles || roles.length === 0) {
    return false
  }
  
  return isValueExistsInTree(roles, 'path', routePath)
}

/**
 * 检查用户是否有指定的权限代码
 * @param permissionCode 权限代码
 */
export const hasPermission = (permissionCode: string): boolean => {
  const routerStore = useRouterStore()
  const roles = routerStore.roles
  
  if (!roles || roles.length === 0) {
    return false
  }
  
  // 在菜单树中查找是否有匹配的权限代码
  return isValueExistsInTree(roles, 'permissionCode', permissionCode)
}

/**
 * 检查用户是否是管理员
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser<{ role?: string; isAdmin?: number }>()
  if (!user) return false
  
  return user.isAdmin === 1 || user.role === 'admin'
}

/**
 * 获取用户角色列表
 */
export const getUserRoles = (): string[] => {
  const user = getCurrentUser<{ role?: string; roles?: Array<{ code: string }> }>()
  if (!user) return []
  
  // 如果用户有 roles 数组，提取 code
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.map(r => r.code).filter(Boolean)
  }
  
  // 否则使用 role 字段
  if (user.role) {
    return [user.role]
  }
  
  return []
}


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
  const roles = routerStore.menus

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
  const user = getCurrentUser<{ permissions?: string[]; isAdmin?: number }>()

  // 管理员拥有所有权限
  if (user?.isAdmin === 1) {
    return true
  }

  // 1. 从菜单树中查找（包括按钮类型的菜单）
  const roles = routerStore.menus
  if (roles && roles.length > 0) {
    const foundInMenu = isValueExistsInTree(roles, 'permissionCode', permissionCode)
    if (foundInMenu) {
      return true
    }
  }

  // 2. 从用户登录时返回的 permissions 数组中查找（来自 permissions 表）
  if (user?.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permissionCode)
  }

  return false
}

/**
 * 检查用户是否有任意一个权限
 * @param permissionCodes 权限代码数组
 */
export const hasAnyPermission = (permissionCodes: string[]): boolean => {
  if (!permissionCodes || permissionCodes.length === 0) {
    return true
  }
  return permissionCodes.some((code) => hasPermission(code))
}

/**
 * 检查用户是否拥有所有权限
 * @param permissionCodes 权限代码数组
 */
export const hasAllPermissions = (permissionCodes: string[]): boolean => {
  if (!permissionCodes || permissionCodes.length === 0) {
    return true
  }
  return permissionCodes.every((code) => hasPermission(code))
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
    return user.roles.map((r) => r.code).filter(Boolean)
  }

  // 否则使用 role 字段
  if (user.role) {
    return [user.role]
  }

  return []
}

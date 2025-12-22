// 权限相关工具函数

/**
 * 检查是否有权限
 * @param userRoles 用户角色数组
 * @param requiredRoles 需要的角色数组
 * @returns 是否有权限
 */
export function hasRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * 检查是否有权限（单个角色）
 * @param userRoles 用户角色数组
 * @param requiredRole 需要的角色
 * @returns 是否有权限
 */
export function hasRoleSingle(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * 检查是否有权限码
 * @param userPermissions 用户权限码数组
 * @param requiredPermission 需要的权限码
 * @returns 是否有权限
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (!requiredPermission) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * 检查是否有任意一个权限码
 * @param userPermissions 用户权限码数组
 * @param requiredPermissions 需要的权限码数组
 * @returns 是否有权限
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

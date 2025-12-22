// 权限状态管理
import { defineStore } from "pinia";
import { ref } from "vue";
import { useUserStore } from "./user";

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  icon?: string;
  hidden?: boolean;
  keepAlive?: boolean;
}

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<any[]>([]);
  const permissions = ref<string[]>([]);
  const roles = ref<string[]>([]);

  // 设置权限
  function setPermissions(perms: string[]) {
    permissions.value = perms;
  }

  // 设置角色
  function setRoles(roleList: string[]) {
    roles.value = roleList;
  }

  // 检查是否有角色
  function hasRole(role: string): boolean {
    return roles.value.includes(role);
  }

  // 检查是否有任意一个角色
  function hasAnyRole(roleList: string[]): boolean {
    return roleList.some((role) => roles.value.includes(role));
  }

  // 检查是否有权限
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission);
  }

  // 检查是否有任意一个权限
  function hasAnyPermission(permissionList: string[]): boolean {
    return permissionList.some((permission) => permissions.value.includes(permission));
  }

  // 初始化权限（从用户信息中获取）
  function initPermissions() {
    const userStore = useUserStore();
    if (userStore.userInfo) {
      const userRoles = userStore.userInfo.roles || [];
      const userPermissions = userStore.userInfo.permissions || [];

      setRoles(userRoles);
      setPermissions(userPermissions);
    }
  }

  return {
    routes,
    permissions,
    roles,
    setPermissions,
    setRoles,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    initPermissions,
  };
});

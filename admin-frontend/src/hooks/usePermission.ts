// 权限相关的组合式函数
import { computed } from "vue";
import { usePermissionStore } from "@/stores/permission";

export function usePermission() {
  const permissionStore = usePermissionStore();

  const hasRole = (role: string) => {
    return computed(() => permissionStore.hasRole(role));
  };

  const hasAnyRole = (roles: string[]) => {
    return computed(() => permissionStore.hasAnyRole(roles));
  };

  const hasPermission = (permission: string) => {
    return computed(() => permissionStore.hasPermission(permission));
  };

  const hasAnyPermission = (permissions: string[]) => {
    return computed(() => permissionStore.hasAnyPermission(permissions));
  };

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    roles: computed(() => permissionStore.roles),
    permissions: computed(() => permissionStore.permissions),
  };
}

import { defineStore } from "pinia";
import { ref } from "vue";
import { authApi, LoginDto } from "@/api/auth";
import { ElMessage } from "element-plus";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  roles?: string[];
  permissions?: string[];
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const userInfo = ref<UserInfo | null>(localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")!) : null);

  // 登录
  async function login(loginData: LoginDto) {
    try {
      const response = await authApi.login(loginData);
      token.value = response.access_token;
      userInfo.value = response.user;

      // 保存到 localStorage
      localStorage.setItem("token", token.value);
      localStorage.setItem("userInfo", JSON.stringify(userInfo.value));

      // 初始化权限
      const { usePermissionStore } = await import("./permission");
      const permissionStore = usePermissionStore();
      permissionStore.setRoles(response.user.roles || []);
      permissionStore.setPermissions(response.user.permissions || []);

      ElMessage.success("登录成功");
      return response;
    } catch (error) {
      throw error;
    }
  }

  // 登出
  function logout() {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value;
  };

  return {
    token,
    userInfo,
    login,
    logout,
    isLoggedIn,
  };
});

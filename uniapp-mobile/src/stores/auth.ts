import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi, LoginDto } from '@/api/auth';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  // 初始化：从本地存储加载
  function init() {
    const storedToken = uni.getStorageSync('token');
    const storedUserInfo = uni.getStorageSync('userInfo');

    if (storedToken) {
      token.value = storedToken;
    }
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
    }
  }

  // 登录
  async function login(loginData: LoginDto) {
    try {
      const response = await authApi.login(loginData);
      token.value = response.access_token;
      userInfo.value = response.user;

      // 保存到本地存储
      uni.setStorageSync('token', token.value);
      uni.setStorageSync('userInfo', JSON.stringify(userInfo.value));

      return response;
    } catch (error) {
      throw error;
    }
  }

  // 微信小程序登录
  async function loginWithWechat() {
    try {
      // #ifdef MP-WEIXIN
      const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>(
        (resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject,
          });
        },
      );

      const code = loginRes.code;
      // 这里应该将 code 发送到后端，后端通过 code 换取 openid 和 session_key
      // 然后后端返回 token 和用户信息
      // 示例：const response = await api.post('/auth/wechat-login', { code });
      
      // 临时示例，实际应该调用后端接口
      uni.showToast({
        title: '微信登录功能待实现',
        icon: 'none',
      });
      // #endif

      // #ifndef MP-WEIXIN
      uni.showToast({
        title: '当前平台不支持微信登录',
        icon: 'none',
      });
      // #endif
    } catch (error) {
      throw error;
    }
  }

  // 登出
  function logout() {
    token.value = '';
    userInfo.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value;
  };

  // 初始化
  init();

  return {
    token,
    userInfo,
    login,
    loginWithWechat,
    logout,
    isLoggedIn,
  };
});

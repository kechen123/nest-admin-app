<template>
  <view class="login-container">
    <view class="login-box">
      <text class="login-title">登录</text>

      <view class="form-item">
        <input
          v-model="loginForm.username"
          class="input"
          placeholder="请输入用户名"
          type="text"
        />
      </view>

      <view class="form-item">
        <input
          v-model="loginForm.password"
          class="input"
          placeholder="请输入密码"
          type="password"
          password
        />
      </view>

      <button class="login-button" :loading="loading" @click="handleLogin">
        登录
      </button>

      <!-- 微信小程序登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <button class="wechat-login-button" @click="handleWechatLogin">
        微信登录
      </button>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

// 普通登录
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none',
    });
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
    });

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });

    // 登录成功，跳转到首页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index',
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// 微信登录
const handleWechatLogin = async () => {
  try {
    await authStore.loginWithWechat();
    // 登录成功后的处理在 store 中完成
  } catch (error: any) {
    uni.showToast({
      title: error.message || '微信登录失败',
      icon: 'none',
    });
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  display: block;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.input {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  height: 44px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  margin-top: 20px;
}

.wechat-login-button {
  width: 100%;
  height: 44px;
  background-color: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  margin-top: 15px;
}
</style>

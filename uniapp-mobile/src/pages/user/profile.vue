<template>
  <view class="profile-container">
    <view class="header">
      <text class="title">个人中心</text>
    </view>

    <view v-if="authStore.userInfo" class="user-info">
      <view class="info-item">
        <text class="label">用户名：</text>
        <text class="value">{{ authStore.userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="label">邮箱：</text>
        <text class="value">{{ authStore.userInfo.email }}</text>
      </view>
      <view class="info-item">
        <text class="label">角色：</text>
        <text class="value">{{ authStore.userInfo.role }}</text>
      </view>
    </view>

    <view v-else class="empty">
      <text>请先登录</text>
      <button class="login-button" @click="handleNavigateToLogin">去登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const handleNavigateToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  });
};

onMounted(() => {
  if (!authStore.isLoggedIn()) {
    handleNavigateToLogin();
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  text-align: center;
  padding: 20px 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.user-info {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 16px;
  color: #666;
  width: 80px;
}

.value {
  font-size: 16px;
  color: #333;
  flex: 1;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.login-button {
  margin-top: 20px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 30px;
}
</style>

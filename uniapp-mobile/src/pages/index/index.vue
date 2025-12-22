<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎使用</text>
      <text v-if="authStore.isLoggedIn()" class="username">
        {{ authStore.userInfo?.username }}
      </text>
    </view>

    <view class="content">
      <view class="card" @click="handleNavigate('/pages/user/profile')">
        <text class="card-title">个人中心</text>
        <text class="card-desc">查看个人信息</text>
      </view>

      <view v-if="!authStore.isLoggedIn()" class="card" @click="handleNavigate('/pages/login/login')">
        <text class="card-title">登录</text>
        <text class="card-desc">请先登录</text>
      </view>

      <view v-else class="card" @click="handleLogout">
        <text class="card-title">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/request';

const authStore = useAuthStore();

// 页面跳转
const handleNavigate = (url: string) => {
  uni.navigateTo({
    url,
    fail: () => {
      // 如果 navigateTo 失败，尝试使用 reLaunch（适用于某些页面）
      uni.reLaunch({ url });
    },
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({
          url: '/pages/login/login',
        });
      }
    },
  });
};

// 示例：调用 API
onMounted(async () => {
  if (authStore.isLoggedIn()) {
    try {
      // 示例 API 调用
      // const data = await api.get('/users/me');
      // console.log('用户信息:', data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  text-align: center;
  padding: 40px 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.username {
  display: block;
  margin-top: 10px;
  font-size: 16px;
  color: #666;
}

.content {
  margin-top: 40px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 14px;
  color: #999;
  display: block;
}
</style>

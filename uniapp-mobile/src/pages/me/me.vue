<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { LOGIN_PAGE } from '@/router/config'
import { useUserStore } from '@/store'
import { useCheckinStore } from '@/store/checkin'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const checkinStore = useCheckinStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)

// 统计信息
const stats = ref({ total: 0, thisMonth: 0, thisWeek: 0 })

// 加载统计数据
async function loadStatistics() {
  try {
    stats.value = await checkinStore.getStatistics()
  }
  catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 页面挂载时加载统计数据
onMounted(() => {
  loadStatistics()
})

// 微信小程序下登录
async function handleLogin() {
  // #ifdef MP-WEIXIN
  // 微信登录
  await tokenStore.wxLogin()

  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({
    url: `${LOGIN_PAGE}`,
  })
  // #endif
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空用户信息
        useTokenStore().logout()
        // 执行退出登录逻辑
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
        })
        // #ifdef MP-WEIXIN
        // 微信小程序，去首页
        // uni.reLaunch({ url: '/pages/index/index' })
        // #endif
        // #ifndef MP-WEIXIN
        // 非微信小程序，去登录页
        // uni.navigateTo({ url: LOGIN_PAGE })
        // #endif
      }
    },
  })
}

// 跳转到修改资料页面
function goToProfileEdit() {
  uni.navigateTo({
    url: '/pages/me/profile-edit',
  })
}
</script>

<template>
  <view class="profile-container">
    <!-- 未登录状态 -->
    <view v-if="!tokenStore.hasLogin" class="login-section">
      <view class="login-card">
        <view class="login-icon">
          👤
        </view>
        <text class="login-title">请先登录</text>
        <text class="login-desc">登录后可查看个人统计信息和资料</text>
        <button type="primary" class="login-btn" @click="handleLogin">
          立即登录
        </button>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="profile-section">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-avatar">
          <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" />
          <text v-else class="default-avatar">👤</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickname || '未设置昵称' }}</text>
          <text class="user-desc">记录我们的美好时光</text>
        </view>
        <view class="edit-btn" @click="goToProfileEdit">
          <text class="edit-icon">✏️</text>
          <text class="edit-text">编辑</text>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="stats-section">
        <text class="section-title">打卡统计</text>
        <view class="stats-grid">
          <view class="stats-card">
            <text class="stats-number">{{ stats.total }}</text>
            <text class="stats-label">总打卡数</text>
          </view>
          <view class="stats-card">
            <text class="stats-number">{{ stats.thisMonth }}</text>
            <text class="stats-label">本月打卡</text>
          </view>
          <view class="stats-card">
            <text class="stats-number">{{ stats.thisWeek }}</text>
            <text class="stats-label">本周打卡</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions-section">
        <view class="action-item" @click="goToProfileEdit">
          <view class="action-icon">
            👤
          </view>
          <text class="action-text">个人资料</text>
        </view>
        <view class="action-item" @click="handleLogout">
          <view class="action-icon">
            🚪
          </view>
          <text class="action-text">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  padding: 0 30rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
}

.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 80rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

  .login-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
  }

  .login-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }

  .login-desc {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 60rpx;
    line-height: 1.5;
  }

  .login-btn {
    width: 200rpx;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 32rpx;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border: none;
  }
}

.profile-section {
  padding: 30rpx 0;
}

.user-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

  .user-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    overflow: hidden;
    margin-right: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);

    image {
      width: 100%;
      height: 100%;
    }

    .default-avatar {
      font-size: 60rpx;
      color: #fff;
    }
  }

  .user-info {
    flex: 1;

    .user-name {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }

    .user-desc {
      font-size: 26rpx;
      color: #666;
    }
  }

  .edit-btn {
    padding: 16rpx 24rpx;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    cursor: pointer;

    .edit-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
    }

    .edit-text {
      font-size: 24rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

.stats-section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 24rpx;
    display: block;
  }

  .stats-grid {
    display: flex;
    gap: 20rpx;
  }

  .stats-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10rpx);
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

    .stats-number {
      font-size: 48rpx;
      font-weight: 600;
      color: #ff6b9d;
      margin-bottom: 8rpx;
    }

    .stats-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.actions-section {
  display: flex;
  gap: 20rpx;

  .action-item {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10rpx);
    border-radius: 16rpx;
    padding: 40rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }

    .action-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }

    .action-text {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
    }
  }
}
</style>

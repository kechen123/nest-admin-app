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

// 跳转到打卡记录页面
function goToCheckinRecords() {
  uni.navigateTo({
    url: '/pages/checkin/list',
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

      <!-- 操作菜单 -->
      <view class="menu-section">
        <view class="menu-item" @click="goToCheckinRecords">
          <view class="menu-icon">
            📅
          </view>
          <view class="menu-content">
            <text class="menu-title">打卡记录</text>
            <text class="menu-desc">查看历史打卡记录</text>
          </view>
          <view class="menu-arrow">
            →
          </view>
        </view>

        <view class="menu-item" @click="goToProfileEdit">
          <view class="menu-icon">
            👤
          </view>
          <view class="menu-content">
            <text class="menu-title">个人资料</text>
            <text class="menu-desc">修改个人信息</text>
          </view>
          <view class="menu-arrow">
            →
          </view>
        </view>

        <view class="menu-item logout-item" @click="handleLogout">
          <view class="menu-icon">
            🚪
          </view>
          <view class="menu-content">
            <text class="menu-title">退出登录</text>
            <text class="menu-desc">安全退出账号</text>
          </view>
          <view class="menu-arrow">
            →
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-container {
  padding: 0 30rpx;
  min-height: calc(100vh - (60rpx + env(safe-area-inset-top)));
  padding-top: calc(60rpx + env(safe-area-inset-top));
  position: relative;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 143, 171, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 179, 189, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #ff6b9d 0%, #ff8fab 50%, #ffb3bd 100%);
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 40%);
    pointer-events: none;
  }
}

.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%),
    linear-gradient(145deg, rgba(255, 107, 157, 0.05) 0%, rgba(255, 143, 171, 0.05) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  padding: 80rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow:
    0 20rpx 40rpx rgba(255, 107, 157, 0.15),
    0 8rpx 16rpx rgba(0, 0, 0, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #ff6b9d, #ff8fab, #ffb3bd);
    border-radius: 32rpx 32rpx 0 0;
  }

  .login-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
    filter: drop-shadow(0 4rpx 8rpx rgba(255, 107, 157, 0.2));
    animation: bounceIn 0.8s ease-out 0.2s both;
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .login-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 16rpx;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: slideInLeft 0.6s ease-out 0.4s both;
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20rpx);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .login-desc {
    font-size: 28rpx;
    color: #718096;
    text-align: center;
    margin-bottom: 60rpx;
    line-height: 1.6;
    max-width: 300rpx;
    animation: slideInLeft 0.6s ease-out 0.6s both;
  }

  .login-btn {
    width: 200rpx;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border: none;
    box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);
    }

    &:active::before {
      left: 100%;
    }

    animation: slideInUp 0.6s ease-out 0.8s both;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.profile-section {
  padding: 30rpx 0;
  animation: fadeInUp 0.8s ease-out;
}

.user-card {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%),
    linear-gradient(145deg, rgba(255, 107, 157, 0.03) 0%, rgba(255, 143, 171, 0.03) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 28rpx;
  padding: 48rpx 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
  box-shadow:
    0 16rpx 32rpx rgba(255, 107, 157, 0.12),
    0 4rpx 8rpx rgba(0, 0, 0, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6rpx;
    background: linear-gradient(90deg, #ff6b9d, #ff8fab, #ffb3bd, #ff6b9d);
    background-size: 200% 100%;
    animation: gradientShift 3s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow:
      0 12rpx 24rpx rgba(255, 107, 157, 0.15),
      0 2rpx 4rpx rgba(0, 0, 0, 0.08);
  }

  .user-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    overflow: hidden;
    margin-right: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    position: relative;
    box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.25);
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      top: -4rpx;
      left: -4rpx;
      right: -4rpx;
      bottom: -4rpx;
      background: linear-gradient(135deg, #ff6b9d, #ff8fab, #ffb3bd);
      border-radius: 64rpx;
      z-index: -1;
      opacity: 0.3;
    }

    image {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .default-avatar {
      font-size: 60rpx;
      color: #fff;
      filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
    }

    &:active image {
      transform: scale(1.1);
    }
  }

  .user-info {
    flex: 1;

    .user-name {
      font-size: 40rpx;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8rpx;
      display: block;
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .user-desc {
      font-size: 28rpx;
      color: #718096;
      line-height: 1.4;
      opacity: 0.8;
    }
  }

  .edit-btn {
    padding: 20rpx 28rpx;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.25);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.4s ease;
    }

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 3rpx 8rpx rgba(255, 107, 157, 0.35);
    }

    &:active::before {
      left: 100%;
    }

    .edit-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
      filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
    }

    .edit-text {
      font-size: 26rpx;
      color: #fff;
      font-weight: 600;
    }
  }
}

.stats-section {
  margin-bottom: 48rpx;

  .section-title {
    font-size: 36rpx;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 32rpx;
    display: block;
    text-align: center;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInDown 0.6s ease-out;
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stats-grid {
    display: flex;
    gap: 24rpx;
    animation: slideInUp 0.8s ease-out 0.2s both;
  }

  .stats-card {
    flex: 1;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%),
      linear-gradient(145deg, rgba(255, 107, 157, 0.02) 0%, rgba(255, 143, 171, 0.02) 100%);
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    border-radius: 24rpx;
    padding: 40rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow:
      0 12rpx 24rpx rgba(255, 107, 157, 0.1),
      0 4rpx 8rpx rgba(0, 0, 0, 0.06),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: scaleIn 0.6s ease-out both;

    &:nth-child(1) {
      animation-delay: 0.1s;
    }
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: linear-gradient(90deg, #ff6b9d, #ff8fab);
      border-radius: 0 0 4rpx 4rpx;
    }

    &:hover {
      transform: translateY(-4rpx);
      box-shadow:
        0 20rpx 40rpx rgba(255, 107, 157, 0.15),
        0 8rpx 16rpx rgba(0, 0, 0, 0.1);
    }

    .stats-number {
      font-size: 56rpx;
      font-weight: 800;
      background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 50%, #ffb3bd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12rpx;
      line-height: 1;
      text-shadow: 0 2rpx 8rpx rgba(255, 107, 157, 0.2);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2rpx;
        background: linear-gradient(90deg, #ff6b9d, #ff8fab);
        border-radius: 1rpx;
        animation: expandWidth 1s ease-out 0.5s forwards;
      }

      @keyframes expandWidth {
        from {
          width: 0;
        }
        to {
          width: 40rpx;
        }
      }
    }

    .stats-label {
      font-size: 26rpx;
      color: #718096;
      font-weight: 500;
      text-align: center;
      line-height: 1.3;
    }
  }
}

.menu-section {
  margin-top: 20rpx;
  animation: slideInUp 0.8s ease-out 0.4s both;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 32rpx 40rpx;
    margin-bottom: 16rpx;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%),
      linear-gradient(145deg, rgba(255, 107, 157, 0.02) 0%, rgba(255, 143, 171, 0.02) 100%);
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    border-radius: 20rpx;
    box-shadow:
      0 8rpx 16rpx rgba(255, 107, 157, 0.08),
      0 2rpx 4rpx rgba(0, 0, 0, 0.04),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    animation: fadeInLeft 0.6s ease-out both;

    &:nth-child(1) {
      animation-delay: 0.4s;
    }
    &:nth-child(2) {
      animation-delay: 0.5s;
    }
    &:nth-child(3) {
      animation-delay: 0.6s;
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30rpx);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 107, 157, 0.03) 0%,
        rgba(255, 143, 171, 0.03) 50%,
        rgba(255, 179, 189, 0.03) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 20rpx;
    }

    &:active {
      transform: translateX(4rpx);
      box-shadow:
        0 4rpx 8rpx rgba(255, 107, 157, 0.12),
        0 1rpx 2rpx rgba(0, 0, 0, 0.06);

      &::before {
        opacity: 1;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    .menu-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 143, 171, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    &:active .menu-icon {
      transform: scale(1.05);
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(255, 143, 171, 0.15));
    }

    .menu-content {
      flex: 1;
      position: relative;
      z-index: 1;

      .menu-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #2d3748;
        line-height: 1.2;
        margin-bottom: 4rpx;
        display: block;
        transition: color 0.3s ease;
      }

      .menu-desc {
        font-size: 26rpx;
        color: #718096;
        line-height: 1.3;
        opacity: 0.8;
        transition: color 0.3s ease;
      }
    }

    &:active .menu-content {
      .menu-title {
        color: #ff6b9d;
      }

      .menu-desc {
        color: #ff8fab;
        opacity: 1;
      }
    }

    .menu-arrow {
      font-size: 28rpx;
      color: #cbd5e0;
      margin-left: 16rpx;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    &:active .menu-arrow {
      color: #ff6b9d;
      transform: translateX(4rpx);
    }

    &.logout-item {
      .menu-icon {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
      }

      &:active .menu-icon {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15));
      }

      &:active .menu-content .menu-title {
        color: #ef4444;
      }

      &:active .menu-arrow {
        color: #ef4444;
      }
    }
  }
}
</style>

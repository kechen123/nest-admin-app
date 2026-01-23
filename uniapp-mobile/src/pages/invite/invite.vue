<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { useTokenStore } from '@/store/token'
import { acceptInvite, getInviteInfo } from '@/api/couple'

defineOptions({
  name: 'InvitePage',
})

definePage({
  style: {
    navigationBarTitleText: '邀请函',
    navigationBarBackgroundColor: '#ff6b9d',
    navigationBarTextStyle: 'white',
  },
})

// 状态管理
const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)

// 邀请码信息
const inviteCode = ref('')
const inviteInfo = ref<{
  id: number
  code: string
  inviter: {
    id: number
    nickname: string
    avatar?: string
  }
  status: string
  expireTime: string
  createdAt: string
  isExpired: boolean
  canAccept: boolean
} | null>(null)

// 页面状态
const isLoading = ref(false)
const isBinded = ref(false)
const isBinding = ref(false)

// 获取邀请码信息
const fetchInviteInfo = async (code: string) => {
  try {
    isLoading.value = true
    const result = await getInviteInfo(code)
    inviteInfo.value = result
  } catch (error: any) {
    console.error('获取邀请信息失败:', error)
    const message = error?.response?.data?.message || '获取邀请信息失败'
    uni.showToast({
      title: message,
      icon: 'none'
    })
    // 如果获取失败，跳转回首页
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

// 同意邀请
const handleAcceptInvite = async () => {
  if (isBinding.value || !inviteInfo.value) return

  try {
    isBinding.value = true

    // 调用接受邀请API
    await acceptInvite({ code: inviteInfo.value.code })

    isBinded.value = true

    // 重新获取用户信息以更新状态
    await userStore.fetchUserInfo()

    uni.showToast({
      title: '绑定成功！',
      icon: 'success'
    })

    // 延迟跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 2000)

  } catch (error: any) {
    console.error('接受邀请失败:', error)
    const message = error?.response?.data?.message || '接受邀请失败，请重试'
    uni.showToast({
      title: message,
      icon: 'none'
    })
  } finally {
    isBinding.value = false
  }
}

// 页面加载
onLoad((options: any) => {
  const { code } = options
  if (code) {
    inviteCode.value = code
    fetchInviteInfo(code)
  } else {
    uni.showToast({
      title: '邀请链接无效',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
})
</script>

<template>
  <view class="invite-container">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-section">
      <view class="loading-spinner">
        <text class="loading-icon">⏳</text>
      </view>
      <text class="loading-text">正在加载邀请信息...</text>
    </view>

    <!-- 邀请内容 -->
    <view v-else-if="!isBinded" class="invite-section">
      <!-- 邀请卡片 -->
      <view class="invite-card">
        <view class="heart-icon">
          💌
        </view>
        <text class="invite-title">来自{{ inviteInfo?.inviter.nickname }}的邀请</text>
        <text class="invite-desc">邀请你共同记录美好时光</text>

        <!-- 邀请人信息 -->
        <view class="inviter-info">
          <view class="inviter-avatar">
            <wd-img v-if="inviteInfo?.inviter.avatar" :src="inviteInfo.inviter.avatar" mode="aspectFill" />
            <text v-else class="default-avatar">👤</text>
          </view>
          <view class="inviter-details">
            <text class="inviter-name">{{ inviteInfo?.inviter.nickname }}</text>
            <text class="inviter-desc">想和你一起记录每一天</text>
          </view>
        </view>

        <!-- 同意按钮 -->
        <button class="accept-btn" :disabled="isBinding || !inviteInfo?.canAccept" :loading="isBinding"
          @click="handleAcceptInvite">
          <text v-if="!isBinding && inviteInfo?.canAccept">❤️ 同意邀请</text>
          <text v-else-if="!isBinding && inviteInfo?.isExpired">邀请码已过期</text>
          <text v-else-if="!isBinding">邀请码不可用</text>
          <text v-else>绑定中...</text>
        </button>
      </view>
    </view>

    <!-- 绑定成功 -->
    <view v-else class="success-section">
      <view class="success-card">
        <view class="success-icon">
          🎉
        </view>
        <text class="success-title">绑定成功！</text>
        <text class="success-desc">现在你们可以共同记录美好时光了</text>

        <view class="couple-info">
          <view class="partner-item">
            <view class="partner-avatar">
              <wd-img v-if="inviteInfo?.inviter.avatar" :src="inviteInfo.inviter.avatar" mode="aspectFill" />
              <text v-else class="default-avatar">👤</text>
            </view>
            <text class="partner-name">{{ inviteInfo?.inviter.nickname }}</text>
          </view>

          <view class="heart-connector">
            ❤️
          </view>

          <view class="partner-item">
            <view class="partner-avatar">
              <wd-img v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" />
              <text v-else class="default-avatar">👤</text>
            </view>
            <text class="partner-name">{{ userInfo.nickname }}</text>
          </view>
        </view>

        <text class="success-tip">正在跳转到首页...</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.invite-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 加载状态
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loading-spinner {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    animation: spin 1s linear infinite;
  }

  .loading-icon {
    font-size: 48rpx;
  }

  .loading-text {
    color: white;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

// 邀请内容
.invite-section {
  width: 100%;

  .invite-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10rpx);

    .heart-icon {
      font-size: 80rpx;
      margin-bottom: 32rpx;
      animation: heartbeat 1.5s ease-in-out infinite;
    }

    .invite-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16rpx;
      text-align: center;
    }

    .invite-desc {
      font-size: 28rpx;
      color: #718096;
      margin-bottom: 48rpx;
      text-align: center;
    }

    .inviter-info {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 143, 171, 0.1));
      border-radius: 16rpx;
      padding: 32rpx;
      margin-bottom: 48rpx;
      width: 100%;

      .inviter-avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 24rpx;
        border: 4rpx solid rgba(255, 107, 157, 0.2);

        image {
          width: 100%;
          height: 100%;
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48rpx;
          background: linear-gradient(135deg, #ff6b9d, #ff8fab);
          color: white;
        }
      }

      .inviter-details {
        flex: 1;

        .inviter-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8rpx;
          display: block;
        }

        .inviter-desc {
          font-size: 26rpx;
          color: #718096;
          opacity: 0.8;
        }
      }
    }

    .accept-btn {
      width: 100%;
      height: 88rpx;
      border-radius: 44rpx;
      background: linear-gradient(135deg, #ff6b9d, #ff8fab);
      border: none;
      color: white;
      font-size: 32rpx;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.3);

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 157, 0.4);
      }

      &:disabled {
        opacity: 0.6;
      }
    }
  }
}

// 绑定成功
.success-section {
  width: 100%;

  .success-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10rpx);

    .success-icon {
      font-size: 80rpx;
      margin-bottom: 32rpx;
      animation: bounce 1s ease-in-out infinite;
    }

    .success-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16rpx;
      text-align: center;
    }

    .success-desc {
      font-size: 28rpx;
      color: #718096;
      margin-bottom: 48rpx;
      text-align: center;
    }

    .couple-info {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 48rpx;
      width: 100%;

      .partner-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .partner-avatar {
          width: 100rpx;
          height: 100rpx;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 16rpx;
          border: 4rpx solid rgba(255, 107, 157, 0.2);

          image {
            width: 100%;
            height: 100%;
          }

          .default-avatar {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48rpx;
            background: linear-gradient(135deg, #ff6b9d, #ff8fab);
            color: white;
          }
        }

        .partner-name {
          font-size: 28rpx;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
        }
      }

      .heart-connector {
        font-size: 40rpx;
        margin: 0 24rpx;
        animation: heartbeat 1.5s ease-in-out infinite;
      }
    }

    .success-tip {
      font-size: 26rpx;
      color: #718096;
      opacity: 0.8;
      text-align: center;
    }
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes heartbeat {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10rpx);
  }

  60% {
    transform: translateY(-5rpx);
  }
}
</style>
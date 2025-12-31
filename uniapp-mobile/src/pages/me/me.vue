<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { LOGIN_PAGE } from '@/router/config'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)

// 页面显示时刷新用户信息
onShow(async () => {
  if (tokenStore.hasLogin) {
    try {
      await userStore.fetchUserInfo()
    }
    catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})

// 获取会员等级文本
function getMemberLevelText(level: number) {
  const levelMap: Record<number, string> = {
    0: '普通会员',
    1: '银卡会员',
    2: '金卡会员',
    3: '钻石会员',
  }
  return levelMap[level] || '普通会员'
}

// 获取会员等级颜色
function getMemberLevelColor(level: number) {
  const colorMap: Record<number, string> = {
    0: '#999',
    1: '#C0C0C0',
    2: '#FFD700',
    3: '#FF1493',
  }
  return colorMap[level] || '#999'
}

// 格式化余额
function formatBalance(balance: any): string {
  const num = Number(balance) || 0
  return num.toFixed(2)
}

// 格式化积分
function formatPoints(points: any): number {
  return Number(points) || 0
}

// 微信小程序下登录
async function handleLogin() {
  console.log('handleLogin')
  uni.navigateTo({
    url: `${LOGIN_PAGE}`,
  })
}

// 跳转到修改密码页面
function goToChangePassword() {
  if (!userInfo.value || !userInfo.value.id) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }
  uni.navigateTo({
    url: '/pages-fg/password/change',
  })
}

// 退出登录
async function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await tokenStore.logout()
          uni.showToast({
            title: '退出登录成功',
            icon: 'success',
          })
        }
        catch (error) {
          console.error('退出登录失败:', error)
          // 即使接口失败，也清除本地数据
          tokenStore.logout()
        }
      }
    },
  })
}
</script>

<template>
  <view class="profile-container min-h-screen bg-gray-50">
    <!-- 已登录状态 -->
    <template v-if="tokenStore.hasLogin && userInfo.id > 0">
      <!-- 用户信息卡片 -->
      <view class="user-header from-blue-500 to-blue-600 bg-gradient-to-b px-4 pb-8 pt-12">
        <view class="flex items-center gap-4">
          <!-- 头像 -->
          <view class="relative">
            <image
              :src="userInfo.avatar || '/static/images/default-avatar.png'"
              mode="aspectFill"
              class="avatar-image h-20 w-20 border-4 border-white/30 rounded-full"
            />
          </view>
          <!-- 用户信息 -->
          <view class="flex-1">
            <view class="mb-1 flex items-center gap-2">
              <text class="text-lg text-white font-bold">
                {{ userInfo.nickname || userInfo.username || '未设置昵称' }}
              </text>
            </view>
            <text v-if="userInfo.phone" class="text-sm text-white/80">
              {{ userInfo.phone }}
            </text>
            <text v-else class="text-sm text-white/80">
              未绑定手机号
            </text>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="mt-4 px-4">
        <view class="rounded-lg bg-white">
          <!-- 修改密码 -->
          <view
            class="flex items-center justify-between border-b border-gray-100 px-4 py-4 active:bg-gray-50"
            @tap="goToChangePassword"
          >
            <view class="flex items-center gap-3">
              <view class="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50">
                <wd-icon name="lock" size="20px" color="#3b82f6" />
              </view>
              <text class="text-base text-gray-800">修改密码</text>
            </view>
            <wd-icon name="arrow-right" size="18px" color="#999" />
          </view>

          <!-- 退出登录 -->
          <view class="flex items-center justify-between px-4 py-4 active:bg-gray-50" @tap="handleLogout">
            <view class="flex items-center gap-3">
              <view class="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50">
                <wd-icon name="logout" size="20px" color="#666" />
              </view>
              <text class="text-base text-gray-800">退出登录</text>
            </view>
            <wd-icon name="arrow-right" size="18px" color="#999" />
          </view>
        </view>
      </view>
    </template>

    <!-- 未登录状态 -->
    <template v-else>
      <view class="min-h-screen flex flex-col items-center justify-center px-4">
        <view class="mb-6 flex flex-col items-center">
          <view class="mb-4 h-24 w-24 flex items-center justify-center rounded-full bg-gray-200">
            <wd-icon name="user" size="48px" color="#999" />
          </view>
          <text class="mb-2 text-lg text-gray-800 font-medium">您还未登录</text>
          <text class="text-sm text-gray-500">登录后可以查看个人信息和更多功能</text>
        </view>
        <view class="max-w-xs w-full">
          <view class="w-full rounded-lg bg-blue-500 py-3 text-center text-white active:bg-blue-600" @tap="handleLogin">
            <text class="text-base font-medium">立即登录</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.profile-container {
  .user-header {
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }
  }

  .avatar-image {
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>

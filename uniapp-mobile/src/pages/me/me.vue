<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { generateInviteCode, markInviteAsShared } from '@/api/couple'
import { useUserStore } from '@/store'
import { useCheckinStore } from '@/store/checkin'
import { useTokenStore } from '@/store/token'

defineOptions({
  name: 'MePage',
})

definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#f57ba4',
    navigationBarTextStyle: 'white',
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

// 设置导航栏颜色
function setNavigationBarColor() {
  uni.setNavigationBarColor({
    frontColor: '#ffffff', // 前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
    backgroundColor: '#ff6b9d', // 背景颜色值，有效值为十六进制颜色
    animation: {
      duration: 400,
      timingFunc: 'easeIn',
    },
  })
}

// 页面挂载时加载统计数据
onMounted(() => {
  // 设置导航栏颜色
  setNavigationBarColor()

  if (tokenStore.hasLogin) {
    loadStatistics()
    console.log('onMounted>>>>>>>>>>>>>>>>')
    if (userInfo.value.userInfo?.userId === -1) {
      userStore.fetchUserInfo()
    }
  }
})

onShow(() => {
  // 每次显示页面时重新设置导航栏颜色（tabbar 页面切换时会触发）
  setNavigationBarColor()

  if (tokenStore.hasLogin) {
    console.log('onShow>>>>>>>>>>>>', userInfo.value)
  }
})

// 微信小程序下登录
async function handleLogin() {
  await tokenStore.miniappWxLogin()
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

// 生成邀请码函数（供 onShareAppMessage 调用）
async function handleGenerateInviteCode() {
  try {
    const result = await generateInviteCode()
    return result
  } catch (error) {
    console.error('生成邀请码失败:', error)
    throw error
  }
}

defineExpose({
  userInfo,
  userStore,
  generateInviteCode: handleGenerateInviteCode,
})
</script>

<script lang="ts">
export default {
  name: 'MePage',
  data() {
    return {
    }
  },
  onShareAppMessage: async (options: any) => {
    try {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const pageInstance = currentPage.$vm
      const userInfoRef = pageInstance.userInfo
      const userStore = pageInstance.userStore

      // 获取当前用户信息
      const currentUserInfo = userInfoRef?.value || userInfoRef

      // 获取当前有效邀请码
      const inviteCode = await pageInstance.generateInviteCode()
      return {
        title: `${currentUserInfo?.userInfo?.nickname || '我'}邀请你共同记录美好时光`,
        path: `pages/invite/invite?code=${inviteCode.code}`,
        imageUrl: '/static/logo.png',
        success: async (res: any) => {
          console.log('分享成功:', res)
          // 分享成功，标记邀请码为已分享
          try {
            await markInviteAsShared(inviteCode.code)
            console.log('已标记邀请码为已分享')

            // 重新获取用户信息以同步后端状态
            if (userStore) {
              try {
                await userStore.fetchUserInfo()
                console.log('已同步用户信息，邀请状态已更新为"邀请中"')
              } catch (error) {
                console.error('获取用户信息失败:', error)
                // 如果获取失败，直接更新本地状态
                if (currentUserInfo) {
                  userStore.setUserInfo({
                    ...currentUserInfo,
                    hasPendingInvite: true,
                  })
                }
              }
            }
          } catch (error) {
            console.error('标记邀请码为已分享失败:', error)
            // 即使标记失败，也尝试更新用户信息
            if (userStore) {
              try {
                await userStore.fetchUserInfo()
              } catch (fetchError) {
                console.error('获取用户信息失败:', fetchError)
              }
            }
          }
          uni.showToast({
            title: '分享成功',
            icon: 'success',
          })
        },
        fail: (err: any) => {
          console.log('分享失败:', err)
          // 分享失败，不更新状态（保持未邀请状态）
          uni.showToast({
            title: '分享失败',
            icon: 'none',
          })
        },
      }
    }
    catch (error: any) {
      console.error('获取邀请码失败:', error)
      uni.showToast({
        title: '获取邀请码失败',
        icon: 'none',
      })
      return {
        title: '邀请码获取失败',
        path: 'pages/index/index',
        imageUrl: '/static/images/login_logo.png',
      }
    }
  },
  methods: {

  },
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
      <view class="user-card" @click="goToProfileEdit">
        <!-- 已绑定用户：显示情侣头像 -->
        <view v-if="userInfo.hasPartner" class="couple-avatars">
          <view class="avatar-item">
            <view class="user-avatar">
              <image v-if="userInfo.userInfo?.avatar" :src="userInfo.userInfo?.avatar" mode="aspectFill" />
              <image v-else class="default-avatar" src="/static/images/default-avatar.png" mode="aspectFill" />
            </view>
            <text class="avatar-name">{{ userInfo.userInfo?.nickname || '未设置昵称' }}</text>
          </view>
          <view class="heart-connector">
            ❤️
          </view>
          <view class="avatar-item">
            <view class="user-avatar partner">
              <image v-if="userInfo.partnerInfo?.avatar" :src="userInfo.partnerInfo?.avatar" mode="aspectFill" />
              <image v-else class="default-avatar" src="/static/images/default-avatar.png" mode="aspectFill" />
            </view>
            <text class="avatar-name partner">{{ userInfo.partnerInfo?.nickname || '未设置昵称' }}</text>
          </view>
        </view>

        <!-- 未绑定用户：显示单个头像 -->
        <view v-else class="single-user">
          <view class="user-avatar">
            <image v-if="userInfo.userInfo?.avatar" :src="userInfo.userInfo?.avatar" mode="aspectFill" />
            <image v-else class="default-avatar" src="/static/images/default-avatar.png" mode="aspectFill" />
          </view>
          <view class="user-info">
            <text class="user-name">{{ userInfo.userInfo?.nickname || '未设置昵称' }}</text>
            <text class="user-desc">记录我们的美好时光</text>
          </view>
        </view>
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <!-- 未绑定且未邀请时显示邀请按钮 -->
          <button open-type="share" @tap.stop="" v-if="!userInfo.hasPartner && !userInfo.hasPendingInvite"
            class="invite-btn">
            <view class="invite-icon-wrap">
              <image class="invite-icon" src="/static/images/me/icon1.png" mode="aspectFit" />
            </view>
            <text class="invite-text">邀请</text>
          </button>
          <!-- 已邀请但对方未同意时显示等待状态 -->
          <view v-else-if="!userInfo.hasPartner && userInfo.hasPendingInvite" class="pending-invite">
            <text class="pending-icon">⏳</text>
            <text class="pending-text">邀请中</text>
          </view>
          <!-- 已绑定时显示编辑按钮 -->
          <view v-else class="edit-btn" @click.stop="goToProfileEdit">
            <text class="edit-icon">✏️</text>
            <text class="edit-text">编辑</text>
          </view>
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
        <view class="menu-item" @click="goToProfileEdit">
          <view class="menu-icon">
            👤
          </view>
          <view class="menu-content">
            <text class="menu-title">个人资料</text>
            <text class="menu-desc">修改个人信息</text>
          </view>
          <view class="menu-arrow">
            <wd-icon name="arrow-right" size="22px"></wd-icon>
          </view>

        </view>
        <view class="menu-item" @click="goToCheckinRecords">
          <view class="menu-icon">
            📅
          </view>
          <view class="menu-content">
            <text class="menu-title">打卡记录</text>
            <text class="menu-desc">查看历史打卡记录</text>
          </view>
          <view class="menu-arrow">
            <wd-icon name="arrow-right" size="22px"></wd-icon>
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
            <wd-icon name="arrow-right" size="22px"></wd-icon>
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

    // animation: slideInUp 0.6s ease-out 0.8s both;
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

  // 情侣头像布局
  .couple-avatars {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 32rpx;

    .avatar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        overflow: hidden;
        margin-right: 0;
        margin-bottom: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.3s ease;
        border: 4rpx solid rgba(255, 107, 157, 0.2);

        &.partner {
          border-color: rgba(255, 143, 171, 0.3);
        }

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
          opacity: 0.2;
        }

        image {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60rpx;
          background: linear-gradient(135deg, #ff6b9d, #ff8fab);
          color: white;
        }

        &:active image {
          transform: scale(1.05);
        }
      }

      .avatar-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #2d3748;
        text-align: center;
        max-width: 140rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.partner {
          color: #ff6b9d;
        }
      }
    }

    .heart-connector {
      font-size: 40rpx;
      margin: 0 24rpx;
      animation: heartbeat 2s ease-in-out infinite;
      filter: drop-shadow(0 2rpx 4rpx rgba(255, 107, 157, 0.3));
    }
  }

  // 单个用户布局
  .single-user {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 32rpx;

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      overflow: hidden;
      margin-right: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
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
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60rpx;
        background: linear-gradient(135deg, #ff6b9d, #ff8fab);
        color: white;
      }

      &:active image {
        transform: scale(1.1);
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;

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
  }

  // 操作按钮区域
  .action-buttons {
    width: 300rpx;
    display: flex;
    justify-content: center;

    button {
      margin: 0px;
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

  .invite-btn {
    padding: 8rpx 24rpx;
    background: #fff;
    border: 2rpx solid #ff8fab;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.12);
    transition: all 0.25s ease;
    position: relative;

    &:active {
      background: rgba(255, 143, 171, 0.08);
      border-color: #ff6b9d;
      transform: scale(0.98);
    }

    .invite-icon-wrap {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      animation: bounce 2s ease-in-out infinite;
    }

    .invite-icon {
      width: 26rpx;
      height: 26rpx;
    }

    .invite-text {
      font-size: 28rpx;
      background-color: transparent;
      border: none;
      padding: 0;
      margin: 0;
      color: #ff6b9d;
      font-weight: 600;
      letter-spacing: 0.5rpx;
    }
  }

  .pending-invite {
    padding: 20rpx 28rpx;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 6rpx 16rpx rgba(251, 191, 36, 0.25);
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
      box-shadow: 0 3rpx 8rpx rgba(251, 191, 36, 0.35);
    }

    &:active::before {
      left: 100%;
    }

    .pending-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
      filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
      animation: pulse 2s ease-in-out infinite;
    }

    .pending-text {
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
      background: linear-gradient(135deg,
          rgba(255, 107, 157, 0.03) 0%,
          rgba(255, 143, 171, 0.03) 50%,
          rgba(255, 179, 189, 0.03) 100%);
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

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-4rpx);
  }

  60% {
    transform: translateY(-2rpx);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }
}

@keyframes heartbeat {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  50% {
    opacity: 0.5;
  }
}
</style>

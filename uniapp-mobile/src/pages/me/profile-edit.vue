<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { updateProfile } from '@/api/login'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '编辑资料',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)

// 表单数据
const formData = reactive({
  username: userInfo.value.username || '',
  nickname: userInfo.value.nickname || '',
  avatar: userInfo.value.avatar || '',
  email: userInfo.value.email || '',
  phone: userInfo.value.phone || '',
  signature: userInfo.value.signature || '',
})

const isLoading = ref(false)

// 保存资料
async function handleSave() {
  if (isLoading.value)
    return

  try {
    isLoading.value = true

    // 调用更新用户资料接口，只传递 nickname 和 avatar
    await updateProfile({
      nickname: formData.nickname,
      avatar: formData.avatar,
    })

    // 更新store中的用户信息
    userStore.setUserInfo({
      ...userInfo.value,
      userInfo: {
        ...userInfo.value.userInfo,
        nickname: formData.nickname,
        avatar: formData.avatar,
      },
    })

    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
}

// 选择头像
async function chooseAvatar(data: any) {
  formData.avatar = data.detail.avatarUrl
}
</script>

<template>
  <view class="profile-edit-container">
    <view class="form-section">
      <!-- 头像 -->
      <view class="form-item">
        <text class="form-label">头像</text>
        <view class="avatar-section">
          <button class="avatar-preview" open-type="chooseAvatar" @chooseavatar="chooseAvatar">
            <image v-if="formData.avatar" :src="formData.avatar" mode="aspectFill" />
            <text v-else class="default-avatar">👤</text>
          </button>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input v-model="formData.nickname" class="form-input" placeholder="请输入昵称" :maxlength="20">
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button type="primary" class="save-btn" :loading="isLoading" @click="handleSave">
        保存资料
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-edit-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-top: calc(30rpx + env(safe-area-inset-top));
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .form-label {
    width: 120rpx;
    font-size: 28rpx;
    color: #333;
    flex-shrink: 0;
  }
}

.avatar-section {
  flex: 1;
  display: flex;
  align-items: center;
  cursor: pointer;

  .avatar-preview {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50rpx;
    overflow: hidden;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;

    image {
      width: 100rpx;
      height: 100rpx;
    }

    .default-avatar {
      font-size: 50rpx;
      color: #fff;
    }
  }

  .avatar-tip {
    font-size: 26rpx;
    color: #666;
  }
}

.form-input,
.form-textarea {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding: 16rpx 0;
  border: none;
  background: transparent;

  &::placeholder {
    color: #ccc;
  }
}

.form-textarea {
  min-height: 80rpx;
  line-height: 1.5;
}

.save-section {
  margin-top: 60rpx;
  padding: 0 30rpx;

  .save-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border: none;
  }
}
</style>

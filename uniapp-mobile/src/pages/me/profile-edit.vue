<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref, reactive } from 'vue'
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
const handleSave = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    // 这里应该调用更新用户信息的API
    // 暂时先模拟更新本地状态
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新store中的用户信息
    userStore.setUserInfo({
      ...userInfo.value,
      ...formData,
    })

    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// 选择头像
const chooseAvatar = async () => {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (res.tempFilePaths && res.tempFilePaths[0]) {
      formData.avatar = res.tempFilePaths[0]
      // 这里应该上传图片到服务器并获取URL
      // 暂时先直接使用临时路径
    }
  } catch (error) {
    console.error('选择头像失败:', error)
  }
}
</script>

<template>
  <view class="profile-edit-container">
    <view class="form-section">
      <!-- 头像 -->
      <view class="form-item">
        <text class="form-label">头像</text>
        <view class="avatar-section" @click="chooseAvatar">
          <view class="avatar-preview">
            <image v-if="formData.avatar" :src="formData.avatar" mode="aspectFill" />
            <text v-else class="default-avatar">👤</text>
          </view>
          <text class="avatar-tip">点击更换头像</text>
        </view>
      </view>

      <!-- 用户名 -->
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input
          v-model="formData.username"
          class="form-input"
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="formData.nickname"
          class="form-input"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <!-- 邮箱 -->
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          v-model="formData.email"
          class="form-input"
          placeholder="请输入邮箱"
          type="email"
        />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
          v-model="formData.phone"
          class="form-input"
          placeholder="请输入手机号"
          type="number"
        />
      </view>

      <!-- 个性签名 -->
      <view class="form-item">
        <text class="form-label">个性签名</text>
        <textarea
          v-model="formData.signature"
          class="form-textarea"
          placeholder="请输入个性签名"
          maxlength="100"
          :auto-height="true"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button
        type="primary"
        class="save-btn"
        :loading="isLoading"
        @click="handleSave"
      >
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
    margin-right: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    border: 2rpx solid #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    image {
      width: 100%;
      height: 100%;
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
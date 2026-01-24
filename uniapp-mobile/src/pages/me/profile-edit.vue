<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { updateProfile } from '@/api/login'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils/index'

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
const isUploadingAvatar = ref(false)

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
  const tempFilePath = data.detail.avatarUrl

  // 如果是临时路径（微信小程序返回的临时路径），需要上传到服务器
  if (tempFilePath && tempFilePath.startsWith('http://tmp/')) {
    try {
      isUploadingAvatar.value = true

      // 获取 token
      const tokenStore = useTokenStore()
      let token = (tokenStore.validToken as any).value || ''

      if (!token && tokenStore.tryGetValidToken) {
        try {
          token = await tokenStore.tryGetValidToken()
        }
        catch (error) {
          console.error('获取token失败:', error)
          uni.showToast({
            title: '获取token失败',
            icon: 'error',
          })
          return
        }
      }

      // 构建请求头
      const header: Record<string, string> = {}
      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      // 上传头像
      const baseUrl = getEnvBaseUrl()
      const uploadUrl = `${baseUrl}/upload/avatar/cos`

      await new Promise<void>((resolve, reject) => {
        uni.uploadFile({
          url: uploadUrl,
          filePath: tempFilePath,
          name: 'file',
          header,
          success: (uploadRes) => {
            try {
              let responseData = uploadRes.data
              if (typeof responseData === 'string') {
                try {
                  responseData = JSON.parse(responseData)
                }
                catch (e) {
                  console.log('Response is not JSON, using raw data:', responseData)
                }
              }

              // 后端返回格式: { code: 200, data: { url: '...', path: '...', ... }, msg: '...' }
              const result = (responseData as any)?.data || responseData
              const avatarUrl = result?.url

              if (avatarUrl && typeof avatarUrl === 'string') {
                formData.avatar = avatarUrl
                uni.showToast({
                  title: '头像上传成功',
                  icon: 'success',
                })
                resolve()
              }
              else {
                reject(new Error('上传响应中未找到头像URL'))
              }
            }
            catch (err) {
              console.error('解析上传响应失败:', err)
              reject(err)
            }
          },
          fail: (err) => {
            console.error('上传失败:', err)
            reject(err)
          },
        })
      })
    }
    catch (error: any) {
      console.error('上传头像失败:', error)
      uni.showToast({
        title: error?.message || '上传失败，请重试',
        icon: 'error',
      })
    }
    finally {
      isUploadingAvatar.value = false
    }
  }
  else {
    // 如果不是临时路径，直接使用（可能是已经上传过的URL）
    formData.avatar = tempFilePath
  }
}
</script>

<template>
  <view class="profile-edit-container">
    <view class="form-section">
      <!-- 头像 -->
      <view class="form-item">
        <text class="form-label">头像</text>
        <view class="avatar-section">
          <button
            class="avatar-preview" :disabled="isUploadingAvatar" open-type="chooseAvatar"
            @chooseavatar="chooseAvatar"
          >
            <image v-if="formData.avatar" :src="formData.avatar" mode="aspectFill" />
            <text v-else class="default-avatar">👤</text>
            <view v-if="isUploadingAvatar" class="uploading-overlay">
              <text class="uploading-text">上传中...</text>
            </view>
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
    position: relative;
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

  .uploading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50rpx;

    .uploading-text {
      color: #fff;
      font-size: 24rpx;
    }
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

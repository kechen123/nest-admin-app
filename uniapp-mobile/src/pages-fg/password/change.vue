<script lang="ts" setup>
import type { IUpdatePassword } from '@/api/types/login'
import { useToast } from 'wot-design-uni'
import { updateMiniappPassword } from '@/api/login'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '修改密码',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const toast = useToast()

// 表单引用
const formRef = ref()

// 表单数据
const passwordForm = ref<IUpdatePassword>({
  id: 0,
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单校验规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入旧密码' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能少于6位' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: (value: string) => {
        if (value !== passwordForm.value.newPassword) {
          return '两次密码输入不一致'
        }
        return true
      },
    },
  ],
}

const loading = ref(false)

// 获取用户信息
onLoad(() => {
  // 检查登录状态
  if (!tokenStore.hasLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 如果用户信息不存在，尝试获取
  if (!userStore.userInfo?.id) {
    userStore.fetchUserInfo().then(() => {
      if (userStore.userInfo?.id) {
        passwordForm.value.id = userStore.userInfo.id
      }
    }).catch((error) => {
      console.error('获取用户信息失败:', error)
      uni.showToast({
        title: '获取用户信息失败',
        icon: 'none',
      })
    })
  }
  else {
    passwordForm.value.id = userStore.userInfo.id
  }
})

// 修改密码
async function handleChangePassword() {
  // 防止重复提交
  if (loading.value) {
    return
  }

  // 检查是否已登录
  if (!tokenStore.hasLogin) {
    toast.show('请先登录')
    return
  }

  // 检查用户ID
  if (!userStore.userInfo?.id) {
    toast.show('用户信息获取失败，请重新登录')
    return
  }

  // 表单校验
  try {
    const { valid, errors } = await formRef.value?.validate()
    if (!valid) {
      // 显示第一个错误信息
      const firstError = errors?.[0]
      if (firstError?.message) {
        toast.show(firstError.message)
      }
      return
    }
  }
  catch (error) {
    console.error('表单校验失败', error)
    return
  }

  // 检查新密码不能与旧密码相同
  if (passwordForm.value.oldPassword === passwordForm.value.newPassword) {
    toast.show('新密码不能与旧密码相同')
    return
  }

  loading.value = true

  try {
    // 使用小程序修改密码接口
    await updateMiniappPassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    })

    toast.show('密码修改成功')

    // 延迟退出登录，让用户重新登录
    setTimeout(() => {
      uni.showModal({
        title: '提示',
        content: '密码已修改，请重新登录',
        showCancel: false,
        success: async () => {
          try {
            await tokenStore.logout()
            // 返回个人中心页面
            uni.navigateBack({
              fail: () => {
                // 如果返回失败，跳转到首页
                uni.reLaunch({
                  url: '/pages/index/index',
                })
              },
            })
          }
          catch (error) {
            console.error('退出登录失败:', error)
            // 即使接口失败，也清除本地数据
            tokenStore.logout()
            uni.navigateBack({
              fail: () => {
                uni.reLaunch({
                  url: '/pages/index/index',
                })
              },
            })
          }
        },
      })
    }, 1500)
  }
  catch (error: any) {
    console.error('修改密码失败:', error)
    // 处理错误信息
    let errorMessage = '修改密码失败'
    if (error?.message) {
      errorMessage = error.message
    }
    else if (error?.data?.message) {
      errorMessage = error.data.message
    }
    else if (typeof error === 'string') {
      errorMessage = error
    }
    toast.show(errorMessage)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-screen flex flex-col bg-gray-50">
    <wd-toast />
    <!-- 表单内容 -->
    <view class="flex-1 px-4 py-6">
      <view class="rounded-2xl bg-white p-6 shadow-lg">
        <wd-form ref="formRef" :model="passwordForm" :rules="rules" error-type="none">
          <!-- 旧密码 -->
          <view class="mb-6">
            <wd-input v-model="passwordForm.oldPassword" label="旧密码" prop="oldPassword" type="password"
              placeholder="请输入旧密码" required />
          </view>

          <!-- 新密码 -->
          <view class="mb-6">
            <wd-input v-model="passwordForm.newPassword" label="新密码" prop="newPassword" type="password"
              placeholder="请输入新密码（至少6位）" required />
          </view>

          <!-- 确认密码 -->
          <view class="mb-6">
            <wd-input v-model="passwordForm.confirmPassword" label="确认密码" prop="confirmPassword" type="password"
              placeholder="请再次输入新密码" required />
          </view>
        </wd-form>

        <!-- 提交按钮 -->
        <wd-button type="primary" :loading="loading" :disabled="loading" block @click="handleChangePassword">
          {{ loading ? '修改中...' : '确认修改' }}
        </wd-button>
      </view>

      <!-- 提示信息 -->
      <view class="mt-4 text-center text-sm text-gray-500">
        修改密码后需要重新登录
      </view>
    </view>
  </view>
</template>

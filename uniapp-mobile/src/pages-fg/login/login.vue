<script lang="ts" setup>
import type { ILoginForm } from '@/api/login'
import { useToast } from 'wot-design-uni'
import { useTokenStore } from '@/store/token'
import { isPageTabbar } from '@/tabbar/store'
import { currRoute, HOME_PAGE } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()
const toast = useToast()

// 表单引用
const formRef = ref()

// 表单数据
const loginForm = ref<ILoginForm>({
  username: '',
  password: '',
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度不能少于6位' },
  ],
}

const loading = ref(false)

// 获取跳转参数
const redirectUrl = ref<string>('')

onLoad(() => {
  // 获取 redirect 参数
  const route = currRoute()
  if (route.query?.redirect) {
    redirectUrl.value = route.query.redirect as string
  }
})

// 登录处理
async function doLogin() {
  // 如果已经登录，直接返回
  if (tokenStore.hasLogin) {
    handleLoginSuccess()
    return
  }

  // 防止重复提交
  if (loading.value) {
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

  loading.value = true

  try {
    // 调用登录接口
    await tokenStore.login({
      phone: loginForm.value.username.trim(),
      password: loginForm.value.password,
    })

    // 登录成功后的处理
    handleLoginSuccess()
  }
  catch (error) {
    console.error('登录失败', error)
    // tokenStore.login 内部已经处理了错误提示，这里不需要再次提示
  }
  finally {
    loading.value = false
  }
}

// 登录成功后的跳转处理
function handleLoginSuccess() {
  // 使用 setTimeout 确保页面状态已经更新
  setTimeout(() => {
    // 如果有 redirect 参数，跳转到指定页面
    if (redirectUrl.value) {
      const url = redirectUrl.value
      // 检查是否是 tabbar 页面
      if (isPageTabbar(url)) {
        uni.switchTab({ url })
      }
      else {
        uni.redirectTo({ url })
      }
    }
    else {
      // 没有 redirect 参数，返回上一页或跳转到首页
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      }
      else {
        // 尝试使用 switchTab，如果不是 tabbar 页面则使用 reLaunch
        if (isPageTabbar(HOME_PAGE)) {
          uni.switchTab({ url: HOME_PAGE })
        }
        else {
          uni.reLaunch({ url: HOME_PAGE })
        }
      }
    }
  }, 100)
}
</script>

<template>
  <view class="min-h-screen flex flex-col bg-gray-50">
    <wd-toast />
    <!-- 顶部装饰 -->
    <view class="h-48 flex items-center justify-center from-red-500 to-red-400 bg-gradient-to-b">
      <view class="text-3xl text-white font-bold">
        欢迎登录
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="flex-1 px-6 -mt-8">
      <view class="rounded-2xl bg-white p-6 shadow-lg">
        <wd-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          error-type="none"
        >
          <!-- 用户名输入框 -->
          <view class="mb-6">
            <wd-input
              v-model="loginForm.username"
              prop="username"
              placeholder="请输入用户名"
              required
            />
          </view>

          <!-- 密码输入框 -->
          <view class="mb-6">
            <wd-input
              v-model="loginForm.password"
              prop="password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </view>
        </wd-form>

        <!-- 登录按钮 -->
        <wd-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          block
          @click="doLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </wd-button>
      </view>

      <!-- 底部提示 -->
      <view class="mt-6 text-center text-sm text-gray-500">
        登录即表示同意用户协议和隐私政策
      </view>
    </view>
  </view>
</template>

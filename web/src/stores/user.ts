import { userStorage, tokenStorage } from '@/utils/storage'
import type { LoginResponse } from '@/api/auth'

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  role?: string
  nickname?: string
  avatar?: string
  [key: string]: any
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const userInfo = ref<UserInfo | null>(null)

    /**
     * 初始化用户信息（从本地存储加载）
     */
    const initUserInfo = () => {
      const storedUser = userStorage.get<UserInfo>()
      const token = tokenStorage.get()
      
      if (storedUser && token) {
        userInfo.value = storedUser
      }
    }

    /**
     * 设置用户信息
     */
    const setUserInfo = (user: UserInfo) => {
      userInfo.value = user
      userStorage.set(user)
    }

    /**
     * 更新用户信息
     */
    const updateUserInfo = (updates: Partial<UserInfo>) => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...updates }
        userStorage.set(userInfo.value)
      }
    }

    /**
     * 清除用户信息
     */
    const clearUserInfo = () => {
      userInfo.value = null
      userStorage.remove()
    }

    /**
     * 获取用户名（优先使用 nickname，否则使用 username）
     */
    const getUserName = computed(() => {
      if (!userInfo.value) return ''
      return userInfo.value.nickname || userInfo.value.username || ''
    })

    /**
     * 获取用户头像
     */
    const getUserAvatar = computed(() => {
      return userInfo.value?.avatar || ''
    })

    /**
     * 检查是否已登录
     */
    const isLoggedIn = computed(() => {
      return !!userInfo.value && !!tokenStorage.get()
    })

    // 初始化时从本地存储加载用户信息
    initUserInfo()

    return {
      userInfo,
      getUserName,
      getUserAvatar,
      isLoggedIn,
      setUserInfo,
      updateUserInfo,
      clearUserInfo,
      initUserInfo,
    }
  },
  {
    persist: false, // 不使用 pinia-plugin-persistedstate，因为我们自己管理存储
  },
)


import type {
  ILoginForm,
} from '@/api/login'
import type { IAuthLoginRes, IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue' // 修复：导入 computed
import {
  bindPhone as _bindPhone,
  login as _login,
  miniappWxLogin as _miniappWxLogin,
  refreshToken as _refreshToken,
  wxLogin as _wxLogin,
  getWxCode,
  getWxUserProfile,
} from '@/api/login'
import { isDoubleTokenRes, isSingleTokenRes } from '@/api/types/login'
import { isDoubleTokenMode } from '@/utils'
import { useUserStore } from './user'

// 初始化状态
const tokenInfoState = isDoubleTokenMode
  ? {
      accessToken: '',
      accessExpiresIn: 0,
      refreshToken: '',
      refreshExpiresIn: 0,
    }
  : {
      token: '',
      expiresIn: 0,
    }

export const useTokenStore = defineStore(
  'token',
  () => {
    // 定义用户信息
    const tokenInfo = ref<IAuthLoginRes>({ ...tokenInfoState })

    // 添加一个时间戳 ref 作为响应式依赖
    const nowTime = ref(Date.now())
    /**
     * 更新响应式数据:now
     * 确保isTokenExpired/isRefreshTokenExpired重新计算,而不是用错误过期缓存值
     * 可useTokenStore内部适时调用;也可链式调用:tokenStore.updateNowTime().hasLogin
     * @returns 最新的tokenStore实例
     */
    const updateNowTime = () => {
      nowTime.value = Date.now()
      return useTokenStore()
    }

    // 设置用户信息
    const setTokenInfo = (val: IAuthLoginRes) => {
      updateNowTime()
      tokenInfo.value = val

      // 计算并存储过期时间
      const now = Date.now()
      if (isSingleTokenRes(val)) {
        // 单token模式
        const expireTime = now + val.expiresIn * 1000
        uni.setStorageSync('accessTokenExpireTime', expireTime)
      }
      else if (isDoubleTokenRes(val)) {
        // 双token模式
        const accessExpireTime = now + val.accessExpiresIn * 1000
        const refreshExpireTime = now + val.refreshExpiresIn * 1000
        uni.setStorageSync('accessTokenExpireTime', accessExpireTime)
        uni.setStorageSync('refreshTokenExpireTime', refreshExpireTime)
      }
    }

    /**
     * 判断token是否过期
     */
    const isTokenExpired = computed(() => {
      if (!tokenInfo.value) {
        return true
      }

      const now = nowTime.value
      const expireTime = uni.getStorageSync('accessTokenExpireTime')

      if (!expireTime)
        return true
      return now >= expireTime
    })

    /**
     * 判断refreshToken是否过期
     */
    const isRefreshTokenExpired = computed(() => {
      if (!isDoubleTokenMode)
        return true

      const now = nowTime.value
      const refreshExpireTime = uni.getStorageSync('refreshTokenExpireTime')

      if (!refreshExpireTime)
        return true
      return now >= refreshExpireTime
    })

    /**
     * 登录成功后处理逻辑
     * @param tokenInfo 登录返回的token信息
     */
    async function _postLogin(tokenInfo: IAuthLoginRes) {
      setTokenInfo(tokenInfo)
      const userStore = useUserStore()
      await userStore.fetchUserInfo()
    }

    /**
     * 用户登录
     * 有的时候后端会用一个接口返回token和用户信息，有的时候会分开2个接口，一个获取token，一个获取用户信息
     * （各有利弊，看业务场景和系统复杂度），这里使用2个接口返回的来模拟
     * @param loginForm 登录参数
     * @returns 登录结果
     */
    const login = async (loginForm: ILoginForm) => {
      try {
        const res = await _login(loginForm)
        console.log('普通登录-res: ', res)
        await _postLogin(res)
        uni.showToast({
          title: '登录成功',
          icon: 'success',
        })
        return res
      }
      catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'error',
        })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 微信登录
     * 有的时候后端会用一个接口返回token和用户信息，有的时候会分开2个接口，一个获取token，一个获取用户信息
     * （各有利弊，看业务场景和系统复杂度），这里使用2个接口返回的来模拟
     * @returns 登录结果
     */
    const wxLogin = async () => {
      try {
        // 获取微信小程序登录的code
        const code = await getWxCode()
        console.log('微信登录-code: ', code)
        const res = await _wxLogin(code)
        console.log('微信登录-res: ', res)
        await _postLogin(res)
        uni.showToast({
          title: '登录成功',
          icon: 'success',
        })
        return res
      }
      catch (error) {
        console.error('微信登录失败:', error)
        uni.showToast({
          title: '微信登录失败，请重试',
          icon: 'error',
        })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 小程序登录（静默登录 + 手机号绑定）
     * @param options 登录选项，包含是否跳过授权（默认true，静默登录）
     * @returns 登录结果
     */
    const miniappWxLogin = async (options?: { skipAuth?: boolean, phone?: string }) => {
      try {
        // 默认静默登录，不需要用户授权
        const { skipAuth = true, phone } = options || {}

        // 1. 获取微信小程序登录的code（静默获取，不需要用户授权）
        const wxCodeRes = await getWxCode()
        console.log('小程序静默登录-code: ', wxCodeRes)

        let userInfo: { nickName?: string, avatarUrl?: string, gender?: number } | undefined

        // 2. 如果需要授权，则获取用户授权信息（通常不需要）
        if (!skipAuth) {
          try {
            const profileRes = await getWxUserProfile()
            console.log('小程序授权信息: ', profileRes)
            userInfo = {
              nickName: profileRes.userInfo.nickName,
              avatarUrl: profileRes.userInfo.avatarUrl,
              gender: (profileRes.userInfo as any).gender || 0,
            }
          }
          catch (authError: any) {
            console.error('获取用户授权失败:', authError)
            // 如果用户拒绝授权，抛出错误
            if (authError.message?.includes('deny') || authError.message?.includes('拒绝')) {
              throw new Error('需要授权才能登录')
            }
            throw authError
          }
        }

        // 3. 调用小程序登录接口（静默登录，不传userInfo）
        const loginData: { code: string, userInfo?: { nickName?: string, avatarUrl?: string, gender?: number }, phone?: string } = {
          code: wxCodeRes.code,
        }
        // 只有在有userInfo时才传递
        if (userInfo) {
          loginData.userInfo = userInfo
        }
        // 只有在有phone时才传递
        if (phone) {
          loginData.phone = phone
        }
        const res = await _miniappWxLogin(loginData)
        console.log('小程序静默登录-res: ', res)

        // 4. 将小程序登录返回格式转换为标准格式（单token模式）
        const standardRes: IAuthLoginRes = {
          token: res.token,
          expiresIn: 30 * 24 * 60 * 60, // 30天，单位：秒
        }

        // 5. 设置token信息
        setTokenInfo(standardRes)

        // 6. 转换并设置用户信息
        const userStore = useUserStore()
        if (res.userInfo) {
          const standardUserInfo: IUserInfoRes = {
            userInfo: {
              userId: res.userInfo.id || res.userId,
              username: res.userInfo.openid || '',
              nickname: res.userInfo.nickname || '用户' + (res.userInfo.id || res.userId), // 确保有默认值
              avatar: res.userInfo.avatar || '',
            },
            phone: res.userInfo.phone,
          }
          console.log('设置用户信息:', standardUserInfo)
          userStore.setUserInfo(standardUserInfo)
        } else {
          // 如果后端没有返回userInfo，尝试获取用户信息
          try {
            await userStore.fetchUserInfo()
          } catch (error) {
            console.error('获取用户信息失败:', error)
          }
        }

        // 7. 如果需要绑定手机号，返回特殊标识
        if (res.needBindPhone) {
          return {
            ...standardRes,
            needBindPhone: true,
          } as IAuthLoginRes & { needBindPhone: boolean }
        }

        return standardRes
      }
      catch (error) {
        console.error('小程序登录失败:', error)
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 绑定手机号
     * @param phone 手机号
     * @returns 用户信息
     */
    const bindPhone = async (phone: string) => {
      try {
        const res = await _bindPhone(phone)
        const userStore = useUserStore()
        const currentUserInfo = userStore.userInfo.value
        userStore.setUserInfo({
          ...currentUserInfo,
          phone: res.phone || phone,
        })
        return res
      }
      catch (error) {
        console.error('绑定手机号失败:', error)
        throw error
      }
    }

    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      try {
        // TODO 实现自己的退出登录逻辑
        // await _logout()
      }
      catch (error) {
        console.error('退出登录失败:', error)
      }
      finally {
        updateNowTime()

        // 无论成功失败，都需要清除本地token信息
        // 清除存储的过期时间
        uni.removeStorageSync('accessTokenExpireTime')
        uni.removeStorageSync('refreshTokenExpireTime')
        console.log('退出登录-清除用户信息')
        tokenInfo.value = { ...tokenInfoState }
        uni.removeStorageSync('token')
        const userStore = useUserStore()
        userStore.clearUserInfo()
      }
    }

    /**
     * 刷新token
     * @returns 刷新结果
     */
    const refreshToken = async () => {
      if (!isDoubleTokenMode) {
        console.error('单token模式不支持刷新token')
        throw new Error('单token模式不支持刷新token')
      }

      try {
        // 安全检查，确保refreshToken存在
        if (!isDoubleTokenRes(tokenInfo.value) || !tokenInfo.value.refreshToken) {
          throw new Error('无效的refreshToken')
        }

        const refreshToken = tokenInfo.value.refreshToken
        const res = await _refreshToken(refreshToken)
        console.log('刷新token-res: ', res)
        setTokenInfo(res)
        return res
      }
      catch (error) {
        console.error('刷新token失败:', error)
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 获取有效的token
     * 注意：在computed中不直接调用异步函数，只做状态判断
     * 实际的刷新操作应由调用方处理
     * 建议这样使用 tokenStore.updateNowTime().validToken
     */
    const getValidToken = computed(() => {
      // token已过期，返回空
      if (isTokenExpired.value) {
        return ''
      }

      if (!isDoubleTokenMode) {
        return isSingleTokenRes(tokenInfo.value) ? tokenInfo.value.token : ''
      }
      else {
        return isDoubleTokenRes(tokenInfo.value) ? tokenInfo.value.accessToken : ''
      }
    })

    /**
     * 检查是否有登录信息（不考虑token是否过期）
     */
    const hasLoginInfo = computed(() => {
      if (!tokenInfo.value) {
        return false
      }
      if (isDoubleTokenMode) {
        return isDoubleTokenRes(tokenInfo.value) && !!tokenInfo.value.accessToken
      }
      else {
        return isSingleTokenRes(tokenInfo.value) && !!tokenInfo.value.token
      }
    })

    /**
     * 检查是否已登录且token有效
     * 建议这样使用tokenStore.updateNowTime().hasLogin
     */
    const hasValidLogin = computed(() => {
      console.log('hasValidLogin', hasLoginInfo.value, !isTokenExpired.value)
      return hasLoginInfo.value && !isTokenExpired.value
    })

    /**
     * 尝试获取有效的token，如果过期且可刷新，则刷新token
     * @returns 有效的token或空字符串
     */
    const tryGetValidToken = async (): Promise<string> => {
      updateNowTime()
      if (!getValidToken.value && isDoubleTokenMode && !isRefreshTokenExpired.value) {
        try {
          await refreshToken()
          return getValidToken.value
        }
        catch (error) {
          console.error('尝试刷新token失败:', error)
          return ''
        }
      }
      return getValidToken.value
    }

    return {
      // 核心API方法
      login,
      wxLogin,
      miniappWxLogin,
      bindPhone,
      logout,

      // 认证状态判断（最常用的）
      hasLogin: hasValidLogin,
      hasLoginInfo,
      isTokenExpired,

      // 内部系统使用的方法
      refreshToken,
      tryGetValidToken,
      validToken: getValidToken,

      // 调试或特殊场景可能需要直接访问的信息
      tokenInfo,
      setTokenInfo,
      updateNowTime,
    }
  },
  {
    // 添加持久化配置，确保刷新页面后token信息不丢失
    persist: true,
  },
)

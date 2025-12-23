import axios, { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { errorCodeType } from './errorCode'
import { ElMessage, ElLoading } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/loading/style/css'
import router from '@/modules/router'
import { tokenStorage, clearAuthStorage } from '@/utils/storage'

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 扩展请求配置，添加自定义选项
declare module 'axios' {
  export interface AxiosRequestConfig {
    // 是否跳过全局错误处理（由页面自己处理错误）
    // 如果设置为 true，axios 不会显示错误提示，由页面自己处理
    skipGlobalErrorHandler?: boolean
  }
}

// 全局错误处理标记，用于跟踪未处理的错误
const unhandledErrors = new WeakMap<ApiError, boolean>()

// 扩展错误类型
export interface ApiError extends Error {
  code?: number | string
  response?: AxiosResponse<ApiResponse>
  request?: any
  config?: InternalAxiosRequestConfig
  isCancel?: boolean
  // 错误是否已经被处理过（避免重复提示）
  _handled?: boolean
  // 错误消息（用于页面显示）
  _message?: string
}

// 判断是否为登录相关接口
const isLoginRequest = (url?: string): boolean => {
  if (!url) return false
  return url.includes('/auth/login') || url.includes('/login')
}

// 判断是否需要显示错误提示
const shouldShowError = (
  config?: InternalAxiosRequestConfig,
  url?: string,
  code?: number | string,
): boolean => {
  // 如果配置了跳过全局错误处理，不显示（由页面自己处理）
  if (config?.skipGlobalErrorHandler) return false

  // 登录接口的错误由登录页面自己处理
  if (isLoginRequest(url)) return false

  // 某些错误码不需要显示提示（如取消请求）
  if (code === 'ECONNABORTED' || code === 'ERR_CANCELED') return false

  return true
}

// 创建错误对象并标记处理状态
const createApiError = (
  message: string,
  options: {
    code?: number | string
    response?: AxiosResponse<ApiResponse>
    request?: any
    config?: InternalAxiosRequestConfig
    isCancel?: boolean
  } = {},
): ApiError => {
  const error = new Error(message) as ApiError
  if (options.code !== undefined) (error as any).code = options.code
  if (options.response) (error as any).response = options.response
  if (options.request) (error as any).request = options.request
  if (options.config) (error as any).config = options.config
  if (options.isCancel !== undefined) (error as any).isCancel = options.isCancel
  ;(error as any)._message = message
  // 标记为未处理，等待页面或全局处理器处理
  unhandledErrors.set(error, true)
  return error
}

// 标记错误为已处理
const markErrorAsHandled = (error: ApiError): void => {
  unhandledErrors.delete(error)
}

// 检查错误是否已被处理
const isErrorHandled = (error: ApiError): boolean => {
  return !unhandledErrors.has(error)
}

// 创建axios实例
const service = axios.create({
  // 服务接口请求，使用相对路径走 vite 代理，避免 CORS 问题
  // 开发环境强制使用相对路径，生产环境可以通过环境变量配置
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_APP_BASE_API || '/api',
  // 超时设置
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let loading: any
//正在请求的数量
let requestCount: number = 0
//显示loading
const showLoading = () => {
  if (requestCount === 0 && !loading) {
    //加载中显示样式可以自行修改
    loading = ElLoading.service({
      text: '加载中...',
      background: 'rgba(255, 255, 255, 0.6)',
      customClass: 'custom-loading',
    })
  }
  requestCount++
}
//隐藏loading
const hideLoading = () => {
  requestCount--
  if (requestCount == 0) {
    loading.close()
  }
}

const getToken = () => {
  return tokenStorage.get()
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // showLoading()

    // 添加 token，使用 Bearer 格式适配 backend JWT 认证
    const token = getToken()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 确保开发环境使用相对路径
    if (import.meta.env.DEV && config.baseURL && config.baseURL.startsWith('http')) {
      config.baseURL = '/api'
    }

    // 处理 GET 请求的 params 参数（移除空值）
    if (config.method === 'get' && config.params) {
      const params = { ...config.params }
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key]
        }
      })
      config.params = params
    }

    return config
  },
  (error: AxiosError) => {
    // hideLoading()
    const apiError = new Error('请求配置错误') as ApiError
    ;(apiError as any).config = error.config
    return Promise.reject(apiError)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // hideLoading()

    const res = response.data

    // 检查响应数据格式
    if (!res) {
      const err = new Error('响应数据为空') as ApiError
      ;(err as any).response = response
      ;(err as any).config = response.config
      return Promise.reject(err)
    }

    // 检查响应格式是否正确
    if (typeof res !== 'object' || !('code' in res)) {
      const err = new Error('响应格式错误') as ApiError
      ;(err as any).response = response
      ;(err as any).config = response.config
      return Promise.reject(err)
    }

    const url = response.config?.url
    const isLogin = isLoginRequest(url)

    // 如果 code 不是 200，则视为错误
    if (res.code !== 200) {
      // 处理特殊错误码（登录接口不执行清除 token 和跳转逻辑）
      if (res.code === 401 && !isLogin) {
        // 401 未授权，清除认证信息并跳转到登录页（仅在非登录接口时执行）
        clearAuthStorage()
        setTimeout(() => {
          router.push('/login')
        }, 100)
      }

      // 提取错误消息（优先使用返回的 message）
      const errorMsg = res.message || errorCodeType(String(res.code)) || '请求失败'

      // 创建错误对象（默认标记为未处理，等待页面处理）
      const err = createApiError(errorMsg, {
        code: res.code,
        response,
        config: response.config,
      })

      // 如果配置了跳过全局错误处理，不显示错误提示，由页面自己处理
      // 否则，延迟显示错误提示，给页面的 catch 一个机会先执行
      if (shouldShowError(response.config, url, res.code)) {
        // 使用 setTimeout 延迟显示，确保页面的 catch 先执行
        // 延迟时间设置为 10ms，给页面的 catch 足够的时间来标记错误为已处理
        setTimeout(() => {
          // 如果错误还没有被处理（页面没有 catch 或没有调用 handleApiError），则显示错误提示
          if (!isErrorHandled(err)) {
            markErrorAsHandled(err)
            ElMessage.error(errorMsg)
          }
        }, 10)
      }

      return Promise.reject(err)
    }

    // 返回 data 字段，与 admin-frontend 保持一致
    return Promise.resolve(res.data)
  },
  (error: any) => {
    // hideLoading()

    // 处理非 AxiosError 类型的错误
    if (!(error instanceof AxiosError)) {
      const apiError = new Error(error.message || '请求失败') as ApiError
      ;(apiError as any).code = 'UNKNOWN_ERROR'
      return Promise.reject(apiError)
    }

    const url = (error as AxiosError).config?.url
    const isLogin = isLoginRequest(url)

    // 请求被取消
    if (axios.isCancel(error)) {
      const apiError = new Error('请求已取消') as ApiError
      ;(apiError as any).isCancel = true
      ;(apiError as any).code = 'ERR_CANCELED'
      ;(apiError as any).config = (error as AxiosError).config
      return Promise.reject(apiError)
    }

    const axiosError = error as AxiosError<ApiResponse>

    // 有响应但状态码不在 2xx 范围内
    if (axiosError.response) {
      const response = axiosError.response as AxiosResponse<ApiResponse>
      const responseData = (response.data || {}) as ApiResponse
      let message = '请求失败'
      let code: number | string = response.status

      // 如果后端返回了统一格式的错误响应
      if (
        responseData &&
        typeof responseData === 'object' &&
        'code' in responseData &&
        'message' in responseData
      ) {
        message = responseData.message || '请求失败'
        code = responseData.code

        // 处理特殊错误码（登录接口不执行清除 token 和跳转逻辑）
        if ((responseData.code === 401 || response.status === 401) && !isLogin) {
          // 优先使用后端返回的 message，如果没有则使用默认消息
          message = responseData.message || '未授权，请重新登录'
          clearAuthStorage()
          setTimeout(() => {
            router.push('/login')
          }, 100)
        } else if (responseData.code === 401 || response.status === 401) {
          // 登录接口的 401 错误，使用后端返回的 message
          message = responseData.message || '登录失败'
        }
      } else {
        // 处理 HTTP 状态码
        const dataMessage = (responseData as any)?.message
        switch (response.status) {
          case 400:
            message = dataMessage || '请求参数错误'
            break
          case 401:
            // 登录接口的 401 错误，使用后端返回的 message，不执行清除 token 和跳转
            if (isLogin) {
              message = dataMessage || '登录失败'
            } else {
              message = dataMessage || '未授权，请重新登录'
              clearAuthStorage()
              setTimeout(() => {
                router.push('/login')
              }, 100)
            }
            break
          case 403:
            message = '拒绝访问，权限不足'
            break
          case 404:
            message = '请求的资源不存在'
            break
          case 405:
            message = '请求方法不允许'
            break
          case 408:
            message = '请求超时'
            break
          case 409:
            message = '资源冲突'
            break
          case 422:
            message = dataMessage || '请求参数验证失败'
            break
          case 429:
            message = '请求过于频繁，请稍后再试'
            break
          case 500:
            message = '服务器内部错误'
            break
          case 502:
            message = '网关错误'
            break
          case 503:
            message = '服务不可用'
            break
          case 504:
            message = '网关超时'
            break
          default:
            message =
              dataMessage ||
              errorCodeType(String(response.status)) ||
              `请求失败 (${response.status})`
        }
      }

      // 创建错误对象（默认标记为未处理，等待页面处理）
      const apiErr = createApiError(message, {
        code,
        response,
        config: axiosError.config,
      })

      // 如果配置了跳过全局错误处理，不显示错误提示，由页面自己处理
      // 否则，延迟显示错误提示，给页面的 catch 一个机会先执行
      if (shouldShowError(axiosError.config, url, code)) {
        // 使用 setTimeout 延迟显示，确保页面的 catch 先执行
        // 延迟时间设置为 10ms，给页面的 catch 足够的时间来标记错误为已处理
        setTimeout(() => {
          // 如果错误还没有被处理（页面没有 catch 或没有调用 handleApiError），则显示错误提示
          if (!isErrorHandled(apiErr)) {
            markErrorAsHandled(apiErr)
            ElMessage.error(message)
          }
        }, 10)
      }

      return Promise.reject(apiErr)
    } else if (axiosError.request) {
      // 请求已发出但没有收到响应
      const errorCode = (axiosError as any).code || 'ERR_NETWORK'
      const errorMsg = axiosError.message || ''

      let msg = '网络连接失败，请稍后重试'
      if (errorCode === 'ECONNABORTED') {
        msg = '请求超时，请检查网络连接'
      } else if (errorCode === 'ERR_NETWORK' || errorMsg.includes('Network')) {
        msg = '网络连接失败，请检查网络设置'
      } else if (errorCode === 'ERR_INTERNET_DISCONNECTED') {
        msg = '网络已断开，请检查网络连接'
      }

      // 创建错误对象（默认标记为未处理，等待页面处理）
      const apiErr = createApiError(msg, {
        code: errorCode,
        request: axiosError.request,
        config: axiosError.config,
      })

      // 如果配置了跳过全局错误处理，不显示错误提示，由页面自己处理
      // 否则，延迟显示错误提示，给页面的 catch 一个机会先执行
      if (shouldShowError(axiosError.config, url, errorCode)) {
        // 使用 setTimeout 延迟显示，确保页面的 catch 先执行
        // 延迟时间设置为 10ms，给页面的 catch 足够的时间来标记错误为已处理
        setTimeout(() => {
          // 如果错误还没有被处理（页面没有 catch 或没有调用 handleApiError），则显示错误提示
          if (!isErrorHandled(apiErr)) {
            markErrorAsHandled(apiErr)
            ElMessage.error(msg)
          }
        }, 10)
      }

      return Promise.reject(apiErr)
    } else {
      // 在设置请求时发生错误
      const msg = axiosError.message || '请求配置错误'
      // 创建错误对象（默认标记为未处理，等待页面处理）
      const apiErr = createApiError(msg, {
        code: (axiosError as any).code || 'CONFIG_ERROR',
        config: axiosError.config,
      })

      // 如果配置了跳过全局错误处理，不显示错误提示，由页面自己处理
      // 否则，延迟显示错误提示，给页面的 catch 一个机会先执行
      if (shouldShowError(axiosError.config, url, (apiErr as any).code)) {
        // 使用 setTimeout 延迟显示，确保页面的 catch 先执行
        // 延迟时间设置为 10ms，给页面的 catch 足够的时间来标记错误为已处理
        setTimeout(() => {
          // 如果错误还没有被处理（页面没有 catch 或没有调用 handleApiError），则显示错误提示
          if (!isErrorHandled(apiErr)) {
            markErrorAsHandled(apiErr)
            ElMessage.error(msg)
          }
        }, 10)
      }

      return Promise.reject(apiErr)
    }
  },
)

// 导出辅助函数，供页面使用
// 页面在 catch 中调用此函数来标记错误已处理，避免 axios 显示重复的错误提示
// 优先级：customMessage > error._message > error.message > 默认消息
export const handleApiError = (error: any, customMessage?: string): void => {
  // 标记错误为已处理，避免 axios 拦截器重复显示
  if (error && typeof error === 'object' && '_message' in error) {
    markErrorAsHandled(error as ApiError)
  }

  // 确定要显示的错误消息
  let errorMessage: string
  if (customMessage) {
    // 优先使用自定义消息
    errorMessage = customMessage
  } else if (error?._message) {
    // 其次使用错误对象中的 _message（来自后端返回的 message）
    errorMessage = error._message
  } else if (error?.message) {
    // 再次使用 error.message
    errorMessage = error.message
  } else {
    // 最后使用默认消息
    errorMessage = '请求失败'
  }

  // 显示错误提示
  ElMessage.error(errorMessage)
}

// 监听全局未处理的 Promise 拒绝，确保错误提示只显示一次
// 注意：这个监听器主要用于兜底，正常情况下页面应该使用 handleApiError
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    // 如果是 ApiError 且未被处理，标记为已处理（避免重复提示）
    if (
      error &&
      typeof error === 'object' &&
      '_message' in error &&
      !isErrorHandled(error as ApiError)
    ) {
      markErrorAsHandled(error as ApiError)
    }
  })
}

export default service

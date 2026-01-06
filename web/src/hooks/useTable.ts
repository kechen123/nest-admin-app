import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { PaginationParams, PaginationResponse } from '@/components/Kc/types'

export interface UseTableOptions<T = any> {
  // 请求函数
  request: (params: PaginationParams & Record<string, any>) => Promise<PaginationResponse>
  // 默认分页参数
  defaultPagination?: Partial<PaginationParams>
  // 默认查询参数
  defaultParams?: Record<string, any>
  // 是否立即执行请求
  immediate?: boolean
  // 请求前的处理函数
  beforeRequest?: (
    params: PaginationParams & Record<string, any>,
  ) => PaginationParams & Record<string, any>
  // 请求后的处理函数
  afterRequest?: (response: PaginationResponse) => void
  // 请求防抖延迟时间（毫秒），默认 0 表示不防抖
  debounceTime?: number
  // 是否启用缓存，默认 false
  enableCache?: boolean
  // 缓存过期时间（毫秒），默认 5 分钟
  cacheExpireTime?: number
}

export interface UseTableReturn<T = any> {
  // 数据相关
  data: Ref<T[]>
  loading: Ref<boolean>
  total: Ref<number>

  // 分页相关
  pagination: PaginationParams
  page: ComputedRef<number>
  size: ComputedRef<number>

  // 查询参数
  searchParams: Record<string, any>

  // 方法
  fetchData: () => Promise<void>
  resetPagination: () => void
  setSearchParams: (params: Record<string, any>) => void
  resetSearchParams: () => void
  refresh: () => Promise<void>

  // 分页事件处理
  handlePaginationChange: (params: PaginationParams) => void
  handleSizeChange: (size: number) => void
  handleCurrentChange: (page: number) => void
}

export function useTable<T = any>(options: UseTableOptions<T>): UseTableReturn<T> {
  const {
    request,
    defaultPagination = {},
    defaultParams = {},
    immediate = true,
    beforeRequest,
    afterRequest,
    debounceTime = 0,
    enableCache = false,
    cacheExpireTime = 5 * 60 * 1000, // 默认5分钟
  } = options

  // 响应式数据 - 明确指定类型
  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const total = ref(0)

  // 分页参数 - 优化响应式初始化，确保有默认值
  const pagination = reactive<PaginationParams>({
    page: defaultPagination.page ?? 1,
    size: defaultPagination.size ?? 10
  })

  // 查询参数
  const searchParams = reactive<Record<string, any>>({ ...defaultParams })

  // 缓存机制
  interface CacheItem {
    data: PaginationResponse
    timestamp: number
  }
  const cache = new Map<string, CacheItem>()

  // 生成缓存键
  const getCacheKey = (params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('&')
    return sortedParams
  }

  // 获取缓存数据
  const getCache = (key: string): PaginationResponse | null => {
    if (!enableCache) return null
    const item = cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > cacheExpireTime) {
      cache.delete(key)
      return null
    }

    return item.data
  }

  // 设置缓存
  const setCache = (key: string, data: PaginationResponse) => {
    if (!enableCache) return
    cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // 清理过期缓存（简单策略：当缓存数量超过100时清理）
    if (cache.size > 100) {
      const now = Date.now()
      for (const [k, v] of cache.entries()) {
        if (now - v.timestamp > cacheExpireTime) {
          cache.delete(k)
        }
      }
    }
  }

  // 清除缓存
  const clearCache = () => {
    cache.clear()
  }

  // 计算属性
  const page = computed(() => pagination.page)
  const size = computed(() => pagination.size)

  // 获取数据的核心逻辑
  const _fetchData = async () => {
    // 合并分页参数和查询参数
    const params = {
      ...pagination,
      ...searchParams,
    }

    // 请求前处理
    const finalParams = beforeRequest ? beforeRequest(params) : params

    // 检查缓存
    const cacheKey = getCacheKey(finalParams)
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      data.value = cachedData.list as T[]
      total.value = cachedData.total
      if (cachedData.page !== undefined) pagination.page = cachedData.page
      if (cachedData.size !== undefined) pagination.size = cachedData.size
      afterRequest?.(cachedData)
      return
    }

    loading.value = true

    try {
      // 发起请求
      const response = await request(finalParams)

      // 更新数据 - 明确类型转换
      data.value = response.list as T[]
      total.value = response.total

      // 更新分页参数（如果服务端返回了分页信息）
      if (response.page !== undefined) pagination.page = response.page
      if (response.size !== undefined) pagination.size = response.size

      // 设置缓存
      setCache(cacheKey, response)

      // 请求后处理
      afterRequest?.(response)
    } catch (error) {
      console.error('获取表格数据失败:', error)
      data.value = [] as T[]
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 根据配置决定是否使用防抖
  const fetchData = debounceTime > 0
    ? useDebounceFn(_fetchData, debounceTime)
    : _fetchData

  // 重置分页到第一页
  const resetPagination = () => {
    pagination.page = 1
  }

  // 设置查询参数
  const setSearchParams = (params: Record<string, any>) => {
    // 验证不允许设置分页参数
    const paginationKeys = ['page', 'size']
    const hasPaginationParams = paginationKeys.some((key) => key in params)

    if (hasPaginationParams) {
      console.warn('setSearchParams: 不允许设置分页参数 (page, size)，这些参数将被忽略')
      // 过滤掉分页参数
      const filteredParams = { ...params }
      paginationKeys.forEach((key) => {
        delete filteredParams[key]
      })
      Object.assign(searchParams, filteredParams)
    } else {
      Object.assign(searchParams, params)
    }
  }

  // 重置查询参数
  const resetSearchParams = () => {
    Object.keys(searchParams).forEach((key) => {
      delete searchParams[key]
    })
    Object.assign(searchParams, defaultParams)
  }

  // 刷新数据（强制刷新，不使用缓存）
  const refresh = async () => {
    // 清除当前参数的缓存
    const params = {
      ...pagination,
      ...searchParams,
    }
    const finalParams = beforeRequest ? beforeRequest(params) : params
    const cacheKey = getCacheKey(finalParams)
    cache.delete(cacheKey)

    await _fetchData()
  }

  // 分页变化处理
  const handlePaginationChange = (params: PaginationParams) => {
    pagination.page = params.page
    pagination.size = params.size
    fetchData()
  }

  // 每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.page = 1 // 重置到第一页
    fetchData()
  }

  // 当前页变化
  const handleCurrentChange = (page: number) => {
    pagination.page = page
    fetchData()
  }

  // 立即执行请求
  if (immediate) {
    fetchData()
  }

  return {
    // 数据
    data,
    loading,
    total,

    // 分页
    pagination,
    page,
    size,

    // 查询参数
    searchParams,

    // 方法
    fetchData,
    resetPagination,
    setSearchParams,
    resetSearchParams,
    refresh,

    // 事件处理
    handlePaginationChange,
    handleSizeChange,
    handleCurrentChange,
  }
}

import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
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
  } = options

  // 响应式数据 - 明确指定类型
  const data = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const total = ref(0)

  // 分页参数
  const pagination = reactive<any>(
    Object.keys(defaultPagination).length > 0
      ? {
          page: defaultPagination.page,
          size: defaultPagination.size,
        }
      : {},
  )

  // 查询参数
  const searchParams = reactive<Record<string, any>>({ ...defaultParams })

  // 计算属性
  const page = computed(() => pagination.page)
  const size = computed(() => pagination.size)

  // 获取数据
  const fetchData = async () => {
    loading.value = true

    try {
      // 合并分页参数和查询参数
      const params = {
        ...pagination,
        ...searchParams,
      }

      // 请求前处理
      const finalParams = beforeRequest ? beforeRequest(params) : params

      // 发起请求
      const response = await request(finalParams)
      // 更新数据 - 明确类型转换
      data.value = response.list as T[]
      total.value = response.total

      // 更新分页参数（如果服务端返回了分页信息）
      if (response.page !== undefined) pagination.page = response.page
      if (response.size !== undefined) pagination.size = response.size

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

  // 刷新数据
  const refresh = async () => {
    await fetchData()
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

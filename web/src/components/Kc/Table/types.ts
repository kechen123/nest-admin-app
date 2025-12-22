export interface ColumnProps {
  prop?: string
  label?: string
  align?: string
  width?: string | number
  show?: boolean
  type?: 'selection' | 'index' | 'text' | 'tag' | 'switch' | 'image' | 'slot'
  options?: any
  formatter?: (row: any, column: any, cellValue: any, index: number) => any
  showOverflowTooltip?: boolean
  children?: ColumnProps[]
  [key: string]: any
}

// 分页参数接口
export interface PaginationParams {
  page: number
  size: number
}

// 分页响应接口
export interface PaginationResponse {
  list: any[]
  total: number
  page: number
  size: number
}

// 请求函数类型
export type RequestFunction = (params: PaginationParams & Record<string, any>) => Promise<any>

// 请求前处理函数类型
export type BeforeRequestHook = (
  params: PaginationParams & Record<string, any>,
) => PaginationParams & Record<string, any>

// 表格事件类型
export interface TableEvents {
  onSelectionChange?: (selection: any[], row: any) => void
  onRowClick?: (row: any, column: any, event: Event) => void
  onCellClick?: (row: any, column: any, cell: any, event: Event) => void
  onSortChange?: (column: any, prop: string, order: string) => void
  onFilterChange?: (filters: any) => void
}

// 表格配置接口
export interface TableConfig {
  // 列配置
  columns: ColumnProps[]

  // 数据源配置 - 二选一
  data?: any[] // 静态数据
  request?: RequestFunction // 请求函数
  responseAdapter?: (raw: any, params: any) => PaginationResponse

  // 默认参数（仅在使用request时有效）</any>
  defaultParams?: Record<string, any>
  // 默认分页参数（仅在使用request时有效）
  defaultPagination?: Partial<PaginationParams>
  // 请求前处理钩子（仅在使用request时有效）
  beforeRequest?: BeforeRequestHook
  // 是否立即执行请求（仅在使用request时有效）
  immediate?: boolean

  // 分页配置
  showPagination?: boolean
  pageSizes?: number[]
  showLoading?: boolean

  // 表格配置
  options?: {
    attributes?: Record<string, any>
    events?: TableEvents
  }
}

import type { Ref, ComputedRef } from 'vue'

// 按钮配置类型
export interface ButtonConfig {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: string
  onClick?: (btn: ButtonConfig) => void
  [key: string]: any
}

// 工具栏配置类型
export interface ToolbarConfig {
  leftButtons?: ButtonConfig[]
  rightButtons?: ButtonConfig[]
}

// 表单字段类型
export interface FormField {
  key: string
  label: string
  type: 'input' | 'select' | 'custom'
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
  width?: string | number // 单个字段宽度，优先级最高
  options?:
    | { label: string; value: any }[]
    | Ref<{ label: string; value: any }[]>
    | ComputedRef<{ label: string; value: any }[]>
  [key: string]: any
}

// 搜索配置类型
export interface SearchConfig {
  fields: FormField[]
  defaultCount?: number // 默认显示字段数量
  fieldWidth?: string | number // 字段宽度，默认250px
  showSearch?: boolean
  showReset?: boolean
  showExpand?: boolean
}

// 表格列配置类型
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
  // 树形主列prop名（如需自定义）
  treeNodeColumn?: boolean
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

// 表格配置类型
export interface TableConfig {
  columns: ColumnProps[] | ComputedRef<ColumnProps[]>

  // 数据源配置 - 二选一
  data?: any[]
  request?: RequestFunction
  responseAdapter?: (raw: any, params: any) => PaginationResponse

  // 请求配置
  defaultParams?: Record<string, any>
  defaultPagination?: Partial<PaginationParams>
  beforeRequest?: BeforeRequestHook
  immediate?: boolean

  // 显示配置
  showPagination?: boolean
  pageSizes?: number[]
  showLoading?: boolean

  // 表格配置
  options?: {
    attributes?: Record<string, any>
    events?: TableEvents
  }
}

// Kc容器配置类型
export interface KcConfig {
  toolbar?: ToolbarConfig
  search?: SearchConfig
  table?: TableConfig
}

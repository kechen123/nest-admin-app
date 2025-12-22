<template>
  <div class="tableContainer">
    <div class="tableContent">
      <el-table :data="tableData" v-loading="loading && showLoading" class="table" v-bind="options.attributes"
        v-on="tableEvents">
        <!-- 主列用SFC 渲染，支持树形展开 -->
        <el-table-column v-if="treeNodeColumn" :prop="treeNodeColumn.prop" :label="treeNodeColumn.label"
          :width="treeNodeColumn.width" :align="treeNodeColumn.align">
        </el-table-column>
        <!-- 其它列用RenderColumn渲染 -->
        <template v-for="col in columns" :key="col.prop || col.label">
          <RenderColumn v-if="!col.treeNodeColumn" :column="col">
            <template #[col.prop]="scope" v-if="col.type === 'slot'">
              <slot :name="col.prop" v-bind="scope" />
            </template>
          </RenderColumn>
        </template>
      </el-table>
      <!-- 分页组件 - 仅在请求模式下显示 -->
      <div class="pagination-wrapper" v-if="showPagination && isRequestMode">
        <el-pagination background v-model:current-page="pagination.page" v-model:page-size="pagination.size"
          :page-sizes="pageSizes" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type ComputedRef } from 'vue'
import type { TableConfig, PaginationResponse, ColumnProps } from '../types'
import RenderColumn from './components/Column'
import { useTable } from '@/hooks/useTable'
import { useTableEvents } from './composables/useTableEvents'

interface Props {
  config: TableConfig
}

const props = defineProps<Props>()

// 配置解构
const {
  data: staticData,
  request,
  responseAdapter,
  showPagination = true,
  pageSizes = [10, 20, 50, 100],
  showLoading = true,
  options = {},
} = props.config

// 使columns响应式，处理 computed ref 或普通数组
const columns = computed(() => {
  const cols = props.config.columns
  // 如果是 computed ref，访问 .value；否则直接使用
  return cols && typeof cols === 'object' && 'value' in cols
    ? (cols as ComputedRef<ColumnProps[]>).value
    : (cols as ColumnProps[])
})

// 表格事件
const { tableEvents } = useTableEvents(options.events)

// 模式判断
const isRequestMode = computed(() => !!request)

// 默认响应适配器
const defaultAdapter = (raw: any, params: any): PaginationResponse => ({
  list: raw.data,
  total: Number(raw.records),
  page: params.page,
  size: params.size,
})

// 请求模式
const requestTable = useTable({
  request: async (params) => {
    if (!request) return { list: [], total: 0, page: 1, size: 10 }
    const raw = await request(params)
    return (responseAdapter || defaultAdapter)(raw, params)
  },
  defaultParams: props.config.defaultParams || {},
  defaultPagination: props.config.defaultPagination || {},
  beforeRequest: props.config.beforeRequest,
  immediate: props.config.immediate !== false,
})

// 静态数据模式
const staticState = ref({
  data: [] as any[],
  loading: false,
  total: 0,
})

// 监听静态数据变化
watch(
  () => staticData,
  (newData) => {
    if (!isRequestMode.value && newData) {
      staticState.value.data = newData
      staticState.value.total = newData.length
    }
  },
  { immediate: true, deep: true },
)

// 统一状态
const tableData = computed(() => {
  console.log('tableData', isRequestMode.value ? requestTable.data.value : staticState.value.data)
  return isRequestMode.value ? requestTable.data.value : staticState.value.data
})

const loading = computed(() =>
  isRequestMode.value ? requestTable.loading.value : staticState.value.loading,
)

const total = computed(() =>
  isRequestMode.value ? requestTable.total.value : staticState.value.total,
)

const pagination = computed(() =>
  isRequestMode.value ? requestTable.pagination : { page: 1, size: 10 },
)

const treeNodeColumn = computed(() => {
  return columns.value.find(col => col.treeNodeColumn)
})

// 分页事件处理
const handleSizeChange = (size: number) => {
  if (isRequestMode.value) {
    requestTable.handleSizeChange(size)
  }
}

const handleCurrentChange = (page: number) => {
  if (isRequestMode.value) {
    requestTable.handleCurrentChange(page)
  }
}

// 暴露方法
const exposedMethods = computed(() => {
  if (isRequestMode.value) {
    return {
      fetchData: requestTable.fetchData,
      resetPagination: requestTable.resetPagination,
      setSearchParams: requestTable.setSearchParams,
      resetSearchParams: requestTable.resetSearchParams,
      refresh: requestTable.refresh,
      searchParams: requestTable.searchParams,
      pagination: requestTable.pagination,
    }
  }

  return {
    updateData: (data: any[]) => {
      staticState.value.data = data
      staticState.value.total = data.length
    },
    setLoading: (loading: boolean) => {
      staticState.value.loading = loading
    },
  }
})

defineExpose(exposedMethods.value)

// 配置校验
if (!request && !staticData) {
  console.error('KcTable: 必须提供 request 或 data 参数之一')
}
</script>

<style lang="less" scoped>
.tableContainer {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .tableContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .table {
      flex: 1;
      min-height: 0;

      :deep(.el-table) {
        height: 100%;
      }

      :deep(.el-table__inner-wrapper) {
        height: 100%;

        &::before {
          display: none;
        }

        [class*="el-table__row--level-"]:not(.el-table__row--level-0) {
          background-color: color-mix(in srgb,
              var(--el-table-tr-bg-color) 80%,
              rgba(0, 120, 255, 0.4) 20%);

          td:first-child {
            .cell {
              display: flex;
            }
          }
        }
      }

      :deep(.el-table__body-wrapper) {
        overflow-y: auto;
        overflow-x: auto;
      }
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0;
    }
  }
}
</style>

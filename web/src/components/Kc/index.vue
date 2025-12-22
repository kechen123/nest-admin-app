<template>
  <div class="kc-container">
    <!-- 搜索区域 -->
    <KcSearch v-if="props.config.search" :config="props.config.search" v-model="searchData" @search="handleSearch"
      @reset="handleReset" @change="handleSearchChange" />

    <div class="kc-tableContent">
      <!-- 工具栏 -->
      <KcToolbar v-if="props.config.toolbar" :config="props.config.toolbar" @button-click="handleToolbarClick">
        <template #left>
          <slot name="toolbar-left" />
        </template>
        <template #right>
          <slot name="toolbar-right" />
        </template>
      </KcToolbar>
      <!-- 表格区域 -->
      <KcTable v-if="props.config.table" :config="props.config.table" ref="tableRef">
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </KcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KcToolbar from './Toolbar/index.vue'
import KcSearch from './Search/index.vue'
import KcTable from './Table/index.vue'
import type { KcConfig, ButtonConfig } from './types'

interface Props {
  config: KcConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toolbarClick: [btn: ButtonConfig] // 可选事件，用于备用机制
  search: [data: Record<string, any>]
  reset: []
  searchChange: [key: string, value: any]
}>()

const tableRef = ref()
const searchData = ref<Record<string, any>>({})

// 工具栏点击事件
const handleToolbarClick = (btn: ButtonConfig) => {
  // 如果按钮配置中有onClick函数，直接执行
  if (btn.onClick && typeof btn.onClick === 'function') {
    btn.onClick(btn)
  }
  // 可选：触发外部事件用于日志记录、权限检查等
  emit('toolbarClick', btn)
}

// 搜索事件
const handleSearch = (data: Record<string, any>) => {
  // 如果有表格组件，触发表格搜索
  if (tableRef.value?.setSearchParams) {
    tableRef.value.setSearchParams(data)
    // 重置分页到第一页
    tableRef.value.resetPagination()
    tableRef.value.fetchData()
  }
  emit('search', data)
}

// 重置事件
const handleReset = () => {
  // 如果有表格组件，重置表格搜索
  if (tableRef.value?.resetSearchParams) {
    tableRef.value.resetSearchParams()
    tableRef.value.fetchData()
  }
  emit('reset')
}

// 搜索字段变化事件
const handleSearchChange = (key: string, value: any) => {
  emit('searchChange', key, value)
}

// 暴露表格方法
defineExpose({
  tableRef,
  searchData,
  // 表格相关方法
  fetchData: () => tableRef.value?.fetchData?.(),
  refresh: () => tableRef.value?.refresh?.(),
  resetPagination: () => tableRef.value?.resetPagination?.(),
  setSearchParams: (params: Record<string, any>) => tableRef.value?.setSearchParams?.(params),
  resetSearchParams: () => tableRef.value?.resetSearchParams?.(),
  // 获取全部搜索参数
  getRequestParams: () => {
    // 获取表格的分页参数和搜索参数，合并成请求参数
    const tablePagination = tableRef.value?.pagination || { page: 1, size: 10 }
    const tableSearchParams = tableRef.value?.searchParams || {}

    return {
      ...tablePagination,
      ...tableSearchParams
    }
  },
  // 清除搜索参数（保留分页参数）
  delSearchParams: (key: string) => {
    if (tableRef.value?.searchParams && key) {
      // 删除指定的搜索参数
      delete tableRef.value.searchParams[key]
    }
  },
})
</script>

<style lang="less" scoped>
.kc-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .kc-tableContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: solid 1px var(--el-border-color);
    border-radius: 4px;
    padding: 0 16px 16px;
    overflow: hidden;
  }
}
</style>

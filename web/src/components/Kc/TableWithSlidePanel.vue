<template>
  <SlideContainer ref="containerRef">
    <Kc ref="kcRef" :config="kcConfig">
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </Kc>
  </SlideContainer>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, type ComputedRef } from 'vue'
import SlideContainer from '@/modules/slide-panel/SlideContainer.vue'
import Kc from './index.vue'
import type { KcConfig, ColumnProps } from './types'

interface Props {
  config: KcConfig
  // 列显示配置
  columnDisplayConfig?: {
    // 当右侧栏目打开时隐藏的列
    hiddenWhenPanelOpen?: string[]
    // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
    alwaysShow?: string[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  columnDisplayConfig: () => ({
    hiddenWhenPanelOpen: [],
    alwaysShow: []
  })
})

// 面板状态
const panelState = ref(false)

// 缓存隐藏列和始终显示列的 Set，提升查找性能
const hiddenSet = computed(() => new Set(props.columnDisplayConfig.hiddenWhenPanelOpen || []))
const alwaysShowSet = computed(() => new Set(props.columnDisplayConfig.alwaysShow || []))

// 动态计算列配置 - 优化性能，减少不必要的重新计算和对象创建
const dynamicColumns = computed(() => {
  const rawColumns = props.config.table?.columns
  // 处理 computed ref：如果是 computed ref，需要访问 .value
  const originalColumns = (rawColumns && typeof rawColumns === 'object' && 'value' in rawColumns)
    ? (rawColumns as ComputedRef<ColumnProps[]>).value
    : (rawColumns as ColumnProps[] | undefined) || []

  // 如果面板未打开，直接返回原始列配置，避免不必要的遍历
  if (!panelState.value) {
    return originalColumns
  }

  // 面板打开时，根据配置动态调整列显示状态
  const hiddenSetValue = hiddenSet.value
  const alwaysShowSetValue = alwaysShowSet.value

  return originalColumns.map(column => {
    // 如果没有 prop，直接返回
    if (!column.prop) {
      return column
    }

    // 如果列在始终显示列表中，则显示
    if (alwaysShowSetValue.has(column.prop)) {
      return column
    }

    // 如果列在隐藏列表中，则隐藏
    if (hiddenSetValue.has(column.prop)) {
      // 只在需要修改时才创建新对象，避免不必要的对象创建
      return column.show === false ? column : { ...column, show: false }
    }

    return column
  })
})

// 动态配置
const kcConfig = computed<KcConfig>(() => ({
  ...props.config,
  table: {
    ...props.config.table,
    columns: dynamicColumns.value
  },
}))

const containerRef = ref()
const kcRef = ref()

// 打开右侧栏目
const openPanel = (options: {
  component: any
  data?: Record<string, any>
  width?: number
  title?: string
  onClose?: (val?: any) => void
}) => {
  // 设置面板状态为打开
  panelState.value = true

  containerRef.value.open({
    default: {
      component: options.component,
      data: options.data || {},
      width: options.width || 600,
      title: options.title || '详情',
      onClose: (val?: any) => {
        // 关闭时重置面板状态
        panelState.value = false
        options.onClose?.(val)
      }
    }
  })
}

// 关闭右侧栏目
const closePanel = (val?: any) => {
  panelState.value = false
  containerRef.value?.close(val)
}

// 暴露方法
const exposeObj = {
  openPanel,
  closePanel,
  panelState
}

// 合并Kc组件暴露的方法和属性
const syncKcExpose = () => {
  const kcExpose = kcRef.value
  if (kcExpose) {
    Object.assign(exposeObj, kcExpose)
  }
}

watchEffect(() => {
  if (kcRef.value) {
    syncKcExpose()
  }
})

defineExpose(exposeObj)

provide('panelState', panelState)
</script>

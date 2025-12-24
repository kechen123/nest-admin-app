<template>
  <el-button
    v-bind="buttonProps"
    :loading="isLoading"
    :disabled="disabled || isLoading"
    @click="handleClick"
  >
    <el-icon v-if="icon && !isLoading" style="margin-right: 4px;">
      <component :is="icon" />
    </el-icon>
    <slot>{{ label }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ButtonProps } from 'element-plus'
import type { Component } from 'vue'

interface Props extends Partial<ButtonProps> {
  // 防抖延迟时间（毫秒），0 表示不防抖
  debounce?: number
  // 是否防止重复点击（点击后自动禁用直到操作完成）
  preventDoubleClick?: boolean
  // 图标组件
  icon?: Component | string
  // 按钮文字
  label?: string
  // 点击事件
  onClick?: (event: MouseEvent) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  debounce: 0,
  preventDoubleClick: false,
  type: 'default',
  size: 'default'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isLoading = ref(false)
const isClicking = ref(false)

// 计算按钮属性，排除自定义属性
const buttonProps = computed(() => {
  const { debounce, preventDoubleClick, icon, label, onClick, ...rest } = props
  return rest
})

// 处理点击事件
const handleClick = async (event: MouseEvent) => {
  // 如果正在处理中，直接返回
  if (isClicking.value || isLoading.value) {
    return
  }

  // 防止重复点击（但不立即显示loading）
  if (props.preventDoubleClick) {
    isClicking.value = true
    // 不立即设置 loading，等待异步操作真正开始
  }

  try {
    // 防抖处理
    if (props.debounce > 0) {
      await new Promise(resolve => setTimeout(resolve, props.debounce))
    }

    // 执行点击回调
    if (props.onClick) {
      const result = props.onClick(event)
      // 如果是 Promise，在 Promise 真正开始执行时才显示 loading
      if (result instanceof Promise) {
        // 延迟显示 loading，给确认对话框等同步操作时间
        const loadingTimer = setTimeout(() => {
          if (props.preventDoubleClick && isClicking.value) {
            isLoading.value = true
          }
        }, 100)
        
        try {
          await result
        } finally {
          clearTimeout(loadingTimer)
        }
      }
    }

    // 触发事件
    emit('click', event)
  } catch (error) {
    console.error('Button click error:', error)
    throw error
  } finally {
    // 恢复状态
    if (props.preventDoubleClick) {
      // 延迟恢复，避免快速连续点击
      setTimeout(() => {
        isClicking.value = false
        isLoading.value = false
      }, 300)
    }
  }
}
</script>

<style scoped lang="less">
.el-button {
  font-weight: 500;
  transition: all 0.3s ease;
  
  .el-icon {
    font-size: 14px;
  }
  
  // 悬停效果增强
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  // 暗色模式下的优化
  :global(.dark) & {
    &:hover:not(:disabled) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>


import { ref, computed, nextTick, type Ref } from 'vue'
import { useDraggable, type UseDraggableOptions } from './useDraggable'

export interface UseFloatableOptions {
  /**
   * 目标元素的引用
   */
  targetRef: Ref<HTMLElement | null>
  /**
   * 拖动句柄元素的引用（通常是header）
   */
  handleRef?: Ref<HTMLElement | null>
  /**
   * 悬浮时的位置偏移（用于视觉反馈）
   */
  floatOffset?: { x: number; y: number }
  /**
   * 悬浮时的缩放效果
   */
  floatScale?: number
  /**
   * 缩放动画持续时间（毫秒）
   */
  scaleDuration?: number
  /**
   * 悬浮时的z-index
   */
  zIndex?: number
  /**
   * 拖动边界限制
   */
  dragBounds?: UseDraggableOptions['bounds']
  /**
   * 悬浮状态改变时的回调
   */
  onFloatChange?: (isFloating: boolean) => void
  /**
   * 拖动开始时的回调
   */
  onDragStart?: (event: MouseEvent) => void
  /**
   * 拖动过程中的回调
   */
  onDragMove?: (event: MouseEvent, position: { x: number; y: number }) => void
  /**
   * 拖动结束时的回调
   */
  onDragEnd?: (event: MouseEvent) => void
}

export interface UseFloatableReturn {
  /**
   * 是否处于悬浮状态
   */
  isFloating: Ref<boolean>
  /**
   * 是否正在拖动
   */
  isDragging: Ref<boolean>
  /**
   * 当前位置
   */
  position: Ref<{ x: number; y: number }>
  /**
   * 切换悬浮状态
   */
  toggleFloat: () => void
  /**
   * 设置为悬浮状态
   */
  setFloating: (floating: boolean) => void
  /**
   * 设置位置
   */
  setPosition: (x: number, y: number) => void
  /**
   * 重置位置到初始状态
   */
  resetPosition: () => void
}

/**
 * 悬浮功能的组合式函数
 * 提供元素的悬浮、拖动功能
 */
export function useFloatable(options: UseFloatableOptions): UseFloatableReturn {
  const {
    targetRef,
    handleRef,
    floatOffset = { x: 20, y: 10 },
    floatScale = 1.02,
    scaleDuration = 300,
    zIndex = 2000,
    dragBounds,
    onFloatChange,
    onDragStart,
    onDragMove,
    onDragEnd
  } = options

  const isFloating = ref(false)
  const initialRect = ref<{ width: number; height: number; left: number; top: number } | null>(null)

  // 使用拖动hook（启用GPU加速和节流优化）
  const { position, isDragging, setPosition, resetPosition: resetDragPosition } = useDraggable({
    targetRef,
    handleRef,
    enabled: computed(() => isFloating.value),
    initialPosition: { x: 0, y: 0 },
    bounds: dragBounds,
    useGPU: true, // 启用GPU加速
    throttleDelay: 16, // 16ms节流，约60fps
    onStart: (e) => {
      if (targetRef.value) {
        targetRef.value.style.transition = 'none'
      }
      onDragStart?.(e)
    },
    onMove: (e, pos) => {
      onDragMove?.(e, pos)
    },
    onEnd: (e) => {
      if (targetRef.value) {
        targetRef.value.style.transition = ''
      }
      onDragEnd?.(e)
    }
  })

  /**
   * 设置为悬浮状态
   */
  const setFloating = (floating: boolean) => {
    if (isFloating.value === floating) return

    isFloating.value = floating

    if (!targetRef.value) return

    if (floating) {
      // 保存初始位置和尺寸
      const rect = targetRef.value.getBoundingClientRect()
      initialRect.value = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      }

      // 计算悬浮位置（添加偏移）
      const newLeft = rect.left + floatOffset.x
      const newTop = rect.top + floatOffset.y

      // 设置固定定位
      targetRef.value.style.position = 'fixed'
      targetRef.value.style.zIndex = String(zIndex)
      targetRef.value.style.width = `${rect.width}px`
      targetRef.value.style.height = `${rect.height}px`

      // 使用GPU加速时，left/top设置为初始位置，transform用于偏移
      // 不使用GPU加速时，直接设置left/top
      targetRef.value.style.left = `${rect.left}px`
      targetRef.value.style.top = `${rect.top}px`

      // 添加缩放效果（如果需要）
      if (floatScale !== 1) {
        // 先设置位置（会设置translate）
        setPosition(newLeft, newTop)

        // 然后添加scale（与translate组合）
        const currentTransform = targetRef.value.style.transform || ''
        targetRef.value.style.transform = `${currentTransform} scale(${floatScale})`
        targetRef.value.style.transition = `transform ${scaleDuration}ms ease`

        // 动画结束后移除scale，保留translate
        setTimeout(() => {
          if (targetRef.value && isFloating.value) {
            targetRef.value.style.transition = ''
            // 移除scale，保留translate
            const translateMatch = currentTransform.match(/translate\([^)]+\)/)
            if (translateMatch) {
              targetRef.value.style.transform = translateMatch[0]
            }
          }
        }, scaleDuration)
      } else {
        // 没有缩放效果，直接设置位置
        setPosition(newLeft, newTop)
      }
    } else {
      // 恢复相对定位
      targetRef.value.style.position = ''
      targetRef.value.style.zIndex = ''
      targetRef.value.style.width = ''
      targetRef.value.style.height = ''
      targetRef.value.style.left = ''
      targetRef.value.style.top = ''
      targetRef.value.style.transform = ''
      targetRef.value.style.transition = ''

      initialRect.value = null
    }

    // 触发回调
    onFloatChange?.(floating)
  }

  /**
   * 切换悬浮状态
   */
  const toggleFloat = () => {
    setFloating(!isFloating.value)
  }

  /**
   * 重置位置到初始状态
   */
  const resetPosition = () => {
    if (initialRect.value && targetRef.value && isFloating.value) {
      const newLeft = initialRect.value.left + floatOffset.x
      const newTop = initialRect.value.top + floatOffset.y
      setPosition(newLeft, newTop)
      targetRef.value.style.left = `${newLeft}px`
      targetRef.value.style.top = `${newTop}px`
    } else {
      resetDragPosition()
    }
  }

  return {
    isFloating,
    isDragging,
    position,
    toggleFloat,
    setFloating,
    setPosition,
    resetPosition
  }
}


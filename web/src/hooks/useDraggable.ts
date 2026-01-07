import { ref, onMounted, onUnmounted, nextTick, computed, type Ref } from 'vue'

export interface UseDraggableOptions {
  /**
   * 拖动的目标元素引用
   */
  targetRef: Ref<HTMLElement | null>
  /**
   * 拖动的句柄元素引用（通常是header）
   */
  handleRef?: Ref<HTMLElement | null>
  /**
   * 是否启用拖动
   */
  enabled?: Ref<boolean>
  /**
   * 拖动开始时的回调
   */
  onStart?: (event: MouseEvent) => void
  /**
   * 拖动过程中的回调
   */
  onMove?: (event: MouseEvent, position: { x: number; y: number }) => void
  /**
   * 拖动结束时的回调
   */
  onEnd?: (event: MouseEvent) => void
  /**
   * 初始位置
   */
  initialPosition?: { x: number; y: number }
  /**
   * 边界限制（相对于视口）
   */
  bounds?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  /**
   * 节流延迟时间（毫秒），默认 16ms（约60fps）
   */
  throttleDelay?: number
  /**
   * 是否使用 GPU 加速（使用 transform 代替 left/top），默认 true
   */
  useGPU?: boolean
}

export interface UseDraggableReturn {
  /**
   * 当前位置
   */
  position: Ref<{ x: number; y: number }>
  /**
   * 是否正在拖动
   */
  isDragging: Ref<boolean>
  /**
   * 设置位置
   */
  setPosition: (x: number, y: number) => void
  /**
   * 重置位置
   */
  resetPosition: () => void
}

/**
 * 拖动功能的组合式函数
 */
export function useDraggable(options: UseDraggableOptions): UseDraggableReturn {
  const {
    targetRef,
    handleRef,
    enabled = ref(true),
    onStart,
    onMove,
    onEnd,
    initialPosition = { x: 0, y: 0 },
    bounds,
    throttleDelay = 16, // 默认16ms，约60fps
    useGPU = true // 默认使用GPU加速
  } = options

  const position = ref<{ x: number; y: number }>({ ...initialPosition })
  const isDragging = ref(false)
  const startPos = ref<{ x: number; y: number }>({ x: 0, y: 0 })
  const elementStartPos = ref<{ x: number; y: number }>({ x: 0, y: 0 })
  const elementBasePos = ref<{ x: number; y: number }>({ x: 0, y: 0 }) // 元素的基准位置（left/top值）

  // 用于节流和 requestAnimationFrame
  let rafId: number | null = null
  let lastUpdateTime = 0
  let pendingUpdate: { x: number; y: number } | null = null

  // 鼠标按下事件处理
  const handleMouseDown = (e: MouseEvent) => {
    if (!enabled.value || !targetRef.value) return

    // 如果指定了handleRef，只有点击handle区域才能拖动
    if (handleRef?.value) {
      // 检查点击的是否是handle区域或其子元素（排除按钮）
      const target = e.target as HTMLElement
      const isButton = target.closest('button, .el-button, .float-btn')
      if (isButton) {
        return // 点击按钮时不拖动
      }
      if (!handleRef.value.contains(target)) {
        return
      }
    }

    // 阻止默认行为和事件冒泡
    e.preventDefault()
    e.stopPropagation()

    isDragging.value = true
    startPos.value = { x: e.clientX, y: e.clientY }

    // 获取元素当前位置（实际渲染位置，包括 transform 的影响）
    const rect = targetRef.value.getBoundingClientRect()
    elementStartPos.value = { x: rect.left, y: rect.top }

    // 获取元素的基准位置（CSS left/top值，用于GPU加速时的transform计算）
    if (useGPU) {
      const computedStyle = window.getComputedStyle(targetRef.value)
      const left = parseFloat(computedStyle.left) || 0
      const top = parseFloat(computedStyle.top) || 0

      // 基准位置就是 CSS left/top 值（固定定位时的基准点）
      // transform translate 是相对于这个基准点的偏移
      // 实际位置 = left + translateX = elementBasePos.x + translateX
      elementBasePos.value = { x: left, y: top }
    } else {
      elementBasePos.value = { x: rect.left, y: rect.top }
    }

    // 重置节流相关变量
    lastUpdateTime = Date.now()
    pendingUpdate = null

    // 立即同步一次位置状态，确保 position.value 和实际位置一致
    // 这对于避免拖动开始时的位置跳动很重要
    position.value = { x: elementStartPos.value.x, y: elementStartPos.value.y }

    // 启用 GPU 优化提示
    if (useGPU && targetRef.value) {
      targetRef.value.style.willChange = 'transform'
    }

    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none' // 防止拖动时选中文本

    // 调用开始回调
    onStart?.(e)
  }

  // 实际更新DOM的函数（使用 requestAnimationFrame 优化）
  const updatePosition = () => {
    if (!targetRef.value || !pendingUpdate) return

    const { x: newX, y: newY } = pendingUpdate
    pendingUpdate = null

    // 更新位置状态
    position.value = { x: newX, y: newY }

    // 使用 GPU 加速（transform）或传统方式（left/top）
    if (useGPU) {
      // 使用 transform 触发 GPU 加速
      // transform 是相对于元素基准位置的偏移
      const offsetX = newX - elementBasePos.value.x
      const offsetY = newY - elementBasePos.value.y
      targetRef.value.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    } else {
      targetRef.value.style.left = `${newX}px`
      targetRef.value.style.top = `${newY}px`
    }

    rafId = null
  }

  // 鼠标移动事件处理（节流优化）
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !targetRef.value) return

    const now = Date.now()

    // 计算移动距离
    const deltaX = e.clientX - startPos.value.x
    const deltaY = e.clientY - startPos.value.y

    // 计算新位置
    let newX = elementStartPos.value.x + deltaX
    let newY = elementStartPos.value.y + deltaY

    // 应用边界限制
    if (bounds) {
      const rect = targetRef.value.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      if (bounds.left !== undefined) {
        newX = Math.max(newX, bounds.left)
      }
      if (bounds.right !== undefined) {
        newX = Math.min(newX, bounds.right - width)
      }
      if (bounds.top !== undefined) {
        newY = Math.max(newY, bounds.top)
      }
      if (bounds.bottom !== undefined) {
        newY = Math.min(newY, bounds.bottom - height)
      }
    }

    // 保存待更新的位置
    pendingUpdate = { x: newX, y: newY }

    // 节流：限制更新频率
    if (now - lastUpdateTime >= throttleDelay) {
      lastUpdateTime = now

      // 使用 requestAnimationFrame 优化渲染
      if (rafId === null) {
        rafId = requestAnimationFrame(updatePosition)
      }

      // 调用移动回调（使用最新的位置）
      onMove?.(e, { x: newX, y: newY })
    } else {
      // 如果还在节流期内，使用 requestAnimationFrame 延迟更新
      if (rafId === null) {
        rafId = requestAnimationFrame(updatePosition)
      }
    }
  }

  // 鼠标释放事件处理
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging.value) return

    isDragging.value = false

    // 取消待处理的动画帧
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    // 确保最后一次更新被应用
    if (pendingUpdate && targetRef.value) {
      updatePosition()
    }

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = '' // 恢复文本选择

    // 移除 GPU 优化提示（如果使用）
    if (useGPU && targetRef.value) {
      targetRef.value.style.willChange = ''
    }

    // 调用结束回调
    onEnd?.(e)
  }

  // 设置位置
  const setPosition = (x: number, y: number) => {
    position.value = { x, y }
    if (targetRef.value) {
      if (useGPU) {
        // 获取基准位置
        const computedStyle = window.getComputedStyle(targetRef.value)
        const left = parseFloat(computedStyle.left) || 0
        const top = parseFloat(computedStyle.top) || 0

        // 如果基准位置未设置，使用当前位置作为基准
        if (elementBasePos.value.x === 0 && elementBasePos.value.y === 0) {
          elementBasePos.value = { x: left, y: top }
        }

        // 使用 transform 触发 GPU 加速（相对于基准位置的偏移）
        const offsetX = x - elementBasePos.value.x
        const offsetY = y - elementBasePos.value.y
        targetRef.value.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      } else {
        targetRef.value.style.left = `${x}px`
        targetRef.value.style.top = `${y}px`
      }
    }
  }

  // 重置位置
  const resetPosition = () => {
    setPosition(initialPosition.x, initialPosition.y)
  }

  // 绑定拖动事件
  onMounted(() => {
    // 使用 nextTick 确保元素已渲染
    nextTick(() => {
      const handleElement = handleRef?.value || targetRef.value
      if (handleElement) {
        handleElement.addEventListener('mousedown', handleMouseDown)
        // 设置可拖动样式
        if (handleRef?.value) {
          handleRef.value.style.cursor = 'move'
        }
      }
    })
  })

  // 清理事件监听
  onUnmounted(() => {
    // 取消待处理的动画帧
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    const handleElement = handleRef?.value || targetRef.value
    if (handleElement) {
      handleElement.removeEventListener('mousedown', handleMouseDown)
      if (handleRef?.value) {
        handleRef.value.style.cursor = ''
      }
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = ''

    // 清理 GPU 优化提示
    if (useGPU && targetRef.value) {
      targetRef.value.style.willChange = ''
    }
  })

  return {
    position,
    isDragging,
    setPosition,
    resetPosition
  }
}



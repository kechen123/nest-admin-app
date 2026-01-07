/**
 * 面板拖拽功能组合式函数
 */
import { ref } from 'vue'
import useMouse from '@/modules/slide-panel/hooks/useMouseDrop'

export interface UsePanelDragOptions {
  onDown?: () => void
  onUp?: () => void
  onMove?: (e: MouseEvent, mouse: any) => void
}

export function usePanelDrag(options: UsePanelDragOptions = {}) {
  const { onDown, onUp, onMove } = options

  const isDragging = ref(false)

  const downHandler = () => {
    isDragging.value = true
    onDown?.()
  }

  const upHandler = () => {
    isDragging.value = false
    onUp?.()
  }

  const moveHandler = (e: MouseEvent, mouse: any) => {
    if (mouse.state === 'down') {
      onMove?.(e, mouse)
    }
  }

  const [resizerRef, addListener] = useMouse({
    down: downHandler,
    move: moveHandler,
    up: upHandler
  })

  return {
    isDragging,
    resizerRef,
    addListener
  }
}

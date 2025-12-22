// composables/useResizablePanel.ts
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

export function useResizablePanel(options: {
  storageKey?: string
  min?: number
  maxPercent?: number
  onResizeEnd?: (width: number) => void
}) {
  const { storageKey = 'side-panel-width', min = 300, maxPercent = 0.7, onResizeEnd } = options
  const width = ref(Number(localStorage.getItem(storageKey)) || 400)
  const isResizing = ref(false)

  let startX = 0
  let startWidth = 0

  const startResize = (e: MouseEvent) => {
    isResizing.value = true
    startX = e.clientX
    startWidth = width.value
    document.addEventListener('mousemove', onResizing)
    document.addEventListener('mouseup', stopResize)
  }

  const onResizing = (e: MouseEvent) => {
    const delta = startX - e.clientX
    const max = window.innerWidth * maxPercent
    width.value = Math.min(Math.max(startWidth + delta, min), max)
  }

  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onResizing)
    document.removeEventListener('mouseup', stopResize)
    localStorage.setItem(storageKey, width.value.toString())
    onResizeEnd?.(width.value)
  }

  return {
    width,
    isResizing,
    startResize,
  }
}

import type { Ref } from 'vue'

export function useResizablePanel(options: {
  storageKey?: string
  min?: number
  maxPercent?: number
  onResizeEnd?: (width: number) => void
}) {
  const { storageKey = 'side-panel-width', min = 300, maxPercent = 0.7, onResizeEnd } = options
  const width = ref(Number(localStorage.getItem(storageKey)) || 400)
  let startX = 0
  let startWidth = 0
  const rafId = 0
  let lastCall = 0
  const startResize = (e: MouseEvent) => {
    startX = e.clientX
    startWidth = width.value
    document.addEventListener('mousemove', onResizing)
    document.addEventListener('mouseup', stopResize)
  }

  const onResizing = (e: MouseEvent) => {
    const now = Date.now()
    if (now - lastCall < 50) return
    lastCall = now

    // cancelAnimationFrame(rafId)
    // rafId = requestAnimationFrame(() => {
    const delta = startX - e.clientX
    console.log(delta)
    const max = window.innerWidth * maxPercent
    const newWidth = Math.min(Math.max(startWidth + delta, min), max)
    // widthRef.value = newWidth
    document.querySelector('#right').style.width = `${newWidth}px`
    document.querySelector('#main').style.width = `width: calc(100% - ${newWidth}px);`
    // onResizeEnd?.(newWidth)
    // })
  }

  const stopResize = () => {
    document.removeEventListener('mousemove', onResizing)
    document.removeEventListener('mouseup', stopResize)
    cancelAnimationFrame(rafId)
    localStorage.setItem('side-panel-width', width.value.toString())
  }

  return {
    width,
    startResize,
  }
}

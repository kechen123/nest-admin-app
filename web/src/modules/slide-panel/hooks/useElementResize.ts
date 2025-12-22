import type { Ref } from 'vue'

interface Props {
  resize?: (event: Element, width: number, height: number) => void
  className: string
}

export default function ({ resize, className }: Props) {
  const target: Ref<HTMLElement | null> = ref(null)
  onMounted(() => {
    const el = target.value
    if (el) {
      const obverse = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.classList.contains(className)) {
            const domRect = el.getBoundingClientRect()
            const width = domRect.width
            const height = domRect.height
            if (resize) {
              resize(entry.target, width, height)
            }
          }
        }
      })
      obverse.observe(el)
    }
  })
  return [target]
}

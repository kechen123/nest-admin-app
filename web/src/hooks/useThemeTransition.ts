import { useDark, useToggle } from '@vueuse/core'

export function useThemeTransition() {
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
  })

  const toggleDark = useToggle(isDark)
  const pointerPos = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  const onPointerDown = (e: PointerEvent | MouseEvent) => {
    pointerPos.value = {
      x: e.clientX,
      y: e.clientY,
    }
  }

  const triggerTransition = (e?: PointerEvent | MouseEvent) => {
    if (e) {
      pointerPos.value = {
        x: e.clientX,
        y: e.clientY,
      }
    }
    const { x, y } = pointerPos.value
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    if (!document.startViewTransition) {
      toggleDark()
      return
    }

    const transition = document.startViewTransition(async () => {
      toggleDark()
    })

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]

      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-in',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  return {
    isDark,
    onPointerDown,
    triggerTransition,
  }
}

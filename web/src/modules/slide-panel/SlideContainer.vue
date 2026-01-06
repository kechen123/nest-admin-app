<template>
  <div class="slide-container" ref="containerRef">
    <div class="main" :style="{
      width: layout.contentLayout.realTimeWidth + 'px',
      transition: isDragging ? 'none' : 'width 0.3s ease',
      userSelect: isDragging ? 'none' : 'auto'
    }">
      <slot />
    </div>

    <transition name="slide" @after-enter="onSlideInComplete" @after-leave="onSlideOutComplete">
      <div v-if="sidePanelState.show" id="right" class="side-panel" :style="{
        'flex-basis': layout.rightLayout.realTimeWidth + 'px',
        userSelect: isDragging ? 'none' : 'auto'
      }">
        <div ref="rightLineRef" class="resizer" />
        <SidePanelWrapper :title="sidePanelState.title" v-loading="sidePanelState.isLoading">
          <component :is="sidePanelState.sideComponent" v-bind="sidePanelState.sideProps"
            :ref="(el: any) => (sidePanelState.sideRef = el)" />
        </SidePanelWrapper>
      </div>
    </transition>
  </div>
</template>


<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import useMouse from './hooks/useMouseDrop'
// import useElementResize from './hooks/useElementResize'
import SidePanelWrapper from './components/SidePanelWrapper.vue'


const layoutStore = useLayoutStore()
const layout = layoutStore.mainLayout

const isDragging = ref(false)

const mainRect = reactive({
  width: 0,
  height: 0
})

const sidePanelState = reactive({
  show: false,
  title: '详情',
  sideComponent: shallowRef(),
  sideProps: {},
  sideRef: null as any,
  isLoading: false,
  pendingComponent: null as any,
  pendingProps: {},
  pendingMethod: '',
  pendingData: {} as Record<string, any>,
})


const containerRef = ref()
const onCloseCallback = ref<(() => void) | null>(null)
const isUpdatingLayout = ref(false)

const downRight = () => {
  isDragging.value = true
  layout.rightLayout.downWidth = layout.rightLayout.realTimeWidth
}

const upRight = () => {
  isDragging.value = false
  layout.rightLayout.downWidth = layout.rightLayout.realTimeWidth
}

const moveRight = (e: MouseEvent, mouse: any) => {
  if (mouse.state === 'down') {
    let w = layout.rightLayout.downWidth - mouse.x
    const rightMinWidth = layout.rightLayout.minWidth
    const contentMinWidth = layout.contentLayout.minWidth
    if (w < rightMinWidth) w = rightMinWidth
    if (mainRect.width - w < contentMinWidth) w = mainRect.width - contentMinWidth

    layout.rightLayout.realTimeWidth = w
    layout.contentLayout.realTimeWidth = mainRect.width - w
  }
}

const [rightLineRef, addListener] = useMouse({ down: downRight, move: moveRight, up: upRight })
// const [containerRef] = useElementResize({ resize: bodyReSize, className: 'slide-container' })

// 存储 watch 停止函数，用于清理
let stopWatchRef: (() => void) | null = null

interface SideOpenOptions {
  default: {
    component: any
    props?: Record<string, any>
    method?: string
    width?: number
    title?: string
    onClose?: (val: any) => void
    onOpen?: () => void
    data?: Record<string, any>
  }
}

const open = async (params: SideOpenOptions) => {
  const {
    default: {
      component,
      props = {},
      method = 'init',
      width = 400,
      title = '详情',
      onClose,
      onOpen,
      data = {}
    }
  } = params

  // 设置 loading 状态
  sidePanelState.isLoading = true

  // 保存待渲染的组件信息
  sidePanelState.pendingComponent = component
  sidePanelState.pendingProps = props
  sidePanelState.pendingMethod = method
  sidePanelState.pendingData = data

  // 先设置基本状态，但不渲染组件
  sidePanelState.title = title
  sidePanelState.show = true
  onCloseCallback.value = onClose ?? null

  layout.contentLayout.realTimeWidth = mainRect.width - width
  layout.rightLayout.realTimeWidth = width

  await nextTick()
  addListener()

  // 延迟调用 onOpen 和布局更新
  nextTick(() => {
    onOpen?.()
    updateContentLayout()
  })
}

const close = async (val: any) => {
  // 清理组件引用和相关状态
  if (sidePanelState.sideRef) {
    // 如果组件有清理方法，调用它
    if (typeof sidePanelState.sideRef.destroy === 'function') {
      sidePanelState.sideRef.destroy()
    } else if (typeof sidePanelState.sideRef.unmount === 'function') {
      sidePanelState.sideRef.unmount()
    }
  }
  
  sidePanelState.show = false
  onCloseCallback.value?.(val)
  
  // 清理待处理的组件数据
  sidePanelState.pendingComponent = null
  sidePanelState.pendingProps = {}
  sidePanelState.pendingMethod = ''
  sidePanelState.pendingData = {}
  sidePanelState.sideRef = null
  onCloseCallback.value = null
}

const onSlideInComplete = () => {
  nextTick(() => {
    // 动画完成后，设置组件和属性
    sidePanelState.sideComponent = sidePanelState.pendingComponent
    sidePanelState.sideProps = sidePanelState.pendingProps



    updateContentLayout()
  })
}

const onSlideOutComplete = () => {
  nextTick(() => {
    updateContentLayout()
  })
}

const updateContentLayout = () => {
  if (isUpdatingLayout.value || !containerRef.value) return

  isUpdatingLayout.value = true

  try {
    const rect = containerRef.value.getBoundingClientRect()
    // console.log('updateContentLayout>>.', rect)
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight
    const width = innerWidth - rect.x - 20 - 2
    const height = innerHeight - rect.y - 20 - 2
    mainRect.width = width
    mainRect.height = height

    // 使用 nextTick 来避免递归更新
    nextTick(() => {
      layout.contentLayout.downWidth = width - (sidePanelState.show ? layout.rightLayout.realTimeWidth : 0)
      layout.contentLayout.realTimeWidth = width - (sidePanelState.show ? layout.rightLayout.realTimeWidth : 0)
      isUpdatingLayout.value = false
    })
  } catch (error) {
    isUpdatingLayout.value = false
    console.error('updateContentLayout error:', error)
  }
}

onMounted(() => {
  updateContentLayout()
})

// 监听组件引用设置，确保 init 方法被调用
stopWatchRef = watch(() => sidePanelState.sideRef, async (newRef) => {
  if (newRef && sidePanelState.pendingMethod && sidePanelState.isLoading) {
    // 组件引用已设置且有待执行的方法，调用 init
    await nextTick()
    if (sidePanelState.sideRef?.[sidePanelState.pendingMethod]) {
      // 将所有数据通过 init 函数传递
      await sidePanelState.sideRef[sidePanelState.pendingMethod](sidePanelState.pendingData)
      // 关闭 loading 状态
      sidePanelState.isLoading = false
    }
  }
}, { immediate: false })

// 组件卸载时清理资源
onBeforeUnmount(() => {
  // 停止 watch 监听
  if (stopWatchRef) {
    stopWatchRef()
    stopWatchRef = null
  }
  
  // 清理组件引用
  if (sidePanelState.sideRef) {
    if (typeof sidePanelState.sideRef.destroy === 'function') {
      sidePanelState.sideRef.destroy()
    } else if (typeof sidePanelState.sideRef.unmount === 'function') {
      sidePanelState.sideRef.unmount()
    }
  }
  
  // 清理回调
  onCloseCallback.value = null
  
  // 重置状态
  sidePanelState.show = false
  sidePanelState.sideComponent = null
  sidePanelState.sideRef = null
  sidePanelState.pendingComponent = null
  sidePanelState.pendingProps = {}
  sidePanelState.pendingMethod = ''
  sidePanelState.pendingData = {}
})

defineExpose({ open, close, updateContentLayout })
provide('slideClose', close)

</script>

<style scoped>
.slide-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--el-bg-color);
  transition: all 0.3s;
  border-radius: 8px;
  border: solid 1px var(--el-border-color);
}

.main {
  flex: 1;
  min-width: 0;
  flex-basis: 0;
  flex-shrink: 1;
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.main>* {
  max-width: 100%;
  box-sizing: border-box;
}

.side-panel {
  position: relative;
  min-width: 0;
  flex-basis: 0;
  flex-shrink: 0;
  flex-grow: 0;
  height: 100%;
  border-left: 1px solid var(--el-border-color);
  transition: none;
}

.side-panel>* {
  max-width: 100%;
  box-sizing: border-box;
}

.side-panel.is-animating {
  transition: transform 0.3s ease;
}

/* 拖拽线默认隐藏，hover 时显示 */
.resizer:hover {
  opacity: 1;
  z-index: 1;
}

.resizer {
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    transition: background-color 0.1s ease-out;
    background: transparent;
  }
}

.hover:before {
  background: var(--el-color-primary);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
}
</style>

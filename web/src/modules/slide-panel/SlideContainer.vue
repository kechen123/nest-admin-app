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
        <div :ref="resizerRef" class="resizer" />
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
import SidePanelWrapper from './components/SidePanelWrapper.vue'
import { checkFormChanges } from '@/utils/formComparison'
import { showUnsavedChangesDialog } from '@/utils/slidePanel'
import { usePanelDrag } from '@/composables/usePanelDrag'


const layoutStore = useLayoutStore()
const layout = layoutStore.mainLayout

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
  // 自动保存的初始数据快照
  initialFormDataSnapshot: null as Record<string, any> | null,
})

const containerRef = ref()
const onCloseCallback = ref<(() => void) | null>(null)
const isUpdatingLayout = ref(false)

// 使用拖拽 composable
const { isDragging, resizerRef: rightLineRef, addListener } = usePanelDrag({
  onDown: () => {
    layout.rightLayout.downWidth = layout.rightLayout.realTimeWidth
  },
  onUp: () => {
    layout.rightLayout.downWidth = layout.rightLayout.realTimeWidth
  },
  onMove: (e: MouseEvent, mouse: any) => {
    let w = layout.rightLayout.downWidth - mouse.x
    const rightMinWidth = layout.rightLayout.minWidth
    const contentMinWidth = layout.contentLayout.minWidth
    if (w < rightMinWidth) w = rightMinWidth
    if (mainRect.width - w < contentMinWidth) w = mainRect.width - contentMinWidth

    layout.rightLayout.realTimeWidth = w
    layout.contentLayout.realTimeWidth = mainRect.width - w
  }
})
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

  // 如果面板已经打开，先重置组件引用和快照，确保 watch 能够再次触发
  if (sidePanelState.show && sidePanelState.sideRef) {
    sidePanelState.sideRef = null
    sidePanelState.initialFormDataSnapshot = null // 清理旧的快照
  }

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

// 检查未保存的修改
const checkUnsavedChanges = (): boolean => {
  if (!sidePanelState.sideRef) {
    return false
  }

  const component = sidePanelState.sideRef

  // 1. 优先使用组件提供的检测方法
  if (typeof component.checkUnsavedChanges === 'function') {
    return component.checkUnsavedChanges()
  }

  // 2. 自动检测表单数据（使用工具函数）
  const formData = component.formData
  const formConfig = component.formConfig

  return checkFormChanges(formData, formConfig, sidePanelState.initialFormDataSnapshot)
}

// 显示确认对话框（使用工具函数）

const close = async (val: any) => {
  // 检查是否有未保存的修改
  if (checkUnsavedChanges()) {
    // 显示确认对话框（使用工具函数）
    const confirmed = await showUnsavedChangesDialog()
    if (!confirmed) {
      return
    }
  }

  // 执行实际的关闭操作
  await doClose(val)
}

// 实际的关闭操作
const doClose = async (val: any) => {
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
  sidePanelState.initialFormDataSnapshot = null // 清理初始数据快照
  onCloseCallback.value = null
}

const onSlideInComplete = async () => {
  await nextTick()
  // 动画完成后，设置组件和属性
  sidePanelState.sideComponent = sidePanelState.pendingComponent
  sidePanelState.sideProps = sidePanelState.pendingProps

  // 等待组件引用设置（处理面板已打开时重新打开的情况）
  // 组件引用可能已经存在（相同组件）或需要等待挂载（不同组件）
  await nextTick()

  if (sidePanelState.sideRef && sidePanelState.pendingMethod) {
    const initMethod = sidePanelState.sideRef[sidePanelState.pendingMethod]
    if (typeof initMethod === 'function') {
      try {
        await initMethod(sidePanelState.pendingData)

        // 组件初始化完成后，自动保存 formData 快照
        const component = sidePanelState.sideRef
        if (component.formData && component.formConfig) {
          // 深度克隆 formData 作为初始快照
          sidePanelState.initialFormDataSnapshot = JSON.parse(JSON.stringify(component.formData))
        }
      } catch (error) {
        console.error('组件 init 方法调用失败:', error)
      } finally {
        // 无论成功还是失败，都设置为非加载状态
        sidePanelState.isLoading = false
      }
    } else {
      sidePanelState.isLoading = false
    }
  } else {
    sidePanelState.isLoading = false
  }

  updateContentLayout()
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
  sidePanelState.initialFormDataSnapshot = null
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

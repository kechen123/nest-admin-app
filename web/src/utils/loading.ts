import { createApp, type App } from 'vue'
import PageLoading from '@/components/PageLoading/index.vue'

let loadingApp: App | null = null
let loadingInstance: any = null
let container: HTMLDivElement | null = null

/**
 * 显示页面加载loading
 */
export const showPageLoading = (text?: string) => {
  if (!loadingInstance) {
    // 创建loading组件实例
    container = document.createElement('div')
    document.body.appendChild(container)

    loadingApp = createApp(PageLoading, { text })
    loadingInstance = loadingApp.mount(container)

    // 显示loading
    loadingInstance.show()
  }
}

/**
 * 隐藏页面加载loading
 */
export const hidePageLoading = () => {
  if (loadingInstance && loadingApp && container) {
    // 隐藏loading
    loadingInstance.hide()

    // 延迟销毁，等待动画完成
    setTimeout(() => {
      if (loadingApp && container) {
        loadingApp.unmount()
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
        loadingApp = null
        loadingInstance = null
        container = null
      }
    }, 300)
  }
}


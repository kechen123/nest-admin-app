/**
 * 系统信息相关 Composable
 */
import { ref } from 'vue'

export function useSystemInfo() {
  const statusBarHeight = ref(0)
  const safeAreaTop = ref(0)

  /**
   * 获取系统信息，适配安全区域
   */
  function getSystemInfo() {
    try {
      const systemInfo = uni.getSystemInfoSync()
      statusBarHeight.value = systemInfo.statusBarHeight || 0
      // 计算安全区域顶部高度（状态栏高度，用于动态设置padding-top）
      safeAreaTop.value = statusBarHeight.value
    }
    catch (error) {
      console.error('获取系统信息失败:', error)
      safeAreaTop.value = 0
    }
  }

  return {
    statusBarHeight,
    safeAreaTop,
    getSystemInfo,
  }
}

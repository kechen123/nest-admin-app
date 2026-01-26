/**
 * 地图区域变化处理 Composable
 */
import { ref, type Ref } from 'vue'
import { debounce } from '@/utils/debounce'

const DEBOUNCE_DELAY = 500 // 防抖延迟（毫秒）

export function useMapRegionChange(
  mapLatitude: Ref<number>,
  mapLongitude: Ref<number>,
  onRegionChangeCallback: (lat: number, lon: number) => void,
) {
  const lastCenterLat = ref<number | null>(null)
  const lastCenterLon = ref<number | null>(null)
  const isUserDragging = ref(false) // 标记用户是否在拖动地图

  /**
   * 处理地图中心位置变化
   */
  function handleCenterLocationChange() {
    // 获取地图中心点坐标
    const mapContext = uni.createMapContext('home-map')
    mapContext.getCenterLocation({
      success: (res: any) => {
        const centerLat = res.latitude
        const centerLon = res.longitude

        // 检查位置是否真的发生了变化（避免微小变化触发请求）
        if (lastCenterLat.value !== null && lastCenterLon.value !== null) {
          const latDiff = Math.abs(centerLat - lastCenterLat.value)
          const lonDiff = Math.abs(centerLon - lastCenterLon.value)
          // 如果位置变化小于 0.001 度（约 100 米），不触发请求
          if (latDiff < 0.001 && lonDiff < 0.001) {
            return
          }
        }

        // 更新地图中心点
        mapLatitude.value = centerLat
        mapLongitude.value = centerLon
        lastCenterLat.value = centerLat
        lastCenterLon.value = centerLon

        // 调用回调函数加载当前位置的点位
        onRegionChangeCallback(centerLat, centerLon)
      },
      fail: () => {
        // 如果获取失败，使用当前的地图中心点
        onRegionChangeCallback(mapLatitude.value, mapLongitude.value)
      },
    })
  }

  // 使用防抖处理区域变化
  const debouncedHandleChange = debounce(handleCenterLocationChange, DEBOUNCE_DELAY)

  /**
   * 地图区域变化事件（地图滑动、缩放时触发）
   */
  function onRegionChange(e: any) {
    // 只在拖动开始时标记，拖动结束时处理
    if (e.type === 'begin') {
      isUserDragging.value = true
    }
    else if (e.type === 'end') {
      // 只有用户主动拖动地图时才加载新位置的点位
      if (isUserDragging.value) {
        isUserDragging.value = false
        debouncedHandleChange()
      }
    }
  }

  /**
   * 初始化地图中心位置（用于首次加载后记录位置）
   */
  function initCenterLocation(lat: number, lon: number) {
    lastCenterLat.value = lat
    lastCenterLon.value = lon
  }

  return {
    onRegionChange,
    initCenterLocation,
  }
}

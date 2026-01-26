/**
 * 地图点位加载相关 Composable
 */
import { ref, nextTick, type Ref } from 'vue'
import { getMapMarkers } from '@/api/checkin'
import { mergeMarkerImage } from '@/utils/imageMerge'
import {
  getCachedMarkers,
  saveMarkersToCache,
  mergeMarkers,
  filterMarkersByDistance,
  isFirstVisit,
  updateMarkerIconPath,
  type CachedMarker,
} from '@/utils/mapMarkerCache'

const DEFAULT_RADIUS = 10 // 默认加载半径（公里）
const DEBOUNCE_DELAY = 500 // 防抖延迟（毫秒）

export function useMapMarkers(
  mapLatitude: Ref<number>,
  mapLongitude: Ref<number>,
  showPublicCheckins: Ref<boolean>,
  onlyShowMarkers?: Ref<boolean>,
  selectedMarkerId?: Ref<number | null>,
) {
  const mapMarkers = ref<any[]>([])
  const isLoadingMarkers = ref(false)
  const loadRadius = ref(DEFAULT_RADIUS)
  const lastRequestParams = ref<{ lat: number; lon: number; radius: number } | null>(null) // 上次请求的参数

  /**
   * 转换API数据为缓存格式
   */
  function transformToCachedMarker(record: any): CachedMarker {
    return {
      id: record.id,
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      address: record.address,
      content: record.content,
      images: record.images || [],
      isPublic: record.isPublic,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      cachedAt: Date.now(),
    }
  }

  /**
   * 生成marker图标（带缓存）
   */
  async function generateMarkerIcon(record: CachedMarker): Promise<string> {
    // 如果已有缓存的图标路径，直接返回
    if (record.iconPath) {
      return record.iconPath
    }

    // 如果没有图片，使用默认图标
    if (!record.images || record.images.length === 0) {
      return '/static/images/location.png'
    }

    try {
      const iconPath = await mergeMarkerImage({
        canvasId: 'canvas-marker',
        foregroundSrc: record.images[0],
        backgroundSrc: '/static/images/marker_bg.png',
        size: 60,
        fgSize: 60,
        id: String(record.id),
      })

      // 更新缓存中的图标路径
      updateMarkerIconPath(record.id, iconPath.tempFilePath)

      return iconPath.tempFilePath
    }
    catch (error) {
      console.error(`生成图标失败 (ID: ${record.id}):`, error)
      return '/static/images/location.png'
    }
  }

 
  async function convertToMapMarkers(cachedMarkers: CachedMarker[]): Promise<any[]> {
    // 根据 onlyShowMarkers 状态决定 customCallout.display 的值
    const calloutDisplay = onlyShowMarkers?.value ? 'BYCLICK' : 'ALWAYS'
    
    // 获取当前选中的 marker ID
    const currentSelectedId = selectedMarkerId?.value ?? null
    
    const markers = cachedMarkers.map((record) => {
      const markerId = Number(record.id)
      const isSelected = currentSelectedId === markerId
      
      // 使用默认图标或原始图片作为 marker 图标
      const iconPath = '/static/images/love.png'
      
      // 根据是否选中设置不同的图标大小
      const width = isSelected ? 50 : 33  // 选中时变大
      const height = isSelected ? 36 : 24  // 选中时变大
      const zIndex = isSelected ? 999 : 0  // 选中时层级最高（微信小程序 marker 支持 zIndex）

      return {
        id: markerId, // 确保 id 是 number 类型（微信小程序要求）
        latitude: record.latitude,
        longitude: record.longitude,
        iconPath, // 使用图片作为 marker 图标
        width,
        height,
        zIndex, // 设置层级，选中的 marker 层级最高
        // 使用 customCallout 替代 callout，实现自定义气泡
        customCallout: {
          display: calloutDisplay, // 根据开关状态决定常显或点击显示
          anchorX: 0, // 横向偏移量，向右为正数
          anchorY: 0, // 纵向偏移量，向下为正数（负值向上）
        },
        // 保留原始数据，用于在 cover-view 中显示
        // 注意：cover-view 中只能使用有限的组件，且网络图片需要先下载
        _data: {
          content: record.content || record.address,
          image: record.images && record.images.length > 0 ? record.images[0] : null,
        },
      }
    })

    // 将选中的 marker 放在最后，确保层级最高（微信小程序地图 markers 数组中，后面的元素层级更高）
    // 分离选中的和未选中的 markers
    const selectedMarkers: any[] = []
    const unselectedMarkers: any[] = []
    
    markers.forEach((marker) => {
      if (marker.id === currentSelectedId) {
        selectedMarkers.push(marker)
      }
      else {
        unselectedMarkers.push(marker)
      }
    })
    
    // 将选中的放在最后
    const sortedMarkers = [...unselectedMarkers, ...selectedMarkers]

    return sortedMarkers.filter(m => m !== undefined && m !== null)
  }

  /**
   * 加载地图标记点（优化版：支持缓存和位置范围）
   * @param centerLat 中心纬度
   * @param centerLon 中心经度
   * @param radiusKm 查询半径（公里）
   * @param forceRefresh 是否强制刷新（忽略去重逻辑）
   */
  async function loadMapMarkers(centerLat?: number, centerLon?: number, radiusKm?: number, forceRefresh = false) {
    if (isLoadingMarkers.value) {
      return // 防止重复加载
    }

    try {
      // 使用当前位置或地图中心位置
      const currentLat = centerLat ?? mapLatitude.value
      const currentLon = centerLon ?? mapLongitude.value
      const radius = radiusKm ?? loadRadius.value

      // 检查是否与上次请求参数相同（避免重复请求相同位置）
      // 如果 forceRefresh 为 true，则跳过此检查并清除上次请求参数
      if (forceRefresh) {
        lastRequestParams.value = null // 清除上次请求参数，确保能重新请求
      }
      else if (lastRequestParams.value) {
        const { lat, lon, radius: lastRadius } = lastRequestParams.value
        const latDiff = Math.abs(currentLat - lat)
        const lonDiff = Math.abs(currentLon - lon)
        // 如果位置和半径都相同或变化很小（小于 0.0001 度，约 10 米），不重复请求
        if (latDiff < 0.0001 && lonDiff < 0.0001 && Math.abs(radius - lastRadius) < 0.1) {
          console.log('位置未变化，跳过请求')
          return
        }
      }

      isLoadingMarkers.value = true
      // 记录本次请求参数
      lastRequestParams.value = { lat: currentLat, lon: currentLon, radius }

      // 检查是否是首次进入
      const isFirst = isFirstVisit()
      let cachedMarkers: CachedMarker[] = []
      let displayMarkers: CachedMarker[] = []

      if (!isFirst) {
        // 非首次进入：先加载本地缓存
        const cached = getCachedMarkers()
        if (cached) {
          cachedMarkers = cached.markers
          // 先显示缓存中当前位置范围内的点位（前端临时显示，等待后端数据）
          if (currentLat !== undefined && currentLon !== undefined) {
            displayMarkers = filterMarkersByDistance(cachedMarkers, currentLat, currentLon, radius)
          } else {
            displayMarkers = cachedMarkers
          }
          console.log(`从缓存加载 ${displayMarkers.length} 个点位`)

          // 立即显示缓存数据
          mapMarkers.value = await convertToMapMarkers(displayMarkers)
        }
      }

      // 请求服务器数据（后端已实现位置范围过滤）
      console.log('请求服务器数据...', { currentLat, currentLon, radius })
      const apiMarkers = await getMapMarkers({
        latitude: currentLat,
        longitude: currentLon,
        radius,
        includePublic: showPublicCheckins.value,
      })
      const serverCachedMarkers = apiMarkers.map(transformToCachedMarker)

      if (isFirst) {
        // 首次进入：后端已过滤位置范围
        displayMarkers = serverCachedMarkers
        console.log(`首次加载 ${displayMarkers.length} 个点位（范围：${radius}公里）`)

        // 保存到缓存
        saveMarkersToCache(serverCachedMarkers)
      }
      else {
        // 非首次进入：合并数据
        const { newMarkers, deletedMarkerIds, allMarkers } = mergeMarkers(
          serverCachedMarkers,
          cachedMarkers,
        )

        console.log(`新增 ${newMarkers.length} 个点位，删除 ${deletedMarkerIds.length} 个点位`)

        // 更新缓存（保存所有点位，包括不在当前范围内的）
        saveMarkersToCache(allMarkers)

        // 后端已过滤位置范围，只显示服务器返回的点位（当前范围内的）
        // 注意：不能使用 allMarkers，因为它包含了所有缓存点位（包括不在范围内的）
        displayMarkers = serverCachedMarkers

        // 如果有新增点位，显示提示（可选）
        if (newMarkers.length > 0) {
          console.log(`当前位置范围内新增 ${newMarkers.length} 个点位`)
          console.log('新增点位详情:', newMarkers.map(m => ({ 
            id: m.id, 
            lat: m.latitude, 
            lon: m.longitude, 
            address: m.address,
            hasImages: !!(m.images && m.images.length > 0)
          })))
        }
      }

      // 更新地图标记点
      console.log(`准备转换 ${displayMarkers.length} 个点位为地图标记点`)
      console.log('待转换点位ID列表:', displayMarkers.map(m => m.id))
      const convertedMarkers = await convertToMapMarkers(displayMarkers)
      console.log(`转换完成，共 ${convertedMarkers.length} 个标记点`)
      console.log('转换后标记点ID列表:', convertedMarkers.map(m => m.id))
      console.log('标记点详情:', convertedMarkers.map(m => ({ id: m.id, lat: m.latitude, lon: m.longitude, icon: m.iconPath })))
      
      // 检查是否有重复的ID
      const ids = convertedMarkers.map(m => m.id)
      const uniqueIds = new Set(ids)
      if (ids.length !== uniqueIds.size) {
        console.warn('发现重复的标记点ID:', ids.filter((id, index) => ids.indexOf(id) !== index))
      }
      
      // 强制更新地图标记点（使用新数组引用确保响应式更新）
      // 使用 nextTick 确保 DOM 更新后再更新 markers
      await nextTick()
      // 直接赋值新数组，Vue 的响应式系统会自动检测变化
      // 注意：微信小程序地图组件的 markers 属性是响应式的，直接更新即可
      // 使用展开运算符创建新数组，确保引用改变，触发响应式更新
      mapMarkers.value = [...convertedMarkers]
      // 再次等待 nextTick，确保地图组件接收到更新
      await nextTick()
      console.log(`地图显示 ${mapMarkers.value.length} 个点位`)
    }
    catch (error) {
      console.error('加载地图标记点失败:', error)
      // 如果加载失败，尝试使用缓存数据
      const cached = getCachedMarkers()
      if (cached) {
        let fallbackMarkers = cached.markers
        // 如果提供了位置参数，过滤缓存数据
        if (centerLat !== undefined && centerLon !== undefined) {
          fallbackMarkers = filterMarkersByDistance(
            cached.markers,
            centerLat,
            centerLon,
            radiusKm ?? loadRadius.value,
          )
        }
        mapMarkers.value = await convertToMapMarkers(fallbackMarkers)
        console.log('使用缓存数据作为备用')
      }
      else {
        mapMarkers.value = []
      }
    }
    finally {
      isLoadingMarkers.value = false
    }
  }

  /**
   * 重新转换现有的 markers（用于更新 customCallout.display）
   */
  async function refreshMarkersDisplay() {
    // 从缓存中获取当前显示的点位数据
    const cached = getCachedMarkers()
    if (cached && cached.markers.length > 0) {
      // 获取当前地图中心位置
      const currentLat = mapLatitude.value
      const currentLon = mapLongitude.value
      const radius = loadRadius.value
      
      // 过滤出当前范围内的点位
      const displayMarkers = filterMarkersByDistance(cached.markers, currentLat, currentLon, radius)
      
      // 重新转换 markers
      const convertedMarkers = await convertToMapMarkers(displayMarkers)
      mapMarkers.value = [...convertedMarkers]
    }
  }

  return {
    mapMarkers,
    isLoadingMarkers,
    loadRadius,
    loadMapMarkers,
    refreshMarkersDisplay,
  }
}

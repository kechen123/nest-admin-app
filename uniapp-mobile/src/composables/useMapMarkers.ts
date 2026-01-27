/**
 * 地图点位加载相关 Composable
 */
import { ref, nextTick, type Ref } from 'vue'
import { getMapMarkers } from '@/api/checkin'
import { mergeMarkerImage } from '@/utils/imageMerge'
import { useUserStore } from '@/store/user'
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
const MIN_DISTANCE_KM = 7 // 最小触发距离（公里）

/**
 * 计算两点间的距离（公里）
 * 使用 Haversine 公式
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

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
      userId: record.userId, // 保存用户ID，用于过滤
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
   * 根据 includePublic 过滤缓存数据
   * @param markers 缓存数据
   * @param includePublic 是否包含公开数据（true=包含，false=不包含）
   * @param currentUserId 当前用户ID
   */
  function filterMarkersByIncludePublic(
    markers: CachedMarker[],
    includePublic: boolean,
    currentUserId?: number,
  ): CachedMarker[] {
    if (includePublic) {
      // 包含公开数据：返回所有数据（后端已经过滤过了）
      return markers
    }
    else {
      // 不包含公开数据：只返回当前用户和另一半的记录
      if (!currentUserId || currentUserId === -1) {
        // 未登录，不包含公开数据时应该返回空数组
        return []
      }
      // 过滤逻辑：
      // 1. 保留当前用户的记录（无论是否公开）
      // 2. 保留其他用户的私密记录（可能是另一半的记录，后端在 includePublic=0 时会返回）
      // 3. 过滤掉其他用户的公开记录（这些不应该在 includePublic=0 时显示）
      return markers.filter((marker) => {
        // 如果是当前用户的记录，保留
        if (marker.userId === currentUserId) {
          return true
        }
        // 如果不是当前用户的记录
        // 如果是私密的（isPublic=0 或 false），可能是另一半的记录，保留
        // 如果是公开的（isPublic=1 或 true），过滤掉
        const isPublic = marker.isPublic === 1 || marker.isPublic === true
        return !isPublic
      })
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

      // 先检查缓存，如果有缓存数据，先显示缓存数据（提升加载速度）
      const cached = getCachedMarkers()
      let cachedMarkers: CachedMarker[] = []
      let displayMarkers: CachedMarker[] = []
      if (cached && cached.markers.length > 0) {
        cachedMarkers = cached.markers
        
        // 根据 includePublic 过滤缓存数据
        const userStore = useUserStore()
        const currentUserId = userStore.userInfo?.userInfo?.userId
        const filteredByIncludePublic = filterMarkersByIncludePublic(
          cachedMarkers,
          showPublicCheckins.value,
          currentUserId && currentUserId !== -1 ? currentUserId : undefined,
        )
        
        // 再根据位置范围过滤
        if (currentLat !== undefined && currentLon !== undefined) {
          displayMarkers = filterMarkersByDistance(filteredByIncludePublic, currentLat, currentLon, radius)
        } else {
          displayMarkers = filteredByIncludePublic
        }
        console.log(`从缓存加载 ${displayMarkers.length} 个点位（已根据 includePublic=${showPublicCheckins.value ? 1 : 0} 过滤）`)

        // 立即显示缓存数据（无论距离多少，先显示缓存提升体验）
        mapMarkers.value = await convertToMapMarkers(displayMarkers)
      }

      // 检查是否需要请求服务器数据
      let shouldRequest = false
      if (forceRefresh) {
        // 强制刷新，清除上次请求参数，确保能重新请求
        lastRequestParams.value = null
        shouldRequest = true
        console.log('强制刷新，触发请求')
      }
      else if (lastRequestParams.value) {
        const { lat, lon } = lastRequestParams.value

        // 计算与上次请求位置的距离
        const distance = calculateDistance(lat, lon, currentLat, currentLon)

        // 如果距离大于等于7公里，才发起请求
        if (distance >= MIN_DISTANCE_KM) {
          shouldRequest = true
          console.log(`位置变化距离 ${distance.toFixed(2)} 公里，大于等于 ${MIN_DISTANCE_KM} 公里，触发请求`)
        }
        else {
          console.log(`位置变化距离 ${distance.toFixed(2)} 公里，小于 ${MIN_DISTANCE_KM} 公里，跳过请求，使用缓存数据`)
          // 如果距离小于7公里，不请求服务器，直接使用已显示的缓存数据
          return
        }
      }
      else {
        // 没有上次请求记录，首次请求
        shouldRequest = true
        console.log('首次请求服务器数据')
      }

      // 如果需要请求服务器数据
      if (!shouldRequest) {
        return
      }

      isLoadingMarkers.value = true
      // 记录本次请求参数
      lastRequestParams.value = { lat: currentLat, lon: currentLon, radius }

      // 检查是否是首次进入
      const isFirst = isFirstVisit()

      // 请求服务器数据（后端已实现位置范围过滤）
      console.log('请求服务器数据...', { currentLat, currentLon, radius })
      const apiMarkers = await getMapMarkers({
        latitude: currentLat,
        longitude: currentLon,
        radius,
        includePublic: showPublicCheckins.value ? 1 : 0, // 将 boolean 转换为 0/1
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

      // 服务器数据返回后，更新地图标记点（覆盖之前显示的缓存数据）

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
        // 根据 includePublic 过滤缓存数据
        const userStore = useUserStore()
        const currentUserId = userStore.userInfo?.userInfo?.userId
        let fallbackMarkers = filterMarkersByIncludePublic(
          cached.markers,
          showPublicCheckins.value,
          currentUserId && currentUserId !== -1 ? currentUserId : undefined,
        )
        // 如果提供了位置参数，再根据位置范围过滤
        if (centerLat !== undefined && centerLon !== undefined) {
          fallbackMarkers = filterMarkersByDistance(
            fallbackMarkers,
            centerLat,
            centerLon,
            radiusKm ?? loadRadius.value,
          )
        }
        mapMarkers.value = await convertToMapMarkers(fallbackMarkers)
        console.log('使用缓存数据作为备用（已根据 includePublic 过滤）')
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
      
      // 根据 includePublic 过滤缓存数据
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo?.userInfo?.userId
      const filteredByIncludePublic = filterMarkersByIncludePublic(
        cached.markers,
        showPublicCheckins.value,
        currentUserId && currentUserId !== -1 ? currentUserId : undefined,
      )
      
      // 再过滤出当前范围内的点位
      const displayMarkers = filterMarkersByDistance(filteredByIncludePublic, currentLat, currentLon, radius)
      
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

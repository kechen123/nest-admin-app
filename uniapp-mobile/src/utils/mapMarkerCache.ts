/**
 * 地图点位本地缓存管理工具
 */

export interface CachedMarker {
  id: string | number
  latitude: number
  longitude: number
  address: string
  content?: string
  images?: string[]
  isPublic?: boolean | number
  createdAt: string
  updatedAt: string
  // 缓存相关
  cachedAt: number // 缓存时间戳
  iconPath?: string // 缓存的图标路径
}

export interface MarkerCacheData {
  markers: CachedMarker[]
  lastUpdateTime: number // 最后更新时间
  version: number // 缓存版本号
}

const CACHE_KEY = 'map_markers_cache'
const CACHE_VERSION = 1
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000 // 缓存最大有效期：7天

/**
 * 计算两点之间的距离（公里）
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 过滤指定范围内的点位
 */
export function filterMarkersByDistance(
  markers: CachedMarker[],
  centerLat: number,
  centerLon: number,
  radiusKm: number,
): CachedMarker[] {
  return markers.filter((marker) => {
    const distance = calculateDistance(
      centerLat,
      centerLon,
      marker.latitude,
      marker.longitude,
    )
    return distance <= radiusKm
  })
}

/**
 * 获取缓存的点位数据
 */
export function getCachedMarkers(): MarkerCacheData | null {
  try {
    const cached = uni.getStorageSync(CACHE_KEY)
    if (!cached) {
      return null
    }

    const data: MarkerCacheData = JSON.parse(cached)
    
    // 检查缓存版本
    if (data.version !== CACHE_VERSION) {
      console.log('缓存版本不匹配，清除旧缓存')
      clearCache()
      return null
    }

    // 检查缓存是否过期
    const now = Date.now()
    if (now - data.lastUpdateTime > MAX_CACHE_AGE) {
      console.log('缓存已过期，清除缓存')
      clearCache()
      return null
    }

    return data
  }
  catch (error) {
    console.error('读取缓存失败:', error)
    return null
  }
}

/**
 * 保存点位数据到缓存
 */
export function saveMarkersToCache(markers: CachedMarker[]): void {
  try {
    const now = Date.now()
    const data: MarkerCacheData = {
      markers: markers.map(marker => ({
        ...marker,
        cachedAt: now,
      })),
      lastUpdateTime: now,
      version: CACHE_VERSION,
    }
    uni.setStorageSync(CACHE_KEY, JSON.stringify(data))
    console.log(`已缓存 ${markers.length} 个点位`)
  }
  catch (error) {
    console.error('保存缓存失败:', error)
  }
}

/**
 * 合并服务器数据和本地缓存
 * 返回新增的点位和需要删除的点位ID
 */
export function mergeMarkers(
  serverMarkers: CachedMarker[],
  cachedMarkers: CachedMarker[],
): {
  newMarkers: CachedMarker[]
  deletedMarkerIds: (string | number)[]
  allMarkers: CachedMarker[]
} {
  const serverIds = new Set(serverMarkers.map(m => m.id))
  const cachedIds = new Set(cachedMarkers.map(m => m.id))

  // 找出新增的点位（服务器有但缓存没有的）
  const newMarkers = serverMarkers.filter(m => !cachedIds.has(m.id))

  // 找出已删除的点位（缓存有但服务器没有的）
  const deletedMarkerIds = Array.from(cachedIds).filter(id => !serverIds.has(id))

  // 合并所有点位，服务器数据优先
  const markerMap = new Map<string | number, CachedMarker>()
  
  // 先添加缓存数据（保留图标路径）
  cachedMarkers.forEach(marker => {
    markerMap.set(marker.id, marker)
  })
  
  // 用服务器数据覆盖（更新数据，但保留图标路径如果存在）
  serverMarkers.forEach(marker => {
    const existing = markerMap.get(marker.id)
    if (existing && existing.iconPath) {
      // 保留缓存的图标路径
      markerMap.set(marker.id, {
        ...marker,
        iconPath: existing.iconPath,
      })
    }
    else {
      markerMap.set(marker.id, marker)
    }
  })

  const allMarkers = Array.from(markerMap.values())

  return {
    newMarkers,
    deletedMarkerIds,
    allMarkers,
  }
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  try {
    uni.removeStorageSync(CACHE_KEY)
    console.log('已清除点位缓存')
  }
  catch (error) {
    console.error('清除缓存失败:', error)
  }
}

/**
 * 检查是否是首次进入（没有缓存）
 */
export function isFirstVisit(): boolean {
  const cached = getCachedMarkers()
  return cached === null || cached.markers.length === 0
}

/**
 * 更新单个点位的图标路径
 */
export function updateMarkerIconPath(markerId: string | number, iconPath: string): void {
  try {
    const cached = getCachedMarkers()
    if (!cached) {
      return
    }

    const marker = cached.markers.find(m => m.id === markerId)
    if (marker) {
      marker.iconPath = iconPath
      saveMarkersToCache(cached.markers)
    }
  }
  catch (error) {
    console.error('更新图标路径失败:', error)
  }
}

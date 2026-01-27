<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useTokenStore } from '@/store/token'
import { useMapLocation } from '@/composables/useMapLocation'
import { useMapMarkers } from '@/composables/useMapMarkers'
import { useSystemInfo } from '@/composables/useSystemInfo'
import { useMapRegionChange } from '@/composables/useMapRegionChange'

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '恋爱足迹',
  },
})

// Store
const tokenStore = useTokenStore()

// Composables
const { mapLatitude, mapLongitude, mapScale, getCurrentLocation } = useMapLocation()
const { safeAreaTop, getSystemInfo } = useSystemInfo()

// 从本地存储读取设置
const STORAGE_KEY_PUBLIC_CHECKINS: string = 'map_settings_show_public_checkins'
const STORAGE_KEY_ONLY_SHOW_MARKERS: string = 'map_settings_only_show_markers'

const showPublicCheckins = ref(
  uni.getStorageSync(STORAGE_KEY_PUBLIC_CHECKINS) !== false, // 默认 true，如果存储的是 false 则为 false
)
const onlyShowMarkers = ref(
  uni.getStorageSync(STORAGE_KEY_ONLY_SHOW_MARKERS) === true, // 默认 false，只有明确存储为 true 才为 true
)
const selectedMarkerId = ref<number | null>(null) // 当前选中的 marker ID

const { mapMarkers, loadMapMarkers, loadRadius, refreshMarkersDisplay } = useMapMarkers(
  mapLatitude,
  mapLongitude,
  showPublicCheckins,
  onlyShowMarkers,
  selectedMarkerId,
)

// 地图区域变化处理
const { onRegionChange, initCenterLocation } = useMapRegionChange(
  mapLatitude,
  mapLongitude,
  (lat, lon) => {
    // 只有在初始化完成后才响应地图滑动
    if (isInitialized.value && !isInitializing.value) {
      console.log('地图滑动，加载新位置的点位')
      loadMapMarkers(lat, lon, loadRadius.value)
    }
  },
)

// 其他状态
const lastRefreshTime = ref(0) // 上次刷新时间
const isInitialized = ref(false) // 是否已初始化完成
const isInitializing = ref(false) // 是否正在初始化
const showSettingsModal = ref(false) // 是否显示设置弹窗

// 刷新数据
async function refreshData(forceRefresh = false) {
  try {
    // 显式传入当前位置，确保使用最新的定位结果
    // 如果 forceRefresh 为 true，强制刷新，忽略去重逻辑
    await loadMapMarkers(mapLatitude.value, mapLongitude.value, loadRadius.value, forceRefresh)
    // 更新刷新时间
    lastRefreshTime.value = Date.now()
  }
  catch (error) {
    console.error('刷新数据失败:', error)
  }
}

// 监听发布成功事件，刷新数据
async function onCheckinPublished() {
  // 发布成功后强制刷新，确保显示最新数据
  console.log('收到发布成功事件，强制刷新地图数据')
  // 重置上次请求参数，确保能重新请求
  await refreshData(true)
  // 更新刷新时间
  lastRefreshTime.value = Date.now()
}

// 加载统计数据
onMounted(async () => {
  try {
    isInitializing.value = true
    // 获取系统信息
    getSystemInfo()
    // 先定位到当前位置
    await getCurrentLocation()
    // 加载数据
    await refreshData()
    // 初始化地图中心位置记录，避免首次 regionchange 触发请求
    initCenterLocation(mapLatitude.value, mapLongitude.value)
    // 标记初始化完成
    isInitialized.value = true
    // 监听发布成功事件
    uni.$on('checkin-published', onCheckinPublished)
  }
  catch (error) {
    console.error('加载数据失败:', error)
    isInitialized.value = true // 即使失败也标记为已初始化
  }
  finally {
    isInitializing.value = false
  }
})

// 页面显示时刷新数据（从发布页面返回时）
onShow(async () => {
  // 如果已经初始化完成，且距离上次刷新超过 1 秒，则刷新（避免频繁刷新）
  if (isInitialized.value && !isInitializing.value) {
    const now = Date.now()
    // 缩短刷新间隔，确保从发布页面返回时能及时刷新
    if (now - lastRefreshTime.value > 1000) {
      console.log('页面显示，刷新地图数据')
      await refreshData(true) // 从其他页面返回时也强制刷新
      lastRefreshTime.value = now
    }
  }
})

// 卸载时移除事件监听
onUnmounted(() => {
  uni.$off('checkin-published', onCheckinPublished)
})

/**
 * 切换显示公开打卡
 */
async function togglePublicCheckins(e?: any) {
  console.log('切换显示公开打卡', e)
  if (e) {
    showPublicCheckins.value = e.detail.value
  }
  else {
    showPublicCheckins.value = !showPublicCheckins.value
  }
  // 保存到本地存储
  uni.setStorageSync(STORAGE_KEY_PUBLIC_CHECKINS, showPublicCheckins.value)
  // 切换时重新加载，传入当前位置
  await loadMapMarkers(mapLatitude.value, mapLongitude.value, loadRadius.value)
}

/**
 * 切换只显示点位
 */
async function toggleOnlyShowMarkers(e?: any) {
  if (e) {
    onlyShowMarkers.value = e.detail.value
  }
  else {
    onlyShowMarkers.value = !onlyShowMarkers.value
  }
  // 保存到本地存储
  uni.setStorageSync(STORAGE_KEY_ONLY_SHOW_MARKERS, onlyShowMarkers.value)
  // 切换时只重新转换 markers，不需要重新从服务器加载
  await refreshMarkersDisplay()
}

/**
 * 打开设置弹窗
 */
function openSettingsModal() {
  showSettingsModal.value = true
}

/**
 * 关闭设置弹窗
 */
function closeSettingsModal() {
  showSettingsModal.value = false
}

/**
 * 标记点点击事件
 */
async function onMarkerTap(e: any) {
  const markerId = e.detail.markerId
  console.log('点击了标记点', markerId)

  // 设置选中的 marker ID（如果点击的是同一个，则取消选中）
  if (selectedMarkerId.value === markerId) {
    selectedMarkerId.value = null
  }
  else {
    selectedMarkerId.value = markerId
  }

  // 更新 markers 显示（图标大小和层级）
  await refreshMarkersDisplay()

  // 直接跳转到详情页，详情页会自己加载数据
  // goToDetail(markerId)
}

/**
 * 气泡点击事件
 */
async function onCalloutTap(e: any) {
  const markerId = e.detail.markerId
  console.log('点击了气泡', markerId)

  // 设置选中的 marker ID（如果点击的是同一个，则取消选中）
  if (selectedMarkerId.value === markerId) {
    selectedMarkerId.value = null
  }
  else {
    selectedMarkerId.value = markerId
  }

  // 更新 markers 显示（图标大小和层级）
  await refreshMarkersDisplay()
}

/**
 * 跳转到详情页
 */
function goToDetail(id: string | number) {
  uni.navigateTo({
    url: `/pages/checkin/detail?id=${id}`,
  })
}
</script>

<template>
  <view class="home-container">
    <canvas id="canvas-marker" canvas-id="canvas-marker"
      style="width: 200px; height: 200px;position: absolute; top: -500rpx; left: -500rpx; z-index: -1;" />
    <!-- 地图区域 - 全屏背景 -->
    <view class="map-section">
      <view class="map-container">
        <map id="home-map" :latitude="mapLatitude" :longitude="mapLongitude" :scale="mapScale" :markers="mapMarkers"
          :show-location="true" class="map" @markertap="onMarkerTap" @callouttap="onCalloutTap"
          @regionchange="onRegionChange">
          <cover-view slot="callout">
            <cover-view v-for="marker in mapMarkers" :key="marker.id" :marker-id="marker.id" class="custom-callout">
              <cover-view class="callout-content">
                <!-- cover-image 支持网络图片，但建议使用本地路径 -->
                <cover-image v-if="marker._data?.image" :src="marker._data.image" class="callout-image"
                  mode="aspectFill" />
                <cover-view class="callout-text">
                  <cover-view class="callout-text-inner">
                    {{ marker._data?.content || marker._data?.address || '' }}
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </map>
        <!-- 悬浮设置按钮 -->
        <view v-if="tokenStore.hasLogin" class="settings-button" @click="openSettingsModal">
          <text class="settings-icon">⚙️</text>
        </view>
      </view>
    </view>

    <!-- 头部背景 - 悬浮在顶部 -->
    <view class="header-bg" :style="{ paddingTop: `${safeAreaTop}px` }">
      <view class="header-content">
        <text class="app-title">💕 恋爱足迹</text>
        <text class="app-subtitle">记录我们的美好时光</text>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view v-if="showSettingsModal" class="settings-modal" @click="closeSettingsModal">
      <view class="settings-modal-content" @click.stop>
        <view class="settings-modal-header">
          <text class="settings-modal-title">设置</text>
          <text class="settings-modal-close" @click="closeSettingsModal">✕</text>
        </view>
        <view class="settings-modal-body">
          <!-- 显示公开打卡开关 -->
          <view class="settings-item">
            <text class="settings-item-label">显示公开打卡</text>
            <switch color="#ff6b9d" :checked="showPublicCheckins" @change="togglePublicCheckins" />
          </view>
          <!-- 只显示点位开关 -->
          <view class="settings-item">
            <text class="settings-item-label">只显示点位</text>
            <switch color="#ff6b9d" :checked="onlyShowMarkers" @change="toggleOnlyShowMarkers" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(180deg,
      rgba(255, 107, 157, 0.95) 0%,
      rgba(255, 143, 171, 0.9) 50%,
      rgba(255, 143, 171, 0) 100%);
  padding: 60rpx 30rpx 80rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
  color: #fff;
  pointer-events: none;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;

  .app-title {
    font-size: 48rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }

  .app-subtitle {
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.stats-section {
  position: absolute;
  top: calc(160rpx + env(safe-area-inset-top));
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
  pointer-events: none;
}

.stats-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  pointer-events: auto;

  .stats-number {
    font-size: 48rpx;
    font-weight: 600;
    color: #ff6b9d;
    margin-bottom: 8rpx;
  }

  .stats-label {
    font-size: 24rpx;
    color: #999;
  }
}

.actions-section {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.action-btn {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  &.primary {
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    color: #fff;

    .action-icon,
    .action-text {
      color: #fff;
    }
  }

  .action-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }

  .action-text {
    font-size: 24rpx;
    color: #333;
  }
}

.latest-section {
  padding: 0 30rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;

  .more-link {
    font-size: 24rpx;
    font-weight: normal;
    color: #999;
  }
}

.latest-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
}

.latest-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;

  .image {
    width: 100%;
    height: 100%;
  }
}

.latest-content {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.latest-location {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;

  .location-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
  }

  .location-text {
    font-size: 26rpx;
    color: #666;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.latest-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.latest-time {
  font-size: 22rpx;
  color: #999;
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  text-align: center;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 20rpx;
  }

  .empty-tip {
    font-size: 28rpx;
    color: #999;
  }
}

.map-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.settings-button {
  position: absolute;
  bottom: 200rpx;
  right: 20rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  z-index: 10;
  cursor: pointer;

  .settings-icon {
    font-size: 40rpx;
  }
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #eee;

  .settings-modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }

  .settings-modal-close {
    font-size: 40rpx;
    color: #999;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.settings-modal-body {
  padding: 30rpx;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .settings-item-label {
    font-size: 32rpx;
    color: #333;
  }
}

/* 自定义气泡样式 */
.custom-callout {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.callout-content {
  background: #fff;
  border-radius: 8rpx;
  padding: 8rpx 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  max-width: 200rpx;
  min-width: 80rpx;
  border: 1rpx solid #ff6b9d;
  pointer-events: auto;
}

.callout-image {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1rpx solid rgba(255, 107, 157, 0.3);
}

.callout-text {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.callout-text-inner {
  font-size: 24rpx;
  color: #ff6b9d;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>

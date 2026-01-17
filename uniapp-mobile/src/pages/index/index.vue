<script lang="ts" setup>
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCheckinStore } from '@/store/checkin'
import { getMapMarkers } from '@/api/checkin'

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

const checkinStore = useCheckinStore()
const { records } = storeToRefs(checkinStore)
const stats = ref({ total: 0, thisMonth: 0, thisWeek: 0 })
const lastRefreshTime = ref(0) // 上次刷新时间

// 地图相关
const mapLatitude = ref(39.908823) // 默认位置（北京）
const mapLongitude = ref(116.397470) // 默认位置（北京）
const mapScale = ref(13)
const showPublicCheckins = ref(true) // 默认显示公开打卡
const mapMarkers = ref<any[]>([])
const statusBarHeight = ref(0) // 状态栏高度
const safeAreaTop = ref(0) // 安全区域顶部高度

// 获取系统信息，适配安全区域
function getSystemInfo() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight || 0
    // 计算安全区域顶部高度（状态栏高度，用于动态设置padding-top）
    safeAreaTop.value = statusBarHeight.value
  } catch (error) {
    console.error('获取系统信息失败:', error)
    safeAreaTop.value = 0
  }
}

// 获取当前位置
function getCurrentLocation() {
  return new Promise<void>((resolve) => {
    // #ifdef MP-WEIXIN
    // 微信小程序需要先检查定位权限
    uni.getSetting({
      success: (settingRes) => {
        if (settingRes.authSetting['scope.userLocation']) {
          // 已授权，直接获取位置
          console.log('已授权，直接获取位置')
          requestLocation()
        }
        else if (settingRes.authSetting['scope.userLocation'] === false) {
          console.log('用户拒绝了定位权限')
          // 用户拒绝了定位权限，引导用户开启
          uni.showModal({
            title: '需要定位权限',
            content: '为了更好的体验，需要获取您的位置信息',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting({
                  success: (openRes) => {
                    if (openRes.authSetting['scope.userLocation']) {
                      requestLocation()
                    }
                    else {
                      console.warn('用户未开启定位权限')
                      resolve()
                    }
                  },
                  fail: () => {
                    resolve()
                  },
                })
              }
              else {
                resolve()
              }
            },
          })
        }
        else {
          console.log('未询问过，直接请求定位')
          // 未询问过，直接请求定位
          requestLocation()
        }
      },
      fail: () => {
        // 获取设置失败，直接尝试定位
        requestLocation()
      },
    })

    function requestLocation() {
      uni.getLocation({
        type: 'gcj02',
        altitude: false,
        geocode: false,
        success: (res) => {
          console.log('定位成功:', res)
          mapLatitude.value = res.latitude
          mapLongitude.value = res.longitude
          mapScale.value = 15 // 定位后放大到合适的比例
          resolve()
        },
        fail: (err) => {
          console.warn('获取位置失败:', err)
          // 如果获取位置失败，使用默认位置（北京）
          mapLatitude.value = 39.908823
          mapLongitude.value = 116.397470
          mapScale.value = 13
          resolve()
        },
      })
    }
    // #endif

    // #ifndef MP-WEIXIN
    // 非微信小程序，直接获取位置
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('定位成功:', res)
        mapLatitude.value = res.latitude
        mapLongitude.value = res.longitude
        mapScale.value = 15 // 定位后放大到合适的比例
        resolve()
      },
      fail: (err) => {
        console.warn('获取位置失败，使用默认位置:', err)
        // 如果获取位置失败，使用默认位置（北京）
        mapLatitude.value = 39.908823
        mapLongitude.value = 116.397470
        mapScale.value = 13
        resolve()
      },
    })
    // #endif
  })
}

// 加载地图标记点（只加载公开打卡）
async function loadMapMarkers() {
  try {
    // 只加载公开打卡数据
    const apiMarkers = await getMapMarkers(true)
    const markers = apiMarkers.map((record: any) => ({
      id: record.id,
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      iconPath: record.images[0] || '/static/images/location.png',
      width: 40,
      height: 40,
      callout: {
        content: record.content || record.address,
        color: '#333',
        fontSize: 12,
        borderRadius: 5,
        bgColor: '#fff',
        padding: 5,
        display: 'BYCLICK',
      },
    }))

    mapMarkers.value = markers
  } catch (error) {
    console.error('加载地图标记点失败:', error)
    // 如果加载失败，清空标记点
    mapMarkers.value = []
  }
}

// 刷新数据
const refreshData = async () => {
  try {
    // 加载打卡记录列表
    await checkinStore.loadRecords()
    // 获取统计信息
    stats.value = await checkinStore.getStatistics()
    // 加载地图标记点
    await loadMapMarkers()
    // 更新刷新时间
    lastRefreshTime.value = Date.now()
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

// 监听发布成功事件，刷新数据
const onCheckinPublished = () => {
  refreshData()
}

// 加载统计数据
onMounted(async () => {
  try {
    // 获取系统信息
    getSystemInfo()
    // 先定位到当前位置
    await getCurrentLocation()
    // 加载数据
    await refreshData()
    // 监听发布成功事件
    uni.$on('checkin-published', onCheckinPublished)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})

// 页面显示时刷新数据（从发布页面返回时）
onShow(() => {
  // 如果距离上次刷新超过 2 秒，则刷新（避免频繁刷新）
  const now = Date.now()
  if (now - lastRefreshTime.value > 2000) {
    refreshData()
  }
})

// 卸载时移除事件监听
onUnmounted(() => {
  uni.$off('checkin-published', onCheckinPublished)
})

// 切换显示公开打卡
const togglePublicCheckins = async (e?: any) => {
  if (e) {
    showPublicCheckins.value = e.detail.value
  } else {
    showPublicCheckins.value = !showPublicCheckins.value
  }
  await loadMapMarkers()
}

// 标记点点击事件
async function onMarkerTap(e: any) {
  const markerId = e.detail.markerId
  // 先从本地records查找
  let record = records.value.find((r: any) => r.id === markerId)
  // 如果本地没有，尝试从API获取
  if (!record) {
    try {
      record = await checkinStore.getRecordById(markerId)
    } catch (error) {
      console.error('获取记录失败:', error)
    }
  }
  if (record) {
    goToDetail(record.id)
  }
}

// 最新打卡记录
const latestRecord = computed(() => {
  if (records.value.length === 0)
    return null
  return [...records.value].sort((a, b) => {
    const timeA = a.createdAt || a.createTime
    const timeB = b.createdAt || b.createTime
    return new Date(timeB).getTime() - new Date(timeA).getTime()
  })[0]
})

// 跳转到打卡发布页面
function goToAddCheckin() {
  uni.navigateTo({
    url: '/pages/checkin/add',
  })
}

// 跳转到地图页面
function goToMap() {
  uni.switchTab({
    url: '/pages/map/map',
  })
}

// 跳转到打卡列表
function goToList() {
  uni.switchTab({
    url: '/pages/checkin/list',
  })
}

// 跳转到详情
function goToDetail(id: string | number) {
  uni.navigateTo({
    url: `/pages/checkin/detail?id=${id}`,
  })
}
</script>

<template>
  <view class="home-container">
    <!-- 地图区域 - 全屏背景 -->
    <view class="map-section">
      <view class="map-container">
        <map :latitude="mapLatitude" :longitude="mapLongitude" :scale="mapScale" :markers="mapMarkers"
          :show-location="true" class="map" @markertap="onMarkerTap" />
        <!-- 悬浮开关 -->
        <view class="map-switch-float">
          <text class="switch-text">{{ showPublicCheckins ? '隐藏' : '显示' }}公开打卡</text>
          <switch color="#ff6b9d" :checked="showPublicCheckins" @change="togglePublicCheckins" />
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

    <!-- 统计卡片 - 悬浮在header下方 -->
    <view class="stats-section">
      <view class="stats-card">
        <text class="stats-number">{{ stats.total }}</text>
        <text class="stats-label">总打卡数</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ stats.thisMonth }}</text>
        <text class="stats-label">本月打卡</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ stats.thisWeek }}</text>
        <text class="stats-label">本周打卡</text>
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

.map-switch-float {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  z-index: 10;

  .switch-text {
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
  }
}
</style>

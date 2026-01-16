<script lang="ts" setup>
import { onMounted, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '选择位置',
  },
})

// 地图中心点
const latitude = ref(39.908823)
const longitude = ref(116.397470)
const scale = ref(16)

// 选中的位置（始终是地图中心点）
const selectedLat = ref(0)
const selectedLng = ref(0)
const selectedAddress = ref('')

// 是否正在更新位置（防止频繁调用API）
const isUpdating = ref(false)

// 逆地理编码（获取地址）
function reverseGeocode(lat: number, lng: number) {
  if (isUpdating.value)
    return
  isUpdating.value = true

  // #ifdef MP-WEIXIN
  // 微信小程序使用腾讯地图API
  uni.request({
    url: 'https://apis.map.qq.com/ws/geocoder/v1/',
    data: {
      location: `${lat},${lng}`,
      key: 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77', // 腾讯地图key，实际项目中应该从配置文件读取
      get_poi: 1,
    },
    success: (res: any) => {
      if (res.data && res.data.status === 0 && res.data.result) {
        const result = res.data.result
        // 优先使用POI名称，其次使用地址
        selectedAddress.value = result.pois && result.pois.length > 0
          ? result.pois[0].title || result.address
          : (result.address || result.formatted_addresses?.recommend || '当前位置')
      }
      else {
        selectedAddress.value = '当前位置'
      }
      isUpdating.value = false
    },
    fail: () => {
      selectedAddress.value = '当前位置'
      isUpdating.value = false
    },
  })
  // #endif

  // #ifndef MP-WEIXIN
  // 非微信小程序，使用默认名称
  selectedAddress.value = '当前位置'
  isUpdating.value = false
  // #endif
}

// 更新选中位置（地图中心点）
function updateSelectedLocation(lat: number, lng: number) {
  selectedLat.value = lat
  selectedLng.value = lng

  // 逆地理编码获取地址
  reverseGeocode(lat, lng)
}

// 地图区域变化事件（地图移动、缩放时触发）
function onRegionChange(e: any) {
  // 只在拖动结束时更新（type === 'end'）
  if (e.type === 'end' && !isUpdating.value) {
    // 使用 getCenterLocation 获取地图中心点坐标
    const mapContext = uni.createMapContext('map')
    mapContext.getCenterLocation({
      success: (res: any) => {
        const centerLat = res.latitude
        const centerLng = res.longitude

        // 更新地图中心点和选中位置
        latitude.value = centerLat
        longitude.value = centerLng
        updateSelectedLocation(centerLat, centerLng)
      },
      fail: () => {
        // 如果获取失败，使用当前的 latitude 和 longitude
        updateSelectedLocation(latitude.value, longitude.value)
      },
    })
  }
}

// 获取当前位置
function getCurrentLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      scale.value = 16
      // 更新选中位置
      updateSelectedLocation(res.latitude, res.longitude)
    },
    fail: () => {
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}

// 确认选择
function confirmSelect() {
  if (!selectedLat.value || !selectedLng.value) {
    uni.showToast({
      title: '请先在地图上选择位置',
      icon: 'none',
    })
    return
  }

  // 返回选中的位置信息
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage) {
    // 通过事件总线或全局变量传递数据
    // 这里使用 getApp() 的全局数据
    const app = getApp()
    if (!app.globalData) {
      app.globalData = {}
    }
    app.globalData.selectedLocation = {
      latitude: selectedLat.value,
      longitude: selectedLng.value,
      address: selectedAddress.value,
    }
  }

  uni.navigateBack({
    delta: 1,
  })
}

onMounted(() => {
  // 检查是否有传入的位置参数（从发布页面传入）
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}

  if (options.lat && options.lng) {
    latitude.value = Number.parseFloat(options.lat)
    longitude.value = Number.parseFloat(options.lng)
    updateSelectedLocation(latitude.value, longitude.value)
  }
  else {
    // 获取当前位置
    getCurrentLocation()
  }
})
</script>

<template>
  <view class="select-location-container">
    <map
      id="map"
      :latitude="latitude"
      :longitude="longitude"
      :scale="scale"
      :show-location="true"
      class="map"
      @regionchange="onRegionChange"
    />

    <!-- 固定在屏幕中间的指针 -->
    <view class="center-pointer">
      <view class="pointer-icon">
        📍
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tip-box">
      <text class="tip-text">移动地图，指针位置即为选中位置</text>
      <text v-if="selectedAddress" class="selected-address">{{ selectedAddress }}</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-actions">
      <button class="location-btn" @click="getCurrentLocation">
        定位到当前位置
      </button>
      <button class="confirm-btn" :disabled="!selectedLat || !selectedLng" @click="confirmSelect">
        确认选择
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.select-location-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.center-pointer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 998;
  pointer-events: none;

  .pointer-icon {
    font-size: 60rpx;
    text-align: center;
    filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.3));
  }
}

.tip-box {
  position: fixed;
  top: 20rpx;
  left: 30rpx;
  right: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 999;

  .tip-text {
    font-size: 28rpx;
    color: #666;
    display: block;
    margin-bottom: 8rpx;
  }

  .selected-address {
    font-size: 24rpx;
    color: #999;
    display: block;
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
  z-index: 999;
}

.location-btn {
  flex: 1;
  height: 88rpx;
  background: #fff;
  color: #333;
  border: 2rpx solid #e0e0e0;
  border-radius: 44rpx;
  font-size: 28rpx;
  line-height: 84rpx;
}

.confirm-btn {
  flex: 2;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  line-height: 88rpx;

  &[disabled] {
    opacity: 0.5;
  }
}
</style>

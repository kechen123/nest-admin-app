<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useCheckinStore } from '@/store/checkin'

definePage({
  style: {
    navigationBarTitleText: '恋爱足迹',
  },
})

const checkinStore = useCheckinStore()
const { records } = storeToRefs(checkinStore)

// 加载打卡记录
onMounted(async () => {
  try {
    await checkinStore.loadRecords()
  }
  catch (error) {
    console.error('加载打卡记录失败:', error)
  }
})

// 地图中心点（默认北京）
const latitude = ref(39.908823)
const longitude = ref(116.397470)
const scale = ref(16)

// 地图标记点
const markers = computed(() => {
  return records.value.map(record => ({
    id: record.id,
    latitude: record.latitude,
    longitude: record.longitude,
    // 不设置 iconPath，使用默认标记样式
    width: 30,
    height: 30,
    callout: {
      content: record.content || '恋爱足迹',
      color: '#333',
      fontSize: 12,
      borderRadius: 5,
      bgColor: '#fff',
      padding: 5,
      display: 'BYCLICK', // 点击时显示
    },
  }))
})

// 获取当前位置
function getCurrentLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
    },
    fail: () => {
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}

// 标记点点击事件
function onMarkerTap(e: any) {
  const markerId = e.detail.markerId
  const record = checkinStore.getRecordById(markerId)
  if (record) {
    uni.navigateTo({
      url: `/pages/checkin/detail?id=${record.id}`,
    })
  }
}

// 地图点击事件（添加新打卡）
function onMapTap() {
  // 可以在这里添加点击地图添加打卡的功能
}

// 跳转到打卡发布页面
function goToAddCheckin() {
  uni.navigateTo({
    url: '/pages/checkin/add',
  })
}

onMounted(async () => {
  // 加载打卡记录
  try {
    await checkinStore.loadRecords()
  }
  catch (error) {
    console.error('加载打卡记录失败:', error)
  }

  // 如果有打卡记录，将地图中心设置为第一个打卡点
  if (records.value.length > 0) {
    const firstRecord = records.value[0]
    latitude.value = firstRecord.latitude
    longitude.value = firstRecord.longitude
  }
  else {
    // 否则获取当前位置
    getCurrentLocation()
  }
})
</script>

<template>
  <view class="map-container">
    <map
      id="map"
      :latitude="latitude"
      :longitude="longitude"
      :scale="scale"
      :markers="markers"
      :show-location="true"
      class="map"
      @markertap="onMarkerTap"
      @tap="onMapTap"
    />
    <!-- 添加打卡按钮 -->
    <view class="add-btn" @click="goToAddCheckin">
      <view class="add-icon">
        +
      </view>
      <text class="add-text">打卡</text>
    </view>
    <!-- 定位按钮 -->
    <view class="location-btn" @click="getCurrentLocation">
      <text class="location-icon">📍</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.add-btn {
  position: fixed;
  bottom: 120rpx;
  right: 30rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.4);
  z-index: 999;

  .add-icon {
    font-size: 60rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }

  .add-text {
    font-size: 24rpx;
    color: #fff;
    margin-top: 4rpx;
  }
}

.location-btn {
  position: fixed;
  bottom: 260rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 999;

  .location-icon {
    font-size: 40rpx;
  }
}
</style>

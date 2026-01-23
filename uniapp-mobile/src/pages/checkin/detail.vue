<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useCheckinStore } from '@/store/checkin'
import dayjs from 'dayjs'

definePage({
  style: {
    navigationBarTitleText: '打卡详情',
  },
})

const checkinStore = useCheckinStore()

// 获取路由参数
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const recordId = ref((currentPage.options as any).id || '')

// 打卡记录
const record = ref<any>(null)

// 加载打卡记录
onMounted(async () => {
  if (!recordId.value) {
    uni.showToast({
      title: '记录不存在',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  try {
    record.value = await checkinStore.getRecordById(recordId.value)
    if (!record.value) {
      uni.showToast({
        title: '记录不存在',
        icon: 'none',
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('加载记录失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
})

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY年MM月DD日 HH:mm')
}

// 预览图片
const previewImage = (index: number) => {
  if (!record.value) return
  uni.previewImage({
    urls: record.value.images,
    current: index,
  })
}

// 在地图上查看
const viewOnMap = () => {
  if (!record.value) return
  uni.switchTab({
    url: '/pages/map/map',
  })
  // 可以传递参数让地图定位到该点
}

// 删除打卡
const deleteCheckin = async () => {
  if (!record.value) return

  uni.showModal({
    title: '提示',
    content: '确定要删除这条打卡记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          await checkinStore.deleteRecord(record.value!.id)
          uni.hideLoading()
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          uni.hideLoading()
          console.error('删除失败:', error)
        }
      }
    },
  })
}
</script>

<template>
  <view v-if="record" class="detail-container">
    <!-- 头部图片 -->
    <view v-if="record.images.length > 0" class="header-images">
      <swiper class="swiper" :indicator-dots="record.images.length > 1" :autoplay="false"
        indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#fff">
        <swiper-item v-for="(image, index) in record.images" :key="index" @click="previewImage(index)">
          <wd-img :src="image" mode="aspectFill" class="header-image" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y>
      <!-- 位置信息 -->
      <view class="content-section">
        <view class="section-header">
          <text class="section-icon">📍</text>
          <text class="section-title">位置</text>
        </view>
        <view class="location-info">
          <text class="location-text">{{ record.address }}</text>
          <button class="map-btn" size="mini" @click="viewOnMap">在地图上查看</button>
        </view>
        <view class="location-coords">
          坐标：{{ record.latitude.toFixed(6) }}, {{ record.longitude.toFixed(6) }}
        </view>
      </view>

      <!-- 打卡内容 -->
      <view v-if="record.content" class="content-section">
        <view class="section-header">
          <text class="section-icon">💕</text>
          <text class="section-title">内容</text>
        </view>
        <view class="content-text">{{ record.content }}</view>
      </view>

      <!-- 时间信息 -->
      <view class="content-section">
        <view class="section-header">
          <text class="section-icon">🕐</text>
          <text class="section-title">时间</text>
        </view>
        <view class="time-info">
          <text class="time-text">{{ formatTime(record.createdAt || record.createTime) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="footer-actions">
      <button class="delete-btn" @click="deleteCheckin">删除</button>
    </view>
  </view>

  <view v-else class="loading-container">
    <text>加载中...</text>
  </view>
</template>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header-images {
  width: 100%;
  height: 500rpx;
  background: #000;
}

.swiper {
  width: 100%;
  height: 100%;
}

.header-image {
  width: 100%;
  height: 100%;
}

.content-scroll {
  height: calc(100vh - 500rpx);
}

.content-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .section-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;

  .location-text {
    font-size: 30rpx;
    color: #333;
    flex: 1;
  }

  .map-btn {
    background: #ff6b9d;
    color: #fff;
    border: none;
    border-radius: 8rpx;
    font-size: 24rpx;
    padding: 8rpx 20rpx;
  }
}

.location-coords {
  font-size: 24rpx;
  color: #999;
}

.content-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  word-break: break-all;
}

.time-info {
  .time-text {
    font-size: 28rpx;
    color: #666;
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
}

.delete-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  color: #ff4757;
  border: 2rpx solid #ff4757;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 84rpx;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 28rpx;
  color: #999;
}
</style>

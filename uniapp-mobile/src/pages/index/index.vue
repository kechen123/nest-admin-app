<script lang="ts" setup>
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useCheckinStore } from '@/store/checkin'

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

// 加载统计数据
onMounted(async () => {
  try {
    // 加载打卡记录列表
    await checkinStore.loadRecords()
    // 获取统计信息
    stats.value = await checkinStore.getStatistics()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})

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
    <!-- 头部背景 -->
    <view class="header-bg">
      <view class="header-content">
        <text class="app-title">💕 恋爱足迹</text>
        <text class="app-subtitle">记录我们的美好时光</text>
      </view>
    </view>

    <!-- 统计卡片 -->
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

    <!-- 快捷操作 -->
    <view class="actions-section">
      <view class="action-btn primary" @click="goToAddCheckin">
        <text class="action-icon">➕</text>
        <text class="action-text">发布打卡</text>
      </view>
      <view class="action-btn" @click="goToMap">
        <text class="action-icon">📍</text>
        <text class="action-text">查看地图</text>
      </view>
      <view class="action-btn" @click="goToList">
        <text class="action-icon">📝</text>
        <text class="action-text">打卡记录</text>
      </view>
    </view>

    <!-- 最新打卡 -->
    <view v-if="latestRecord" class="latest-section">
      <view class="section-title">
        <text>最新打卡</text>
        <text class="more-link" @click="goToList">查看全部 ›</text>
      </view>
      <view class="latest-card" @click="goToDetail(latestRecord.id)">
        <view v-if="latestRecord.images.length > 0" class="latest-image">
          <image :src="latestRecord.images[0]" mode="aspectFill" class="image" />
        </view>
        <view class="latest-content">
          <view class="latest-location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ latestRecord.address }}</text>
          </view>
          <view v-if="latestRecord.content" class="latest-text">
            {{ latestRecord.content }}
          </view>
          <view class="latest-time">
            {{ dayjs(latestRecord.createdAt || latestRecord.createTime).format('YYYY-MM-DD HH:mm') }}
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-section">
      <text class="empty-icon">💕</text>
      <text class="empty-text">还没有打卡记录</text>
      <text class="empty-tip">点击下方按钮开始记录吧~</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header-bg {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  padding: 60rpx 30rpx 80rpx;
  color: #fff;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;

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
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
  margin-top: -40rpx;
  margin-bottom: 30rpx;
}

.stats-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

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
</style>

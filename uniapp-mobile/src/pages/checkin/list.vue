<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCheckinStore } from '@/store/checkin'
import dayjs from 'dayjs'

definePage({
  style: {
    navigationBarTitleText: '打卡记录',
  },
})

const checkinStore = useCheckinStore()
const { records } = storeToRefs(checkinStore)

// 加载打卡记录
onMounted(async () => {
  try {
    await checkinStore.loadRecords()
  } catch (error) {
    console.error('加载打卡记录失败:', error)
  }
})

// 按日期分组的打卡记录
const groupedRecords = computed(() => {
  const groups: Record<string, typeof records.value> = {}
  
  records.value.forEach((record) => {
    const time = record.createdAt || record.createTime
    const date = dayjs(time).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(record)
  })

  // 转换为数组并按日期倒序排序
  return Object.entries(groups)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, items]) => ({
      date,
      dateText: formatDate(date),
      items: items.sort((a, b) => {
        const timeA = a.createdAt || a.createTime
        const timeB = b.createdAt || b.createTime
        return new Date(timeB).getTime() - new Date(timeA).getTime()
      }),
    }))
})

// 格式化日期显示
const formatDate = (date: string) => {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  
  if (date === today) {
    return '今天'
  } else if (date === yesterday) {
    return '昨天'
  } else if (dayjs(date).year() === dayjs().year()) {
    return dayjs(date).format('MM月DD日')
  } else {
    return dayjs(date).format('YYYY年MM月DD日')
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('HH:mm')
}

// 跳转到详情页
const goToDetail = (id: string | number) => {
  uni.navigateTo({
    url: `/pages/checkin/detail?id=${id}`,
  })
}

// 跳转到地图页
const goToMap = () => {
  uni.switchTab({
    url: '/pages/map/map',
  })
}
</script>

<template>
  <view class="list-container">
    <!-- 空状态 -->
    <view v-if="records.length === 0" class="empty-state">
      <text class="empty-icon">💕</text>
      <text class="empty-text">还没有打卡记录</text>
      <text class="empty-tip">快去记录你们的美好时光吧~</text>
      <button class="empty-btn" @click="goToMap">去打卡</button>
    </view>

    <!-- 打卡记录列表 -->
    <scroll-view v-else class="scroll-view" scroll-y>
      <view
        v-for="group in groupedRecords"
        :key="group.date"
        class="date-group"
      >
        <!-- 日期标题 -->
        <view class="date-header">
          <view class="date-line" />
          <text class="date-text">{{ group.dateText }}</text>
          <view class="date-line" />
        </view>

        <!-- 打卡记录 -->
        <view
          v-for="record in group.items"
          :key="record.id"
          class="record-item"
          @click="goToDetail(record.id)"
        >
          <!-- 时间轴 -->
          <view class="timeline">
            <view class="timeline-dot" />
            <view class="timeline-line" />
          </view>

          <!-- 内容区域 -->
          <view class="record-content">
            <!-- 时间 -->
            <view class="record-time">{{ formatTime(record.createdAt || record.createTime) }}</view>

            <!-- 位置 -->
            <view class="record-location">
              <text class="location-icon">📍</text>
              <text class="location-text">{{ record.address }}</text>
            </view>

            <!-- 文字内容 -->
            <view v-if="record.content" class="record-text">
              {{ record.content }}
            </view>

            <!-- 图片 -->
            <view v-if="record.images.length > 0" class="record-images">
              <image
                v-for="(image, index) in record.images.slice(0, 3)"
                :key="index"
                :src="image"
                mode="aspectFill"
                class="record-image"
              />
              <view v-if="record.images.length > 3" class="image-more">
                +{{ record.images.length - 3 }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.list-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
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
    margin-bottom: 60rpx;
  }

  .empty-btn {
    width: 240rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
    line-height: 80rpx;
  }
}

.scroll-view {
  height: 100vh;
}

.date-group {
  padding: 40rpx 30rpx;
}

.date-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .date-line {
    flex: 1;
    height: 1rpx;
    background: #e0e0e0;
  }

  .date-text {
    margin: 0 20rpx;
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
  }
}

.record-item {
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
}

.timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30rpx;

  .timeline-dot {
    width: 20rpx;
    height: 20rpx;
    background: #ff6b9d;
    border-radius: 50%;
    border: 4rpx solid #fff;
    box-shadow: 0 0 0 2rpx #ff6b9d;
    z-index: 1;
  }

  .timeline-line {
    width: 2rpx;
    flex: 1;
    background: #e0e0e0;
    margin-top: 10rpx;
  }
}

.record-item:last-child .timeline-line {
  display: none;
}

.record-content {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.record-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.record-location {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .location-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }

  .location-text {
    font-size: 28rpx;
    color: #666;
    flex: 1;
  }
}

.record-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-break: break-all;
}

.record-images {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  position: relative;
}

.record-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.image-more {
  width: 200rpx;
  height: 200rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>

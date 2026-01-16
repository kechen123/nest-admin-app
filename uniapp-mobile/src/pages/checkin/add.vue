<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { useCheckinStore } from '@/store/checkin'
import useUpload from '@/hooks/useUpload'

definePage({
  style: {
    navigationBarTitleText: '发布打卡',
  },
})

const checkinStore = useCheckinStore()

// 位置信息
const latitude = ref(0)
const longitude = ref(0)
const address = ref('正在获取位置...')

// 打卡内容
const content = ref('')

// 图片列表
const images = ref<string[]>([])

// 上传图片
const { loading: uploadLoading, run: uploadImage } = useUpload({
  fileType: 'image',
  maxSize: 5 * 1024 * 1024, // 5MB
  success: (res) => {
    // 如果上传成功，res 应该包含图片URL
    // 这里假设返回的是 { url: 'xxx' } 格式，根据实际API调整
    const imageUrl = typeof res === 'string' ? res : (res.url || res.data?.url || res)
    images.value.push(imageUrl)
    uni.showToast({
      title: '上传成功',
      icon: 'success',
    })
  },
  error: () => {
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    })
  },
})

// 选择图片（本地预览，不上传）
const chooseImage = () => {
  // #ifdef MP-WEIXIN
  uni.chooseMedia({
    count: 9 - images.value.length,
    mediaType: ['image'],
    success: (res) => {
      const tempFiles = res.tempFiles.map((file: any) => file.tempFilePath)
      images.value.push(...tempFiles)
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.chooseImage({
    count: 9 - images.value.length,
    success: (res) => {
      images.value.push(...res.tempFilePaths)
    },
  })
  // #endif
}

// 删除图片
const deleteImage = (index: number) => {
  images.value.splice(index, 1)
}

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: images.value,
    current: index,
  })
}

// 获取当前位置
const getCurrentLocation = () => {
  uni.showLoading({
    title: '获取位置中...',
  })
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      // 逆地理编码获取地址
      reverseGeocode(res.latitude, res.longitude)
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}

// 逆地理编码（获取地址）
const reverseGeocode = (lat: number, lng: number) => {
  // 使用腾讯地图API进行逆地理编码
  // #ifdef MP-WEIXIN
  // 微信小程序可以使用腾讯地图API
  // 需要在小程序后台配置 request 合法域名：https://apis.map.qq.com
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
        address.value = result.pois && result.pois.length > 0
          ? result.pois[0].title || result.address
          : (result.address || result.formatted_addresses?.recommend || '当前位置')
      } else {
        address.value = '当前位置'
      }
      uni.hideLoading()
    },
    fail: () => {
      // 如果API调用失败，使用默认名称
      address.value = '当前位置'
      uni.hideLoading()
    },
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非微信小程序，可以使用高德地图或百度地图API
  // 这里先使用默认名称
  address.value = '当前位置'
  uni.hideLoading()
  
  // 示例：使用高德地图API
  // uni.request({
  //   url: 'https://restapi.amap.com/v3/geocode/regeo',
  //   data: {
  //     location: `${lng},${lat}`, // 高德地图是经度在前
  //     key: 'YOUR_AMAP_KEY',
  //   },
  //   success: (res) => {
  //     if (res.data && res.data.status === '1') {
  //       address.value = res.data.regeocode.formatted_address || '当前位置'
  //     }
  //   },
  // })
  // #endif
}

// 选择位置（使用系统选择位置）
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      address.value = res.address || res.name || '已选择位置'
    },
    fail: () => {
      uni.showToast({
        title: '选择位置失败',
        icon: 'none',
      })
    },
  })
}

// 在地图上选择位置
const selectLocationOnMap = () => {
  uni.navigateTo({
    url: `/pages/checkin/select-location?lat=${latitude.value}&lng=${longitude.value}`,
  })
}

// 提交打卡
const submitCheckin = () => {
  if (!latitude.value || !longitude.value) {
    uni.showToast({
      title: '请选择位置',
      icon: 'none',
    })
    return
  }

  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入打卡内容',
      icon: 'none',
    })
    return
  }

  // 如果有本地图片，先上传（这里简化处理，实际应该上传所有图片）
  if (images.value.length > 0) {
    // 检查是否有本地临时路径（需要上传）
    const needUpload = images.value.some(img => img.startsWith('http://tmp/') || img.startsWith('file://'))
    if (needUpload) {
      uni.showToast({
        title: '请先上传图片',
        icon: 'none',
      })
      return
    }
  }

  try {
    uni.showLoading({ title: '提交中...' })
    // 保存打卡记录（调用后端API）
    await checkinStore.addRecord({
      latitude: latitude.value,
      longitude: longitude.value,
      address: address.value,
      content: content.value.trim(),
      images: images.value,
    })

    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('提交失败:', error)
  }
}

// 监听页面显示，接收从地图选择页面返回的位置信息
const onPageShow = () => {
  const app = getApp()
  if (app.globalData?.selectedLocation) {
    const { latitude: lat, longitude: lng, address: addr } = app.globalData.selectedLocation
    latitude.value = lat
    longitude.value = lng
    address.value = addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    // 清除全局数据
    delete app.globalData.selectedLocation
  }
}

onMounted(() => {
  getCurrentLocation()
})

// 使用 onShow 生命周期监听页面显示
onShow(() => {
  onPageShow()
})
</script>

<template>
  <view class="add-checkin-container">
    <!-- 位置选择 -->
    <view class="section">
      <view class="section-title">位置</view>
      <view class="location-box" @click="chooseLocation">
        <view class="location-info">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ address }}</text>
        </view>
        <text class="location-arrow">›</text>
      </view>
      <view class="location-btns">
        <view class="location-btn" @click="getCurrentLocation">
          <text>重新定位</text>
        </view>
        <view class="location-btn map-select" @click="selectLocationOnMap">
          <text>在地图上选择</text>
        </view>
      </view>
    </view>

    <!-- 打卡内容 -->
    <view class="section">
      <view class="section-title">打卡内容</view>
      <textarea
        v-model="content"
        class="content-input"
        placeholder="记录这一刻的美好..."
        maxlength="500"
        :show-confirm-bar="false"
      />
      <view class="char-count">{{ content.length }}/500</view>
    </view>

    <!-- 图片上传 -->
    <view class="section">
      <view class="section-title">照片</view>
      <view class="image-list">
        <view
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
          @click="previewImage(index)"
        >
          <image :src="image" mode="aspectFill" class="image" />
          <view class="image-delete" @click.stop="deleteImage(index)">×</view>
        </view>
        <view
          v-if="images.length < 9"
          class="image-item image-add"
          @click="chooseImage"
        >
          <text class="add-icon">+</text>
          <text class="add-text">添加照片</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" :disabled="uploadLoading" @click="submitCheckin">
        {{ uploadLoading ? '上传中...' : '发布打卡' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.add-checkin-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.section {
  background: #fff;
  margin-top: 20rpx;
  padding: 30rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.location-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  .location-info {
    display: flex;
    align-items: center;
    flex: 1;

    .location-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .location-text {
      font-size: 28rpx;
      color: #333;
      flex: 1;
    }
  }

  .location-arrow {
    font-size: 40rpx;
    color: #999;
  }
}

.location-btns {
  display: flex;
  gap: 20rpx;
}

.location-btn {
  flex: 1;
  padding: 12rpx 24rpx;
  background: #ff6b9d;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
  
  &.map-select {
    background: #fff;
    color: #ff6b9d;
    border: 2rpx solid #ff6b9d;
  }
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;

  .image {
    width: 100%;
    height: 100%;
  }

  .image-delete {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: #ff4757;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    line-height: 1;
  }

  &.image-add {
    background: #f8f8f8;
    border: 2rpx dashed #ddd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .add-icon {
      font-size: 60rpx;
      color: #999;
      line-height: 1;
    }

    .add-text {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;

  &[disabled] {
    opacity: 0.6;
  }
}
</style>

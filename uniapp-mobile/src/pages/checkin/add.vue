<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { useCheckinStore } from '@/store/checkin'
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils/index'

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

// 是否公开
const isPublic = ref(false)

// 图片列表（存储上传后的URL）
const images = ref<string[]>([])
// 上传中的图片索引
const uploadingIndexes = ref<Set<number>>(new Set())

// 上传单张图片
async function uploadSingleImage(tempFilePath: string, index: number) {
  uploadingIndexes.value.add(index)

  try {
    // 使用 uni.uploadFile 直接上传
    const tokenStore = useTokenStore()
    let token = tokenStore.validToken.value || ''

    if (!token && tokenStore.tryGetValidToken) {
      try {
        token = await tokenStore.tryGetValidToken()
      }
      catch (error) {
        console.error('获取token失败:', error)
      }
    }

    const header: Record<string, string> = {}
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    const baseUrl = getEnvBaseUrl()
    const uploadUrl = `${baseUrl}/upload/image/cos`

    await new Promise<void>((resolve, reject) => {
      uni.uploadFile({
        url: uploadUrl,
        filePath: tempFilePath,
        name: 'file',
        header,
        success: (uploadRes) => {
          try {
            let responseData = uploadRes.data
            if (typeof responseData === 'string') {
              try {
                responseData = JSON.parse(responseData)
              }
              catch (e) {
                console.log('Response is not JSON, using raw data:', responseData)
              }
            }

            // 后端返回格式: { code: 200, data: { url: '...', path: '...', ... }, msg: '...' }
            const result = responseData?.data || responseData
            // 使用后端返回的URL（优先使用url字段，如果没有则使用path）
            let imageUrl = result?.url || result?.path

            // 确保 imageUrl 是字符串类型
            if (typeof imageUrl !== 'string') {
              imageUrl = String(imageUrl)
            }

            if (imageUrl) {
              // 更新对应索引的图片URL
              images.value[index] = imageUrl
              resolve()
            }
            else {
              reject(new Error('上传响应中未找到图片URL'))
            }
          }
          catch (err) {
            console.error('解析上传响应失败:', err)
            reject(err)
          }
        },
        fail: (err) => {
          console.error('上传失败:', err)
          reject(err)
        },
      })
    })
  }
  catch (error: any) {
    console.error('上传图片失败:', error)
    uni.showToast({
      title: error?.message || '上传失败',
      icon: 'none',
    })
    // 上传失败，移除该图片
    images.value.splice(index, 1)
  }
  finally {
    uploadingIndexes.value.delete(index)
  }
}

// 检查文件大小（10MB = 10 * 1024 * 1024 字节）
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// 选择并上传图片
function chooseImage() {
  // #ifdef MP-WEIXIN
  uni.chooseMedia({
    count: 9 - images.value.length,
    mediaType: ['image'],
    success: async (res) => {
      const tempFiles = res.tempFiles
      const validFiles: any[] = []
      const invalidFiles: string[] = []

      // 检查文件大小
      for (const file of tempFiles) {
        if (file.size && file.size > MAX_IMAGE_SIZE) {
          invalidFiles.push(file.tempFilePath)
          uni.showToast({
            title: `图片大小不能超过10MB`,
            icon: 'none',
            duration: 2000,
          })
        }
        else {
          validFiles.push(file)
        }
      }

      if (validFiles.length === 0) {
        return
      }

      // 先添加占位符（使用临时路径用于预览）
      const startIndex = images.value.length
      validFiles.forEach((file: any) => {
        images.value.push(file.tempFilePath)
      })

      // 逐个上传图片
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const currentIndex = startIndex + i
        await uploadSingleImage(file.tempFilePath, currentIndex)
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.chooseImage({
    count: 9 - images.value.length,
    success: async (res) => {
      const tempFilePaths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
      const validPaths: string[] = []

      // 检查每个文件的大小
      for (const path of tempFilePaths) {
        try {
          const fileInfo = await new Promise<{ size: number }>((resolve, reject) => {
            uni.getFileInfo({
              filePath: path,
              success: res => resolve(res),
              fail: err => reject(err),
            })
          })

          if (fileInfo.size > MAX_IMAGE_SIZE) {
            uni.showToast({
              title: `图片大小不能超过10MB`,
              icon: 'none',
              duration: 2000,
            })
          }
          else {
            validPaths.push(path)
          }
        }
        catch (error) {
          console.error('获取文件信息失败:', error)
          // 如果获取文件信息失败，仍然允许上传（由后端验证）
          validPaths.push(path)
        }
      }

      if (validPaths.length === 0) {
        return
      }

      // 先添加占位符（使用临时路径用于预览）
      const startIndex = images.value.length
      validPaths.forEach((path: string) => {
        images.value.push(path)
      })

      // 逐个上传图片
      for (let i = 0; i < validPaths.length; i++) {
        const tempFilePath = validPaths[i]
        const currentIndex = startIndex + i
        await uploadSingleImage(tempFilePath, currentIndex)
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    },
  })
  // #endif
}

// 删除图片
function deleteImage(index: number) {
  images.value.splice(index, 1)
}

// 预览图片
function previewImage(index: number) {
  uni.previewImage({
    urls: images.value,
    current: index,
  })
}

// 获取当前位置
function getCurrentLocation() {
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
    fail: (err) => {
      uni.hideLoading()
      console.error('获取位置失败:', err)
      // 即使获取位置失败，也设置默认值，让页面可以正常使用
      if (!latitude.value || !longitude.value) {
        address.value = '请选择位置'
      }
      uni.showToast({
        title: '获取位置失败，请手动选择',
        icon: 'none',
        duration: 2000,
      })
    },
  })
}

// 逆地理编码（获取地址）
function reverseGeocode(lat: number, lng: number) {
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
      }
      else {
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

// 在地图上选择位置
function selectLocationOnMap() {
  uni.navigateTo({
    url: `/pages/checkin/select-location?lat=${latitude.value}&lng=${longitude.value}`,
  })
}

// 提交打卡
async function submitCheckin() {
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

  // 检查是否有图片正在上传中
  if (uploadingIndexes.value.size > 0) {
    uni.showToast({
      title: '图片上传中，请稍候...',
      icon: 'none',
    })
    return
  }

  // 检查是否有本地临时路径（未上传的图片）
  const needUpload = images.value.some((img) => {
    // 确保 img 是字符串类型
    if (typeof img !== 'string') {
      return false
    }
    return img.startsWith('http://tmp/')
      || img.startsWith('file://')
      || img.startsWith('blob:')
  })
  if (needUpload) {
    uni.showToast({
      title: '请等待图片上传完成',
      icon: 'none',
    })
    return
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
      isPublic: isPublic.value,
    })

    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    })

    // 发送事件通知首页刷新数据
    uni.$emit('checkin-published')

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  catch (error) {
    uni.hideLoading()
    console.error('提交失败:', error)
  }
}

// 监听页面显示，接收从地图选择页面返回的位置信息
function onPageShow() {
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
  <view class="moments-publish">
    <!-- 主体：文字 + 图片，类似朋友圈 -->
    <view class="publish-body">
      <textarea v-model="content" class="moment-textarea" placeholder="这一刻的想法..." :maxlength="500"
        :show-confirm-bar="false" />
      <view class="char-count">
        {{ content.length }}/500
      </view>

      <!-- 图片网格 3列 -->
      <view class="moment-images">
        <view v-for="(image, index) in images" :key="index" class="moment-image-item" @click="previewImage(index)">
          <image :src="image" mode="aspectFill" class="moment-img" />
          <view v-if="uploadingIndexes.has(index)" class="image-uploading">
            <text>上传中</text>
          </view>
          <view v-else class="image-delete" @click.stop="deleteImage(index)">
            <text class="delete-icon">×</text>
          </view>
        </view>
        <view v-if="images.length < 9" class="moment-image-item image-add" @click="chooseImage">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 底部选项栏：位置、谁可以看 -->
    <view class="moment-options">
      <view class="option-row" @click="selectLocationOnMap">
        <text class="option-icon">📍</text>
        <text class="option-text">{{ address }}</text>
        <text class="option-arrow">›</text>
      </view>
      <view class="option-row">
        <text class="option-icon">👁</text>
        <text class="option-text">公开</text>
        <switch :checked="isPublic" color="#ff6b9d" size="20" @change="(e: any) => isPublic = e.detail.value" />
      </view>
    </view>

    <!-- 发表按钮 -->
    <view class="publish-footer">
      <button class="publish-btn" :class="{ disabled: uploadingIndexes.size > 0 }" :disabled="uploadingIndexes.size > 0"
        @click="submitCheckin">
        发表
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.moments-publish {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

/* 主体：文字 + 图片，类似朋友圈 */
.publish-body {
  background: #fff;
  padding: 32rpx 32rpx 24rpx;
  margin-bottom: 24rpx;
}

.moment-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 0;
  font-size: 32rpx;
  line-height: 1.5;
  color: #333;
  background: transparent;
  box-sizing: border-box;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #b2b2b2;
  margin-top: 16rpx;
}

/* 图片网格 3列，类似朋友圈 */
.moment-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24rpx;
  gap: 16rpx;
}

.moment-image-item {
  width: 218rpx;
  height: 218rpx;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;

  .moment-img {
    width: 100%;
    height: 100%;
  }

  .image-delete {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    width: 44rpx;
    height: 44rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-icon {
    color: #fff;
    font-size: 36rpx;
    line-height: 1;
  }

  .image-uploading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      color: #fff;
      font-size: 24rpx;
    }
  }

  &.image-add {
    background: #f5f5f5;
    border: 2rpx dashed #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-icon {
    font-size: 64rpx;
    color: #c0c0c0;
    line-height: 1;
  }
}

/* 底部选项栏：位置、谁可以看 */
.moment-options {
  background: #fff;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.option-row {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .option-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
  }

  .option-text {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .option-arrow {
    font-size: 36rpx;
    color: #c0c0c0;
    margin-left: 8rpx;
  }
}

/* 发表按钮，粉色系 */
.publish-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.publish-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;

  &.disabled,
  &[disabled] {
    opacity: 0.6;
  }
}
</style>

/**
 * 地图定位相关 Composable
 */
import { ref } from 'vue'

const DEFAULT_LATITUDE = 39.908823 // 默认位置（北京）
const DEFAULT_LONGITUDE = 116.397470
const DEFAULT_SCALE = 13
const LOCATED_SCALE = 15 // 定位后的缩放级别

export function useMapLocation() {
  const mapLatitude = ref(DEFAULT_LATITUDE)
  const mapLongitude = ref(DEFAULT_LONGITUDE)
  const mapScale = ref(DEFAULT_SCALE)

  /**
   * 获取当前位置
   */
  function getCurrentLocation(): Promise<void> {
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
            mapScale.value = LOCATED_SCALE
            resolve()
          },
          fail: (err) => {
            console.warn('获取位置失败:', err)
            // 如果获取位置失败，使用默认位置
            mapLatitude.value = DEFAULT_LATITUDE
            mapLongitude.value = DEFAULT_LONGITUDE
            mapScale.value = DEFAULT_SCALE
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
          mapScale.value = LOCATED_SCALE
          resolve()
        },
        fail: (err) => {
          console.warn('获取位置失败，使用默认位置:', err)
          mapLatitude.value = DEFAULT_LATITUDE
          mapLongitude.value = DEFAULT_LONGITUDE
          mapScale.value = DEFAULT_SCALE
          resolve()
        },
      })
      // #endif
    })
  }

  /**
   * 更新地图中心位置
   */
  function updateMapCenter(latitude: number, longitude: number) {
    mapLatitude.value = latitude
    mapLongitude.value = longitude
  }

  return {
    mapLatitude,
    mapLongitude,
    mapScale,
    getCurrentLocation,
    updateMapCenter,
  }
}

<script lang="ts" setup>
import type { ICreateOrderParams, IOrderItem } from '@/api/mall'
import { createOrder } from '@/api/mall'

definePage({
  style: {
    navigationBarTitleText: '确认订单',
  },
})

// 订单商品列表
const orderItems = ref<IOrderItem[]>([])
const loading = ref(false)
const submitting = ref(false)

// 备注
const remark = ref('')

// 计算总价
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
})

// 格式化价格
function formatPrice(price: number | string) {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : Number(price)
  if (Number.isNaN(numPrice))
    return '¥0.00'
  return `¥${numPrice.toFixed(2)}`
}

// 提交订单
async function submitOrder() {
  if (orderItems.value.length === 0) {
    uni.showToast({
      title: '订单商品不能为空',
      icon: 'none',
    })
    return
  }

  submitting.value = true
  try {
    const params: ICreateOrderParams = {
      items: orderItems.value,
      remark: remark.value || undefined,
    }
    const result = await createOrder(params)
    uni.showToast({
      title: '订单提交成功',
      icon: 'success',
    })
    // 跳转到订单详情或订单列表
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  catch (error) {
    console.error('提交订单失败:', error)
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'error',
    })
  }
  finally {
    submitting.value = false
  }
}

onLoad((options) => {
  console.log(options)
  // 从页面参数中获取订单数据
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data)) as IOrderItem[]
      orderItems.value = Array.isArray(data) ? data : [data]
    }
    catch (error) {
      console.error('解析订单数据失败:', error)
      uni.showToast({
        title: '订单数据错误',
        icon: 'error',
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
  else {
    uni.showToast({
      title: '订单数据为空',
      icon: 'error',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-20">
    <!-- 有订单数据 -->
    <template v-if="orderItems.length > 0">
      <!-- 订单商品列表 -->
      <view class="bg-white">
        <view
          v-for="(item, index) in orderItems"
          :key="index"
          class="flex gap-3 border-b border-gray-100 p-4"
        >
          <!-- 商品图片 -->
          <image
            v-if="item.productImage"
            :src="item.productImage"
            mode="aspectFill"
            class="h-20 w-20 border border-gray-100 rounded"
          />
          <view v-else class="h-20 w-20 flex items-center justify-center border border-gray-100 rounded bg-gray-100">
            <text class="text-xs text-gray-400">无图</text>
          </view>

          <!-- 商品信息 -->
          <view class="flex-1">
            <text class="mb-1 block text-sm text-gray-800 leading-tight">
              {{ item.productName }}
            </text>
            <text
              v-if="item.specValues"
              class="mb-1 block text-xs text-gray-500"
            >
              规格：{{ item.specValues }}
            </text>
            <view class="mt-2 flex items-center justify-between">
              <text class="text-lg text-red-500 font-bold">
                {{ formatPrice(item.price) }}
              </text>
              <text class="text-sm text-gray-500">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="mt-2 bg-white px-4 py-3">
        <view class="mb-2 text-sm text-gray-700 font-medium">
          备注
        </view>
        <textarea
          v-model="remark"
          placeholder="选填，请输入备注信息"
          class="min-h-20 w-full border border-gray-200 rounded bg-gray-50 p-2 text-sm"
          maxlength="200"
        />
      </view>

      <!-- 订单汇总 -->
      <view class="mt-2 bg-white px-4 py-3">
        <view class="flex items-center justify-between">
          <text class="text-sm text-gray-700">商品合计</text>
          <text class="text-base text-gray-800 font-medium">
            {{ formatPrice(totalPrice) }}
          </text>
        </view>
      </view>

      <!-- 底部提交栏 -->
      <view
        class="safe-area-bottom fixed bottom-0 left-0 right-0 z-10 flex items-center border-t border-gray-200 bg-white px-4 py-3"
      >
        <view class="flex-1">
          <view class="text-xs text-gray-500">
            合计
          </view>
          <text class="text-xl text-red-500 font-bold">
            {{ formatPrice(totalPrice) }}
          </text>
        </view>
        <view
          class="flex items-center justify-center rounded-lg bg-red-500 px-8 py-2.5 text-white"
          :class="submitting ? 'opacity-50' : ''"
          @tap="submitOrder"
        >
          <text v-if="submitting" class="text-base font-medium">提交中...</text>
          <text v-else class="text-base font-medium">确认提交</text>
        </view>
      </view>
    </template>

    <!-- 无数据 -->
    <view v-else class="h-screen flex items-center justify-center">
      <view class="text-center">
        <text class="text-gray-400">订单数据为空</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

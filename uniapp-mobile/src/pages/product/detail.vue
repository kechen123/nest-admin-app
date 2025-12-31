<script lang="ts" setup>
import type { IOrderItem, IProductDetail } from '@/api/mall'
import { getProductDetail } from '@/api/mall'

definePage({
  style: {
    navigationBarTitleText: '商品详情',
  },
})

// 商品详情数据
const product = ref<IProductDetail | null>(null)
const loading = ref(false)

// 图片轮播相关
const imageCurrent = ref(0)
const images = computed(() => {
  if (!product.value)
    return []
  if (product.value.images && product.value.images.length > 0)
    return product.value.images
  if (product.value.mainImage)
    return [product.value.mainImage]
  return []
})

// 加载商品详情
async function loadProductDetail(productId: number) {
  if (!productId) {
    uni.showToast({
      title: '商品ID无效',
      icon: 'error',
    })
    return
  }

  loading.value = true
  try {
    const data = await getProductDetail(productId)
    product.value = data
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: product.value?.name || '',
    })
  }
  catch (error) {
    console.error('加载商品详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 图片轮播切换
function onImageChange(e: any) {
  imageCurrent.value = e.detail.current
}

// 格式化价格
function formatPrice(price: number | string) {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : Number(price)
  if (Number.isNaN(numPrice))
    return '¥0.00'
  return `¥${numPrice.toFixed(2)}`
}

// 格式化销量
function formatSales(sales: number | string) {
  const numSales = typeof sales === 'string' ? Number.parseInt(sales, 10) : Number(sales)
  if (Number.isNaN(numSales))
    return '0'
  if (numSales >= 10000)
    return `${(numSales / 10000).toFixed(1)}万+`
  if (numSales >= 1000)
    return `${(numSales / 1000).toFixed(1)}k+`
  return numSales.toString()
}

// 规格选择弹窗
const showSpecPopup = ref(false)
const selectedSpecs = ref<Record<string, string>>({}) // 选中的规格 {specName: specValue}，如 {"storage":"256GB","color":"雅川青"}
const quantity = ref(1)
const isConfirming = ref(false) // 防止多次点击

// 从 SKUs 中提取规格选项
const specOptions = computed(() => {
  if (!product.value || !product.value.skus || product.value.skus.length === 0)
    return {}

  const options: Record<string, string[]> = {}

  // 遍历所有 SKU，提取规格名称和值
  product.value.skus.forEach((sku) => {
    if (sku.specValues && typeof sku.specValues === 'object') {
      Object.keys(sku.specValues).forEach((specName) => {
        const specValue = sku.specValues[specName as keyof typeof sku.specValues] as string
        if (!options[specName]) {
          options[specName] = []
        }
        // 去重
        if (!options[specName].includes(specValue)) {
          options[specName].push(specValue)
        }
      })
    }
  })

  return options
})

// 计算当前选中的SKU
const currentSku = computed(() => {
  if (!product.value || !product.value.skus || product.value.skus.length === 0)
    return null

  // 如果没有规格选项，返回第一个SKU
  if (Object.keys(specOptions.value).length === 0) {
    return product.value.skus[0]
  }

  // 检查是否选择了所有规格
  const allSelected = Object.keys(specOptions.value).every(specName => selectedSpecs.value[specName])
  if (!allSelected) {
    return null
  }

  // 根据选中的规格查找对应的SKU
  return product.value.skus.find((sku) => {
    if (!sku.specValues || typeof sku.specValues !== 'object')
      return false

    // 检查所有选中的规格值是否匹配
    return Object.keys(selectedSpecs.value).every((specName) => {
      const selectedValue = selectedSpecs.value[specName]
      const skuValue = sku.specValues[specName as keyof typeof sku.specValues] as string
      return skuValue === selectedValue
    })
  }) || null
})

// 计算当前价格
const currentPrice = computed(() => {
  if (currentSku.value) {
    const price = currentSku.value.price
    return typeof price === 'string' ? Number.parseFloat(price) : price
  }
  const minPrice = product.value?.minPrice
  return typeof minPrice === 'string' ? Number.parseFloat(minPrice) : (minPrice || 0)
})

// 计算当前库存
const currentStock = computed(() => {
  if (currentSku.value)
    return currentSku.value.stock
  return product.value?.stock || 0
})

// 打开规格选择弹窗
function openSpecPopup() {
  if (!product.value)
    return

  // 如果没有SKU或规格选项，直接跳转到下单页面
  if (!product.value.skus || product.value.skus.length === 0 || Object.keys(specOptions.value).length === 0) {
    goToOrder()
    return
  }

  // 初始化选中的规格（选择每个规格的第一个选项）
  if (Object.keys(selectedSpecs.value).length === 0) {
    Object.keys(specOptions.value).forEach((specName) => {
      if (specOptions.value[specName].length > 0)
        selectedSpecs.value[specName] = specOptions.value[specName][0]
    })
  }

  showSpecPopup.value = true
}

// 选择规格
function selectSpec(specName: string, value: string) {
  selectedSpecs.value[specName] = value
  quantity.value = 1 // 切换规格时重置数量
}

// 确认选择，跳转到下单页面
function confirmSpec() {
  // 防止多次点击
  if (isConfirming.value)
    return

  if (!product.value)
    return

  // 检查是否选择了所有规格
  if (Object.keys(specOptions.value).length > 0) {
    const allSelected = Object.keys(specOptions.value).every(specName => selectedSpecs.value[specName])
    if (!allSelected) {
      uni.showToast({
        title: '请选择完整规格',
        icon: 'none',
      })
      return
    }

    if (!currentSku.value) {
      uni.showToast({
        title: '该规格暂无库存',
        icon: 'none',
      })
      return
    }
  }

  // 设置防重复点击标志
  isConfirming.value = true

  showSpecPopup.value = false
  goToOrder()

  // 延迟重置标志，防止快速连续点击
  setTimeout(() => {
    isConfirming.value = false
  }, 1000)
}

// 跳转到下单页面
function goToOrder() {
  if (!product.value)
    return

  // 如果没有SKU，使用第一个SKU或创建一个默认的
  let skuId = 0
  if (currentSku.value) {
    skuId = currentSku.value.id
  } else if (product.value.skus && product.value.skus.length > 0) {
    skuId = product.value.skus[0].id
  } else {
    uni.showToast({
      title: '商品规格不存在',
      icon: 'error',
    })
    return
  }

  // 构建规格显示字符串
  const specValueStr = Object.keys(selectedSpecs.value).length > 0
    ? Object.entries(selectedSpecs.value)
        .map(([name, value]) => `${name}:${value}`)
        .join(', ')
    : currentSku.value?.specName || undefined

  const orderItem: IOrderItem = {
    productId: product.value.id,
    skuId, // 添加 skuId
    productName: product.value.name,
    productImage: currentSku.value?.image || product.value.mainImage,
    specValues: specValueStr,
    price: currentPrice.value,
    quantity: quantity.value,
    totalPrice: currentPrice.value * quantity.value,
  }
  // 跳转到下单页面，传递订单数据
  uni.navigateTo({
    url: `/pages-fg/order/create?data=${encodeURIComponent(JSON.stringify([orderItem]))}`,
  })
}

onLoad((options) => {
  const productId = options.id ? Number.parseInt(options.id, 10) : -1
  loadProductDetail(productId)
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-20">
    <!-- 加载中 -->
    <view v-if="loading" class="h-screen flex items-center justify-center">
      <wd-loading />
    </view>

    <!-- 商品详情 -->
    <view v-else-if="product" class="flex flex-col">
      <!-- 商品图片轮播 -->
      <view v-if="images.length > 0" class="relative w-full bg-white">
        <swiper
          class="h-96 w-full"
          :indicator-dots="true"
          :autoplay="false"
          :circular="true"
          indicator-color="rgba(0,0,0,0.3)"
          indicator-active-color="#d14328"
          @change="onImageChange"
        >
          <swiper-item
            v-for="(image, index) in images"
            :key="index"
            class="flex items-center justify-center"
          >
            <wd-img :src="image" mode="aspectFit" class="h-full w-full" />
          </swiper-item>
        </swiper>
        <!-- 图片索引 -->
        <view
          v-if="images.length > 1"
          class="absolute right-4 top-4 rounded-full bg-black/30 px-2 py-1 text-xs text-white"
        >
          {{ imageCurrent + 1 }}/{{ images.length }}
        </view>
      </view>
      <view v-else class="h-96 w-full flex items-center justify-center bg-gray-100">
        <text class="text-gray-400">暂无图片</text>
      </view>

      <!-- 商品基本信息 -->
      <view class="bg-white px-4 py-4">
        <!-- 价格和标签 -->
        <view class="mb-3 flex items-baseline gap-2">
          <text class="text-2xl text-red-500 font-bold">
            {{ formatPrice(product.minPrice) }}
          </text>
          <text
            v-if="product.maxPrice > product.minPrice"
            class="text-sm text-gray-400 line-through"
          >
            {{ formatPrice(product.maxPrice) }}
          </text>
          <view
            v-if="product.isNew"
            class="ml-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white"
          >
            新品
          </view>
        </view>

        <!-- 商品名称 -->
        <view class="mb-3">
          <text class="text-lg text-gray-800 font-medium leading-tight">
            {{ product.name }}
          </text>
          <text
            v-if="product.subtitle"
            class="mt-1 block text-sm text-gray-500"
          >
            {{ product.subtitle }}
          </text>
        </view>

        <!-- 销量和库存 -->
        <view class="flex items-center gap-4 text-sm text-gray-500">
          <view class="flex items-center gap-1">
            <text>已售</text>
            <text class="text-red-500">{{ formatSales(product.sales) }}</text>
          </view>
          <view class="flex items-center gap-1">
            <text>库存</text>
            <text :class="product.stock > 0 ? 'text-gray-700' : 'text-red-500'">
              {{ product.stock }}
            </text>
          </view>
        </view>
      </view>

      <!-- 商品详情 -->
      <view v-if="product.detail || product.detailHtml" class="mt-2 bg-white px-4 py-4">
        <view class="mb-3 flex items-center gap-2">
          <view class="h-5 w-1 rounded-full bg-red-500" />
          <text class="text-lg text-gray-800 font-bold">商品详情</text>
        </view>

        <!-- HTML 详情 -->
        <view class="product-detail-html">
          <rich-text v-if="product.detailHtml" :nodes="product.detailHtml" />
          <rich-text v-else-if="product.detail" :nodes="product.detail" />
        </view>
      </view>
    </view>

    <!-- 无数据 -->
    <view v-else class="h-screen flex items-center justify-center">
      <view class="text-center">
        <text class="text-gray-400">商品不存在</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view
      v-if="product"
      class="safe-area-bottom fixed bottom-0 left-0 right-0 z-10 flex items-center border-t border-gray-200 bg-white px-4 py-3"
    >
      <view
        class="w-full flex items-center justify-center rounded-lg bg-red-500 py-2.5 text-white"
        @tap="openSpecPopup"
      >
        <text class="text-base font-medium">下单</text>
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <wd-popup
      v-model="showSpecPopup"
      position="bottom"
      :close-on-click-overlay="true"
    >
      <view v-if="product" class="max-h-[80vh] overflow-y-auto bg-white">
        <!-- 商品信息 -->
        <view class="flex gap-3 border-b border-gray-100 p-4">
          <wd-img
            :src="currentSku?.image || product.mainImage || ''"
            mode="aspectFill"
            class="h-20 w-20 border border-gray-100 rounded"
          />
          <view class="flex-1">
            <view class="mb-1 flex items-baseline gap-2">
              <text class="text-lg text-red-500 font-bold">
                {{ formatPrice(currentPrice) }}
              </text>
              <text v-if="product.maxPrice > product.minPrice" class="text-xs text-gray-400 line-through">
                {{ formatPrice(product.maxPrice) }}
              </text>
            </view>
            <text class="text-xs text-gray-500">库存：{{ currentStock }}</text>
          </view>
        </view>

        <!-- 规格选择 -->
        <view v-if="Object.keys(specOptions).length > 0" class="p-4">
          <view
            v-for="(values, specName) in specOptions"
            :key="specName"
            class="mb-4"
          >
            <view class="mb-2 text-sm text-gray-700 font-medium">
              {{ specName }}
            </view>
            <view class="flex flex-wrap gap-2">
              <view
                v-for="value in values"
                :key="value"
                class="border rounded px-3 py-1.5 text-sm transition-colors"
                :class="selectedSpecs[specName] === value
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-200 bg-white text-gray-700'"
                @tap="selectSpec(specName, value)"
              >
                {{ value }}
              </view>
            </view>
          </view>
        </view>

        <!-- 数量选择 -->
        <view class="flex items-center justify-between border-t border-gray-100 p-4">
          <text class="text-sm text-gray-700 font-medium">数量</text>
          <wd-input-number
            v-model="quantity"
            :min="1"
            :max="currentStock"
            :disabled="currentStock === 0"
          />
        </view>

        <!-- 确认按钮 -->
        <view class="safe-area-bottom border-t border-gray-100 bg-white p-4">
          <wd-button
            type="primary"
            :disabled="currentStock === 0 || isConfirming"
            :loading="isConfirming"
            block
            @click="confirmSpec"
          >
            {{ isConfirming ? '处理中...' : '确认' }}
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.product-detail-html {
  word-break: break-all;
}

/* .product-detail-html :deep(img) {
  max-width: 100%;
  height: auto;
} */

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

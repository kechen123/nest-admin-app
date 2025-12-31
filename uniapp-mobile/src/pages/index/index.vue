<script lang="ts" setup>
import type { IBanner, ICategory, IProduct } from '@/api/mall'
import { getBanners, getCategories, getRecommendProducts } from '@/api/mall'

defineOptions({
  name: 'Home',
})
definePage({
  type: 'home',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '首页',
  },
})

// z-paging 引用
const zPagingRef = ref()

// 轮播图数据
const banners = ref<IBanner[]>([])
const bannerCurrent = ref(0)

// 商品分类数据
const categories = ref<ICategory[]>([])

// 商品列表数据（z-paging 会自动管理）
const products = ref<IProduct[]>([])

// 加载轮播图
async function loadBanners() {
  try {
    const data = await getBanners()
    banners.value = data || []
  }
  catch (error) {
    console.error('加载轮播图失败:', error)
  }
}

// 加载商品分类
async function loadCategories() {
  try {
    const data = await getCategories()
    categories.value = data || []
  }
  catch (error) {
    console.error('加载商品分类失败:', error)
  }
}

// z-paging 查询事件（下拉刷新和加载更多都会触发）
async function onQuery(pageNo: number, pageSize: number) {
  try {
    const data = await getRecommendProducts(pageNo, pageSize)
    // 将数据传递给 z-paging
    zPagingRef.value?.complete(data.items || [])
  }
  catch (error) {
    console.error('加载商品列表失败:', error)
    // 加载失败，通知 z-paging
    zPagingRef.value?.complete(false)
  }
}

// 轮播图切换
function onBannerChange(e: any) {
  bannerCurrent.value = e.detail.current
}

// 轮播图点击
function onBannerClick(banner: IBanner) {
  if (banner.linkType === 1 && banner.linkValue) {
    // 跳转到商品详情
    uni.navigateTo({
      url: `/pages/product/detail?id=${banner.linkValue}`,
    })
  }
  else if (banner.linkType === 2 && banner.linkValue) {
    // 跳转到分类页面
    uni.navigateTo({
      url: `/pages/product/list?categoryId=${banner.linkValue}`,
    })
  }
  else if (banner.linkType === 3 && banner.linkValue) {
    // 跳转到外部链接
    // #ifdef H5
    window.open(banner.linkValue)
    // #endif
    // #ifndef H5
    uni.showToast({
      title: '暂不支持跳转',
      icon: 'none',
    })
    // #endif
  }
}

// 分类点击
function onCategoryClick(category: ICategory) {
  uni.navigateTo({
    url: `/pages/product/list?categoryId=${category.id}`,
  })
}

// 商品点击
function onProductClick(product: IProduct) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${product.id}`,
  })
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

// 更多点击
function handleMoreClick() {
  uni.navigateTo({
    url: '/pages/product/list',
  })
}

onLoad(() => {
  loadBanners()
  loadCategories()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <z-paging
      ref="zPagingRef" v-model="products" :auto="true" :refresher-enabled="true" :loading-more-enabled="true"
      :default-page-size="10" @query="onQuery"
    >
      <!-- 轮播图 -->
      <view v-if="banners.length > 0" class="bg-white">
        <swiper
          class="h-48 w-full" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500"
          :circular="true" indicator-color="rgba(0,0,0,0.3)" indicator-active-color="#d14328" @change="onBannerChange"
        >
          <swiper-item
            v-for="banner in banners" :key="banner.id" class="flex items-center justify-center"
            @tap="onBannerClick(banner)"
          >
            <wd-img :src="banner.image" mode="aspectFill" class="h-full w-full" />
          </swiper-item>
        </swiper>
      </view>
      <!-- 商品分类 -->
      <view v-if="categories.length > 0" class="mt-2 bg-white px-4 py-5">
        <scroll-view class="w-full" scroll-x :show-scrollbar="false">
          <view class="flex gap-6">
            <view
              v-for="category in categories" :key="category.id"
              class="flex flex-shrink-0 flex-col items-center gap-2" @tap="onCategoryClick(category)"
            >
              <view class="category-icon flex items-center justify-center overflow-hidden rounded-full bg-gray-50">
                <wd-img :src="category.icon" mode="aspectFit" class="h-14 w-14" />
              </view>

              <text class="text-xs text-gray-700 font-medium">{{ category.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 推荐商品标题 -->
      <view class="mt-2 bg-white px-4 py-4">
        <view class="mb-4 flex items-center justify-between">
          <view class="flex items-center gap-2">
            <view class="h-5 w-1 rounded-full bg-red-500" />
            <text class="text-lg text-gray-800 font-bold">推荐商品</text>
          </view>
          <view class="flex items-center text-sm text-gray-500" @tap="handleMoreClick">
            <text>更多</text>
            <wd-icon name="arrow-right" size="18px" color="#999" />
          </view>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="px-4 pb-4">
        <view class="grid grid-cols-2 gap-4">
          <view
            v-for="product in products" :key="product.id"
            class="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm" @tap="onProductClick(product)"
          >
            <!-- 商品图片 -->
            <view class="relative h-40 w-full bg-gray-100">
              <wd-img v-if="product.mainImage" :src="product.mainImage" mode="aspectFill" class="h-full w-full" />
              <view v-else class="h-full w-full flex items-center justify-center text-gray-400">
                <text>暂无图片</text>
              </view>
              <!-- 新品标签 -->
              <view v-if="product.isNew" class="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white">
                新品
              </view>
            </view>

            <!-- 商品信息 -->
            <view class="flex flex-col gap-1.5 p-3">
              <text class="line-clamp-2 text-sm text-gray-800 leading-tight">{{ product.name }}</text>
              <text v-if="product.subtitle" class="line-clamp-1 text-xs text-gray-500">
                {{ product.subtitle }}
              </text>
              <view class="mt-1">
                <view class="flex items-baseline gap-1.5">
                  <text class="text-lg text-red-500 font-bold">
                    {{ formatPrice(product.minPrice) }}
                  </text>
                </view>
                <view class="mt-1 flex items-center justify-end gap-1">
                  <text class="text-xs text-gray-400 leading-none">
                    库存{{ product.stock }}
                  </text>

                  <text class="text-xs text-gray-400 leading-none">
                    已售{{ formatSales(product.sales) }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-icon {
  height: 4.5rem;
  width: 4.5rem;
}
</style>

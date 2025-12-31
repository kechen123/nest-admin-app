<script lang="ts" setup>
import type { ICategory, IProduct, IProductQuery } from '@/api/mall'
// eslint-disable-next-line import/order
import { useQueue } from 'wot-design-uni'
import { getCategories, getProducts } from '@/api/mall'

definePage({
  style: {
    navigationBarTitleText: '商品列表',
  },
})

// 获取页面参数
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const options = currentPage.options || {}
const categoryId = options.categoryId ? Number.parseInt(options.categoryId, 10) : undefined

// z-paging 引用
const zPagingRef = ref()

// 使用 useQueue 处理点击外部关闭
const { closeOutside } = useQueue()

// 商品分类数据（扩展接口以支持二级分类）
interface ICategoryWithChildren extends ICategory {
  children?: ICategory[]
}
const categories = ref<ICategoryWithChildren[]>([])
// DropMenu 需要 number 类型，0 表示全部
const selectedCategoryId = ref<number>(categoryId || 0)

// 商品列表数据
const products = ref<IProduct[]>([])

// 排序相关
type SortType = 'sales' | 'price' | 'time'
type SortOrder = 'asc' | 'desc'
const sortBy = ref<SortType>('time')
const sortOrder = ref<SortOrder>('desc')

// SortButton 的排序状态：0-默认，1-升序，2-降序
const sortTime = ref(0) // 综合排序
const sortSales = ref(0) // 销量排序
const sortPrice = ref(0) // 价格排序

// 加载商品分类
async function loadCategories() {
  try {
    const data = await getCategories()
    categories.value = (data || []) as ICategoryWithChildren[]
  }
  catch (error) {
    console.error('加载商品分类失败:', error)
  }
}

// 将分类数据转换为 DropMenu 需要的格式
const categoryOptions = computed(() => {
  const options: Array<{ label: string, value: number, tip?: string }> = []
  // 添加"全部"选项
  options.push({ label: '全部', value: 0 })
  // 遍历一级分类
  categories.value.forEach((category) => {
    // 添加一级分类
    options.push({ label: category.name, value: category.id })
    // 如果有二级分类，添加二级分类
    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => {
        options.push({
          label: `  └─ ${child.name}`, // 使用树形符号和缩进
          value: child.id,
          // tip: `属于：${category.name}`, // 在 tip 中显示父级分类
        })
      })
    }
  })
  return options
})

// 获取当前选中的分类名称（显示完整路径，让用户清楚知道选择的分类）
const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 0)
    return '分类'
  // 查找一级分类
  for (const category of categories.value) {
    if (category.id === selectedCategoryId.value)
      return category.name
    // 查找二级分类
    if (category.children) {
      const child = category.children.find(c => c.id === selectedCategoryId.value)
      if (child)
        return `${category.name} > ${child.name}` // 显示完整路径
    }
  }
  return '分类'
})

// z-paging 查询事件
async function onQuery(pageNo: number, pageSize: number) {
  try {
    const query: IProductQuery = {
      page: pageNo,
      pageSize,
      categoryId: selectedCategoryId.value === 0 ? undefined : selectedCategoryId.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    }
    const data = await getProducts(query)
    zPagingRef.value?.complete(data.items || [])
  }
  catch (error) {
    console.error('加载商品列表失败:', error)
    zPagingRef.value?.complete(false)
  }
}

// 分类选择变化
function onCategoryChange(event: { value: number }) {
  selectedCategoryId.value = event.value
  // 重新加载数据
  zPagingRef.value?.reload()
}

// 综合排序变化
function onSortTimeChange(event: { value: number }) {
  sortTime.value = event.value
  sortSales.value = 0
  sortPrice.value = 0
  sortBy.value = 'time'
  sortOrder.value = event.value === 1 ? 'asc' : 'desc'
  zPagingRef.value?.reload()
}

// 销量排序变化
function onSortSalesChange(event: { value: number }) {
  sortTime.value = 0
  sortSales.value = event.value
  sortPrice.value = 0
  sortBy.value = 'sales'
  sortOrder.value = event.value === 1 ? 'asc' : 'desc'
  zPagingRef.value?.reload()
}

// 价格排序变化
function onSortPriceChange(event: { value: number }) {
  sortTime.value = 0
  sortSales.value = 0
  sortPrice.value = event.value
  sortBy.value = 'price'
  sortOrder.value = event.value === 1 ? 'asc' : 'desc'
  zPagingRef.value?.reload()
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

onLoad(() => {
  loadCategories()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <z-paging
      ref="zPagingRef"
      v-model="products"
      :auto="true"
      :refresher-enabled="true"
      :loading-more-enabled="true"
      :default-page-size="10"
      @query="onQuery"
    >
      <!-- 顶部内容：分类筛选和排序 -->
      <template #top>
        <!-- 排序栏 -->
        <view class="border-t border-gray-100 bg-white px-4" @click="closeOutside">
          <view class="flex items-center">
            <!-- 综合排序 -->
            <view class="flex-1">
              <wd-sort-button v-model="sortTime" title="综合" @change="onSortTimeChange" />
            </view>
            <!-- 销量排序 -->
            <view class="flex-1 border-l border-gray-100">
              <wd-sort-button
                v-model="sortSales"
                title="销量"
                @change="onSortSalesChange"
              />
            </view>
            <!-- 价格排序 -->
            <view class="flex-1 border-l border-gray-100">
              <wd-sort-button v-model="sortPrice" title="价格" @change="onSortPriceChange" />
            </view>
            <!-- 分类下拉菜单 -->
            <view class="flex-1 border-l border-gray-100">
              <wd-drop-menu>
                <wd-drop-menu-item
                  v-model="selectedCategoryId"
                  :options="categoryOptions"
                  :title="selectedCategoryName"
                  @change="onCategoryChange"
                />
              </wd-drop-menu>
            </view>
          </view>
        </view>
      </template>

      <!-- 商品列表 -->
      <view class="px-4 pb-4">
        <view class="grid grid-cols-2 gap-4">
          <view
            v-for="product in products"
            :key="product.id"
            class="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm"
            @tap="onProductClick(product)"
          >
            <!-- 商品图片 -->
            <view class="relative h-40 w-full bg-gray-100">
              <wd-img
                v-if="product.mainImage"
                :src="product.mainImage"
                mode="aspectFill"
                class="h-full w-full"
              />
              <view v-else class="h-full w-full flex items-center justify-center text-gray-400">
                <text>暂无图片</text>
              </view>
              <!-- 新品标签 -->
              <view
                v-if="product.isNew"
                class="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white"
              >
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
                  <text v-if="product.maxPrice > product.minPrice" class="text-xs text-gray-400 line-through">
                    {{ formatPrice(product.maxPrice) }}
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
</style>

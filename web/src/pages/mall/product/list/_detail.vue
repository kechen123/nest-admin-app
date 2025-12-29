<template>
  <div class="detail-container">
    <div class="content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
          </KcForm>
        </el-tab-pane>
        <el-tab-pane label="商品规格" name="skus" v-if="formData.id || type === 'create'">
          <div class="sku-container">
            <div class="sku-header">
              <el-button type="primary" @click="handleAddSku">
                <el-icon>
                  <Plus />
                </el-icon>
                新增规格
              </el-button>
              <el-button @click="loadSkus" :loading="loadingSkus">
                <el-icon>
                  <Refresh />
                </el-icon>
                刷新
              </el-button>
            </div>
            <el-table :data="skuList" border stripe v-loading="loadingSkus" style="margin-top: 16px;">
              <el-table-column prop="skuCode" label="SKU编码" width="200" />
              <el-table-column prop="specName" label="规格名称" width="200" />
              <el-table-column prop="price" label="价格" width="120">
                <template #default="{ row }">
                  ¥{{ row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="originalPrice" label="原价" width="120">
                <template #default="{ row }">
                  {{ row.originalPrice ? `¥${row.originalPrice}` : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="100" align="center" />
              <el-table-column prop="sales" label="销量" width="100" align="center" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEditSku(row)">编辑</el-button>
                  <el-button type="warning" link size="small" @click="handleToggleSkuStatus(row)">
                    {{ row.status === 1 ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteSku(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="onSubmit(formData)" v-if="type !== 'view' && activeTab === 'basic'">
          {{ formData.id ? '保存' : '创建' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productApi, type Product, type CreateProductDto, type UpdateProductDto } from '@/api/mall/product'
import { productSkuApi, type ProductSku } from '@/api/mall/product-sku'
import { categoryApi } from '@/api/mall/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')
const router = useRouter()

const formData = ref<Partial<Product & CreateProductDto>>({
  name: '',
  subtitle: '',
  categoryId: 0,
  mainImage: '',
  detail: '',
  sortOrder: 0,
  isRecommend: 0,
  isNew: 0,
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()
const activeTab = ref('basic')
const skuList = ref<ProductSku[]>([])
const loadingSkus = ref(false)

// 分类选项
const categoryOptions = ref<any[]>([])

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await categoryApi.getCategoryTree()
    const buildOptions = (categories: any[]): any[] => {
      const options: any[] = []
      categories.forEach(cat => {
        options.push({ label: cat.name, value: cat.id })
        if (cat.children && cat.children.length > 0) {
          buildOptions(cat.children).forEach(child => {
            options.push({ label: `  └─ ${child.label}`, value: child.value })
          })
        }
      })
      return options
    }
    categoryOptions.value = buildOptions(res as any)
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'name',
      label: '商品名称',
      type: 'input' as const,
      placeholder: '请输入商品名称',
      rules: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'subtitle',
      label: '商品副标题',
      type: 'input' as const,
      placeholder: '请输入商品副标题',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'categoryId',
      label: '分类',
      type: 'select' as const,
      placeholder: '请选择分类',
      options: categoryOptions.value,
      rules: [{ required: true, message: '请选择分类', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'mainImage',
      label: '商品主图',
      type: 'imageUpload' as const,
      limit: 5,
      width: '100%',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'sortOrder',
      label: '排序值',
      type: 'inputNumber' as const,
      placeholder: '请输入排序值',
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
      },
    },
    {
      key: 'isRecommend',
      label: '是否推荐',
      type: 'select' as const,
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ],
      placeholder: '请选择',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'isNew',
      label: '是否新品',
      type: 'select' as const,
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ],
      placeholder: '请选择',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '下架', value: 0 },
        { label: '上架', value: 1 },
      ],
      placeholder: '请选择状态',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'detail',
      label: '商品详情',
      type: 'textarea' as const,
      placeholder: '请输入商品详情（富文本）',
      width: '100%',
      rows: 6,
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  },
  labelWidth: '100px',
  fieldWidth: 350,
}))

// 加载规格列表
const loadSkus = async () => {
  if (!formData.value.id) {
    skuList.value = []
    return
  }

  try {
    loadingSkus.value = true
    const res = await productSkuApi.getSkusByProductId(formData.value.id)
    skuList.value = res as any as ProductSku[]
  } catch (error: any) {
    ElMessage.error(error.message || '加载规格列表失败')
    skuList.value = []
  } finally {
    loadingSkus.value = false
  }
}

// 新增规格
const handleAddSku = () => {
  if (!formData.value.id) {
    ElMessage.warning('请先保存商品信息')
    return
  }

  // 关闭当前面板并跳转到规格管理页面
  close?.()
  // 使用 nextTick 确保面板关闭后再跳转
  nextTick(() => {
    console.log(11111)
    router.push({
      path: '/mall/product/sku/',
      query: { productId: formData.value.id }
    })
  })
}

// 编辑规格
const handleEditSku = (row: ProductSku) => {
  // 关闭当前面板并跳转到规格管理页面
  close?.()
  // 使用 nextTick 确保面板关闭后再跳转
  nextTick(() => {
    router.push({
      path: '/mall/product/sku',
      query: { productId: formData.value.id, skuId: row.id }
    })
  })
}

// 切换规格状态
const handleToggleSkuStatus = async (row: ProductSku) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${statusText}该规格吗？`, '提示', {
      type: 'warning',
    })
    await productSkuApi.updateSkuStatus(row.id, newStatus)
    ElMessage.success(`${statusText}成功`)
    await loadSkus()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 删除规格
const handleDeleteSku = async (row: ProductSku) => {
  try {
    await ElMessageBox.confirm('确定要删除该规格吗？', '提示', {
      type: 'warning',
    })
    await productSkuApi.deleteSku(row.id)
    ElMessage.success('删除成功')
    await loadSkus()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...rest } = data

    if (data.id) {
      // 更新商品
      const updateData: UpdateProductDto = {
        name: data.name,
        subtitle: data.subtitle,
        categoryId: data.categoryId,
        mainImage: data.mainImage,
        detail: data.detail,
        sortOrder: data.sortOrder ?? 0,
        isRecommend: data.isRecommend ?? 0,
        isNew: data.isNew ?? 0,
        status: data.status !== undefined ? data.status : 1,
      }
      await productApi.updateProduct(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建商品
      const createData: CreateProductDto = {
        name: data.name,
        subtitle: data.subtitle,
        categoryId: data.categoryId,
        mainImage: data.mainImage,
        detail: data.detail,
        sortOrder: data.sortOrder ?? 0,
        isRecommend: data.isRecommend ?? 0,
        isNew: data.isNew ?? 0,
        status: data.status !== undefined ? data.status : 1,
        skus: data.skus || [],
      }
      const res = await productApi.createProduct(createData)
      ElMessage.success('创建成功')
      // 创建成功后，更新formData的id，以便可以管理规格
      if (res && (res as any).id) {
        formData.value.id = (res as any).id
      }
    }

    // 如果创建成功，加载规格列表
    if (formData.value.id) {
      await loadSkus()
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    name: '',
    subtitle: '',
    categoryId: 0,
    mainImage: '',
    detail: '',
    sortOrder: 0,
    isRecommend: 0,
    isNew: 0,
    status: 1,
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'create')
  activeTab.value = 'basic'

  await loadCategories()

  if (id) {
    try {
      const res = await productApi.getProductById(id)
      const product = res as any as Product

      formData.value = {
        ...product,
        categoryId: product.categoryId,
        sortOrder: product.sortOrder ?? 0,
        isRecommend: product.isRecommend ?? 0,
        isNew: product.isNew ?? 0,
        status: product.status !== undefined ? product.status : 1,
      }

      // 加载规格列表
      await loadSkus()
    } catch (error: any) {
      ElMessage.error(error.message || '加载商品信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      name: '',
      subtitle: '',
      categoryId: 0,
      mainImage: '',
      detail: '',
      sortOrder: 0,
      isRecommend: 0,
      isNew: 0,
      status: 1,
    }
    skuList.value = []
  }
}

defineExpose({ init })
</script>

<style scoped lang="less">
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content {
  flex: 1;
  overflow: auto;

  :deep(.el-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;

    .el-tabs__content {
      flex: 1;
      overflow: auto;
    }
  }
}

.sku-container {
  padding: 16px;

  .sku-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: flex-start;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

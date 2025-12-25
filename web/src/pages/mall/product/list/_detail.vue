<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
      </KcForm>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="onSubmit(formData)" v-if="type !== 'view'">
          {{ formData.id ? '保存' : '创建' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productApi, type Product, type CreateProductDto, type UpdateProductDto } from '@/api/mall/product'
import { categoryApi } from '@/api/mall/category'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

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
      width: 240,
      rules: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'subtitle',
      label: '商品副标题',
      type: 'input' as const,
      placeholder: '请输入商品副标题',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'categoryId',
      label: '分类',
      type: 'select' as const,
      placeholder: '请选择分类',
      width: 240,
      options: categoryOptions.value,
      rules: [{ required: true, message: '请选择分类', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'mainImage',
      label: '商品主图',
      type: 'input' as const,
      placeholder: '请输入商品主图URL',
      width: '100%',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'sortOrder',
      label: '排序值',
      type: 'input-number' as const,
      placeholder: '请输入排序值',
      width: 240,
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
      width: 240,
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
      width: 240,
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
      width: 240,
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
  fieldWidth: 250,
}))

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
      }
      await productApi.createProduct(createData)
      ElMessage.success('创建成功')
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


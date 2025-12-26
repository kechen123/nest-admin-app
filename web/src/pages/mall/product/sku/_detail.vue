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
import { productSkuApi, type ProductSku, type CreateProductSkuDto, type UpdateProductSkuDto } from '@/api/mall/product-sku'
import { productApi } from '@/api/mall/product'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<ProductSku & CreateProductSkuDto>>({
  productId: 0,
  skuCode: '',
  specName: '',
  specValues: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  image: '',
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()
const defaultProductId = ref<number | undefined>()

// 商品选项
const productOptions = ref<any[]>([])

// 加载商品数据（只在没有固定商品ID时加载）
const loadProducts = async () => {
  // 如果已经传入了商品ID，不需要加载商品列表
  if (defaultProductId.value) {
    // 只加载当前商品的信息用于显示
    try {
      const res = await productApi.getProductById(defaultProductId.value)
      productOptions.value = [{
        label: (res as any).name,
        value: (res as any).id
      }]
    } catch (error) {
      console.error('加载商品数据失败:', error)
    }
    return
  }

  // 如果没有固定商品ID，加载商品列表供选择
  try {
    const res = await productApi.getProductList({ page: 1, pageSize: 100 }) as any
    productOptions.value = (res.list || []).map((p: any) => ({
      label: p.name,
      value: p.id
    }))
  } catch (error) {
    console.error('加载商品数据失败:', error)
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'productId',
      label: '商品',
      type: 'select' as const,
      placeholder: '请选择商品',
      options: productOptions.value,
      rules: [{ required: true, message: '请选择商品', trigger: 'change' }],
      disabled: computed(() => type.value === 'view' || !!defaultProductId.value),
    },
    {
      key: 'skuCode',
      label: 'SKU编码',
      type: 'input' as const,
      placeholder: '请输入SKU编码，如：IPHONE15PM-256-BLACK',
      rules: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'specName',
      label: '规格名称',
      type: 'input' as const,
      placeholder: '请输入规格名称，如：256GB 深空黑色',
      rules: [{ required: true, message: '请输入规格名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'specValues',
      label: '规格值（JSON）',
      type: 'textarea' as const,
      placeholder: '请输入规格值（JSON格式），如：{"storage":"256GB","color":"深空黑色"}',
      rules: [
        { required: true, message: '请输入规格值', trigger: 'blur' },
        {
          validator: (rule: any, value: string, callback: any) => {
            if (value) {
              try {
                JSON.parse(value)
                callback()
              } catch {
                callback(new Error('规格值必须是有效的JSON格式'))
              }
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      rows: 3,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'price',
      label: '价格（元）',
      type: 'inputNumber' as const,
      placeholder: '请输入价格',
      rules: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
      ],
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
        precision: 2,
      },
    },
    {
      key: 'originalPrice',
      label: '原价（元）',
      type: 'inputNumber' as const,
      placeholder: '请输入原价（可选）',
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
        precision: 2,
      },
    },
    {
      key: 'stock',
      label: '库存',
      type: 'inputNumber' as const,
      placeholder: '请输入库存',
      rules: [
        { required: true, message: '请输入库存', trigger: 'blur' },
        { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
      ],
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
      },
    },
    {
      key: 'image',
      label: 'SKU图片',
      type: 'imageUpload' as const,
      limit: 1,
      width: '100%',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '禁用', value: 0 },
        { label: '启用', value: 1 },
      ],
      placeholder: '请选择状态',
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
    skuCode: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
    specName: [{ required: true, message: '请输入规格名称', trigger: 'blur' }],
    specValues: [
      { required: true, message: '请输入规格值', trigger: 'blur' },
    ],
    price: [
      { required: true, message: '请输入价格', trigger: 'blur' },
      { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
    ],
    stock: [
      { required: true, message: '请输入库存', trigger: 'blur' },
      { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
    ],
  },
  labelWidth: '120px',
  fieldWidth: 400,
}))

const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    // 验证JSON格式
    if (data.specValues) {
      try {
        JSON.parse(data.specValues)
      } catch {
        ElMessage.error('规格值必须是有效的JSON格式')
        return
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...rest } = data

    if (data.id) {
      // 更新规格
      const updateData: UpdateProductSkuDto = {
        productId: data.productId,
        skuCode: data.skuCode,
        specName: data.specName,
        specValues: data.specValues,
        price: data.price,
        originalPrice: data.originalPrice,
        stock: data.stock,
        image: data.image,
        status: data.status !== undefined ? data.status : 1,
      }
      await productSkuApi.updateSku(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建规格
      const createData: CreateProductSkuDto = {
        productId: data.productId,
        skuCode: data.skuCode,
        specName: data.specName,
        specValues: data.specValues,
        price: data.price,
        originalPrice: data.originalPrice,
        stock: data.stock || 0,
        image: data.image,
        status: data.status !== undefined ? data.status : 1,
      }
      await productSkuApi.createSku(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    productId: defaultProductId.value || 0,
    skuCode: '',
    specName: '',
    specValues: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    image: '',
    status: 1,
  }
}

const init = async (data: any) => {
  const { id, mode, productId } = data || {}
  type.value = mode || (id ? 'edit' : 'create')
  defaultProductId.value = productId

  await loadProducts()

  if (id) {
    try {
      const res = await productSkuApi.getSkuById(id)
      const sku = res as any as ProductSku

      formData.value = {
        ...sku,
        productId: sku.productId,
        price: Number(sku.price),
        originalPrice: sku.originalPrice ? Number(sku.originalPrice) : undefined,
        stock: sku.stock,
        status: sku.status !== undefined ? sku.status : 1,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载规格信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      productId: productId || 0,
      skuCode: '',
      specName: '',
      specValues: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      image: '',
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

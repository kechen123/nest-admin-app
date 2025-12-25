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
import { categoryApi, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '@/api/mall/category'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<Category & CreateCategoryDto>>({
  name: '',
  icon: '',
  parentId: 0,
  orderNum: 0,
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 分类树选项
const categoryTreeOptions = ref<any[]>([])

// 加载分类树
const loadCategoryTree = async () => {
  try {
    const res = await categoryApi.getCategoryTree()
    const buildOptions = (categories: Category[], excludeId?: number): any[] => {
      return categories
        .filter(cat => cat.id !== excludeId)
        .map(cat => ({
          label: cat.name,
          value: cat.id,
          children: cat.children ? buildOptions(cat.children, excludeId) : undefined,
        }))
    }
    categoryTreeOptions.value = buildOptions(res as any, formData.value.id)
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'name',
      label: '分类名称',
      type: 'input' as const,
      placeholder: '请输入分类名称',
      width: 240,
      rules: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'icon',
      label: '分类图标',
      type: 'input' as const,
      placeholder: '请输入分类图标URL',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'parentId',
      label: '父分类',
      type: 'select' as const,
      placeholder: '请选择父分类（不选则为顶级分类）',
      width: 240,
      options: [
        { label: '顶级分类', value: 0 },
        ...categoryTreeOptions.value,
      ],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'orderNum',
      label: '显示顺序',
      type: 'input-number' as const,
      placeholder: '请输入显示顺序',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
      },
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
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
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
      // 更新分类
      const updateData: UpdateCategoryDto = {
        name: data.name,
        icon: data.icon,
        parentId: data.parentId ?? 0,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
      }
      await categoryApi.updateCategory(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建分类
      const createData: CreateCategoryDto = {
        name: data.name,
        icon: data.icon,
        parentId: data.parentId ?? 0,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
      }
      await categoryApi.createCategory(createData)
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
    icon: '',
    parentId: 0,
    orderNum: 0,
    status: 1,
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'create')

  await loadCategoryTree()

  if (id) {
    try {
      const res = await categoryApi.getCategoryById(id)
      const category = res as any as Category

      formData.value = {
        ...category,
        parentId: category.parentId ?? 0,
        orderNum: category.orderNum ?? 0,
        status: category.status !== undefined ? category.status : 1,
      }

      // 重新加载分类树（排除当前分类）
      await loadCategoryTree()
    } catch (error: any) {
      ElMessage.error(error.message || '加载分类信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      name: '',
      icon: '',
      parentId: 0,
      orderNum: 0,
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

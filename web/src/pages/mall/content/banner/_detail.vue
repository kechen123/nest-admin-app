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
import { bannerApi, type Banner, type CreateBannerDto, type UpdateBannerDto } from '@/api/mall/banner'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<Banner & CreateBannerDto>>({
  title: '',
  image: '',
  linkType: 0,
  linkValue: '',
  sortOrder: 0,
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

const formConfig = computed(() => ({
  fields: [
    {
      key: 'title',
      label: '标题',
      type: 'input' as const,
      placeholder: '请输入标题',
      rules: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'image',
      label: '图片',
      type: 'imageUpload' as const,
      rules: [{ required: true, message: '请上传图片', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'linkType',
      label: '跳转类型',
      type: 'select' as const,
      placeholder: '请选择跳转类型',
      options: [
        { label: '无', value: 0 },
        { label: '商品', value: 1 },
        { label: '分类', value: 2 },
        { label: '链接', value: 3 },
      ],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'linkValue',
      label: '跳转值',
      type: 'input' as const,
      placeholder: computed(() => {
        const linkType = formData.value.linkType
        if (linkType === 1) return '请输入商品ID'
        if (linkType === 2) return '请输入分类ID'
        if (linkType === 3) return '请输入链接URL'
        return '请输入跳转值'
      }),
      disabled: computed(() => type.value === 'view' || formData.value.linkType === 0),
    },
    {
      key: 'sortOrder',
      label: '排序',
      type: 'inputNumber' as const,
      placeholder: '请输入排序值',
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
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    image: [{ required: true, message: '请上传图片', trigger: 'change' }],
  },
  labelWidth: '100px',
  fieldWidth: 300,
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
      // 更新轮播图
      const updateData: UpdateBannerDto = {
        title: data.title,
        image: data.image,
        linkType: data.linkType ?? 0,
        linkValue: data.linkValue || undefined,
        sortOrder: data.sortOrder ?? 0,
        status: data.status !== undefined ? data.status : 1,
      }
      await bannerApi.updateBanner(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建轮播图
      const createData: CreateBannerDto = {
        title: data.title,
        image: data.image,
        linkType: data.linkType ?? 0,
        linkValue: data.linkValue || undefined,
        sortOrder: data.sortOrder ?? 0,
        status: data.status !== undefined ? data.status : 1,
      }
      await bannerApi.createBanner(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    title: '',
    image: '',
    linkType: 0,
    linkValue: '',
    sortOrder: 0,
    status: 1,
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'create')

  if (id) {
    try {
      const res = await bannerApi.getBannerById(id)
      const banner = res as any as Banner

      formData.value = {
        ...banner,
        linkType: banner.linkType ?? 0,
        linkValue: banner.linkValue || '',
        sortOrder: banner.sortOrder ?? 0,
        status: banner.status !== undefined ? banner.status : 1,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载轮播图信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      title: '',
      image: '',
      linkType: 0,
      linkValue: '',
      sortOrder: 0,
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


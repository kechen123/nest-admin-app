<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <template #imageUrl>
          <ImageUpload v-model="formData.imageUrl" :limit="1" :disabled="type === 'view'" />
        </template>
      </KcForm>
    </div>

    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <CommonButton v-if="type !== 'view'" type="primary" :label="formData.id ? '保存' : '创建'"
          :prevent-double-click="true" @click="() => onSubmit(formData)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { miniappApi, type InviteConfig, type CreateInviteConfigDto, type UpdateInviteConfigDto } from '@/api/miniapp'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import KcForm from '@/components/Kc/Form/index.vue'

defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<InviteConfig & CreateInviteConfigDto>>({
  title: '',
  imageUrl: '',
  sortOrder: 0,
  remark: '',
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

const formConfig = computed(() => ({
  fields: [
    {
      key: 'title',
      label: '标题',
      type: 'input' as const,
      placeholder: '请输入邀请标题',
      width: '100%',
      rules: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'imageUrl',
      label: '图片',
      type: 'custom' as const,
      slot: 'imageUrl',
      width: '100%',
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'sortOrder',
      label: '排序',
      type: 'inputNumber' as const,
      placeholder: '请输入排序值',
      width: '100%',
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注信息',
      width: '100%',
      rows: 4,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
  ],
  labelWidth: '80px',
  showSubmitButton: false,
  showResetButton: false,
}))

const onReset = () => {
  formRef.value?.resetFields()
}

const init = async (data: any) => {
  const { rowId, type: _type } = data
  type.value = _type || 'edit'

  if (rowId) {
    const config = await miniappApi.getInviteConfigById(rowId) as unknown as InviteConfig
    formData.value = {
      ...config,
    }
  } else {
    type.value = 'create'
    formData.value = {
      title: '',
      imageUrl: '',
      sortOrder: 0,
      remark: '',
    }
  }
}

const onSubmit = async (data: any) => {
  try {
    // await formRef.value?.validate()

    if (data.id) {
      const updateData: UpdateInviteConfigDto = {
        title: data.title,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
        remark: data.remark,
      }
      await miniappApi.updateInviteConfig(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      const createData: CreateInviteConfigDto = {
        title: data.title,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder || 0,
        remark: data.remark,
      }
      await miniappApi.createInviteConfig(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    console.log('error>>>>>>>>>>>>>>>>', error)
    if (error !== 'validation_failed') {
      ElMessage.error(data.id ? '更新失败' : '创建失败')
    }
  }
}

defineExpose({
  init,
  formData,
  formConfig
})
</script>

<style scoped>
.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  border-top: 1px solid #e4e7ed;
  padding: 10px 20px;
  background: #fff;
}

.footer-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
</style>

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
import { postApi, type Post, type CreatePostDto, type UpdatePostDto } from '@/api/post'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<Post & CreatePostDto>>({
  code: '',
  name: '',
  orderNum: 0,
  status: 1,
  remark: '',
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 字典选项
const statusOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'code',
      label: '岗位编码',
      type: 'input' as const,
      placeholder: '请输入岗位编码',
      width: 240,
      rules: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view' || !!formData.value.id),
    },
    {
      key: 'name',
      label: '岗位名称',
      type: 'input' as const,
      placeholder: '请输入岗位名称',
      width: 240,
      rules: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
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
      options: statusOptions.value.map((opt: DictOption) => ({
        label: opt.label,
        value: Number(opt.value)
      })),
      placeholder: '请选择状态',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注',
      width: '100%',
      rows: 4,
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
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
      // 更新岗位
      const updateData: UpdatePostDto = {
        code: data.code,
        name: data.name,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await postApi.updatePost(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建岗位
      const createData: CreatePostDto = {
        code: data.code,
        name: data.name,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await postApi.createPost(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    code: '',
    name: '',
    orderNum: 0,
    status: 1,
    remark: '',
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'create')

  await loadDicts()

  if (id) {
    try {
      const res = await postApi.getPostById(id)
      const post = res as any as Post

      formData.value = {
        ...post,
        orderNum: post.orderNum ?? 0,
        status: post.status !== undefined ? post.status : 1,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载岗位信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      code: '',
      name: '',
      orderNum: 0,
      status: 1,
      remark: '',
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


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
import { dictApi, type DictData, type CreateDictDataDto, type UpdateDictDataDto, type DictType } from '@/api/dict'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<DictData & CreateDictDataDto>>({
  dictSort: 0,
  dictLabel: '',
  dictValue: '',
  dictType: '',
  cssClass: '',
  listClass: '',
  isDefault: 0,
  status: 1,
  remark: '',
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 字典选项
const statusOptions = ref<DictOption[]>([])
const isDefaultOptions = ref<DictOption[]>([])
const dictTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
    isDefaultOptions.value = await getDictOptions('sys_yes_no')
    // 加载字典类型列表
    const types = await dictApi.getAllDictTypes() as any
    dictTypeOptions.value = (types || []).map((item: DictType) => ({
      label: item.dictName,
      value: item.dictType,
    }))
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'dictType',
      label: '字典类型',
      type: 'select' as const,
      options: computed(() => dictTypeOptions.value),
      placeholder: '请选择字典类型',
      width: 240,
      rules: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
      disabled: computed(() => type.value === 'view' || !!formData.value.id),
    },
    {
      key: 'dictLabel',
      label: '字典标签',
      type: 'input' as const,
      placeholder: '请输入字典标签',
      width: 240,
      rules: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'dictValue',
      label: '字典键值',
      type: 'input' as const,
      placeholder: '请输入字典键值',
      width: 240,
      rules: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view' || !!formData.value.id),
    },
    {
      key: 'dictSort',
      label: '字典排序',
      type: 'input-number' as const,
      placeholder: '请输入字典排序',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      props: {
        min: 0,
      },
    },
    {
      key: 'cssClass',
      label: '样式属性',
      type: 'input' as const,
      placeholder: '请输入样式属性',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'listClass',
      label: '表格回显样式',
      type: 'input' as const,
      placeholder: '请输入表格回显样式',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'isDefault',
      label: '是否默认',
      type: 'select' as const,
      options: isDefaultOptions.value.map((opt: DictOption) => ({
        label: opt.label,
        value: Number(opt.value)
      })),
      placeholder: '请选择是否默认',
      width: 240,
      disabled: computed(() => type.value === 'view'),
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
    dictType: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
    dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
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
      // 更新字典数据
      const updateData: UpdateDictDataDto = {
        dictSort: data.dictSort ?? 0,
        dictLabel: data.dictLabel,
        dictValue: data.dictValue,
        dictType: data.dictType,
        cssClass: data.cssClass,
        listClass: data.listClass,
        isDefault: data.isDefault !== undefined ? data.isDefault : 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await dictApi.updateDictData(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建字典数据
      const createData: CreateDictDataDto = {
        dictSort: data.dictSort ?? 0,
        dictLabel: data.dictLabel,
        dictValue: data.dictValue,
        dictType: data.dictType,
        cssClass: data.cssClass,
        listClass: data.listClass,
        isDefault: data.isDefault !== undefined ? data.isDefault : 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await dictApi.createDictData(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    dictSort: 0,
    dictLabel: '',
    dictValue: '',
    dictType: '',
    cssClass: '',
    listClass: '',
    isDefault: 0,
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
      const res = await dictApi.getDictDataById(id)
      const dictData = res as any as DictData

      formData.value = {
        ...dictData,
        dictSort: dictData.dictSort ?? 0,
        isDefault: dictData.isDefault !== undefined ? dictData.isDefault : 0,
        status: dictData.status !== undefined ? dictData.status : 1,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载字典数据信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      dictSort: 0,
      dictLabel: '',
      dictValue: '',
      dictType: '',
      cssClass: '',
      listClass: '',
      isDefault: 0,
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


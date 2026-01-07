<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <template #parentId>
          <el-tree-select v-model="formData.parentId" :data="departmentTreeOptions"
            :props="{ children: 'children', label: 'label', value: 'value' }" placeholder="请选择父部门"
            :disabled="type === 'view'" style="width: 100%" check-strictly clearable />
        </template>
      </KcForm>
    </div>

    <!-- 固定的 Footer -->
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
import { departmentApi, type Department, type CreateDepartmentDto, type UpdateDepartmentDto } from '@/api/department'
import { ElMessage } from 'element-plus'
import KcForm from '@/components/Kc/Form/index.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<Department & CreateDepartmentDto>>({
  name: '',
  parentId: 0,
  ancestors: '',
  leader: '',
  phone: '',
  email: '',
  orderNum: 0,
  status: 1,
  remark: '',
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 字典选项
const statusOptions = ref<DictOption[]>([])

// 部门树选项（用于父部门选择）
const departmentTreeOptions = ref<Array<{ label: string; value: number; children?: any[] }>>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载部门树
const loadDepartmentTree = async () => {
  try {
    const res = await departmentApi.getDepartmentTree()
    const departments = (res as any) || []

    // 转换为树形选择器需要的格式
    const convertToTreeOptions = (depts: Department[], excludeId?: number): any[] => {
      return depts
        .filter(dept => dept.id !== excludeId) // 排除自己
        .map(dept => ({
          label: dept.name,
          value: dept.id,
          children: dept.children && dept.children.length > 0
            ? convertToTreeOptions(dept.children, excludeId)
            : undefined,
        }))
    }

    departmentTreeOptions.value = convertToTreeOptions(departments, formData.value.id)
  } catch (error: any) {
    ElMessage.error(error.message || '加载部门树失败')
  }
}

const formConfig = computed(() => ({
  fields: [
    {
      key: 'name',
      label: '部门名称',
      type: 'input' as const,
      placeholder: '请输入部门名称',
      width: 240,
      rules: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'parentId',
      label: '父部门',
      type: 'custom' as const,
      slot: 'parentId',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'leader',
      label: '负责人',
      type: 'input' as const,
      placeholder: '请输入负责人',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'phone',
      label: '联系电话',
      type: 'input' as const,
      placeholder: '请输入联系电话',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input' as const,
      placeholder: '请输入邮箱',
      width: 240,
      rules: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      disabled: computed(() => type.value === 'view'),
      compare: true,
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
      compare: true,
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
      compare: true,
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注',
      width: '100%',
      rows: 4,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    email: [
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
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
    const { id, ...restData } = data

    if (data.id) {
      // 更新部门
      const updateData: UpdateDepartmentDto = {
        name: data.name,
        parentId: data.parentId !== undefined ? data.parentId : 0,
        leader: data.leader,
        phone: data.phone,
        email: data.email,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await departmentApi.updateDepartment(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建部门
      const createData: CreateDepartmentDto = {
        name: data.name,
        parentId: data.parentId !== undefined ? data.parentId : 0,
        leader: data.leader,
        phone: data.phone,
        email: data.email,
        orderNum: data.orderNum ?? 0,
        status: data.status !== undefined ? data.status : 1,
        remark: data.remark,
      }
      await departmentApi.createDepartment(createData)
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
    parentId: 0,
    ancestors: '',
    leader: '',
    phone: '',
    email: '',
    orderNum: 0,
    status: 1,
    remark: '',
  }
}

const init = async (data: any) => {
  const { id, mode } = data || {}
  type.value = mode || (id ? 'edit' : 'create')

  await loadDicts()
  await loadDepartmentTree()

  if (id) {
    try {
      const res = await departmentApi.getDepartmentById(id)
      const department = res as any as Department

      formData.value = {
        ...department,
        parentId: department.parentId ?? 0,
        orderNum: department.orderNum ?? 0,
        status: department.status !== undefined ? department.status : 1,
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载部门信息失败')
    }
  } else {
    // 新增模式
    formData.value = {
      name: '',
      parentId: 0,
      ancestors: '',
      leader: '',
      phone: '',
      email: '',
      orderNum: 0,
      status: 1,
      remark: '',
    }
  }
}

defineExpose({
  init,
  // 暴露给 SlideContainer 用于自动检测未保存修改
  formData,
  formConfig
})
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

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
import { getMenu, addMenu, updateMenu, type BackendMenu } from '@/api/sys_menu'
import { ElMessage } from 'element-plus'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<BackendMenu>>({
  name: '',
  path: '',
  icon: '',
  parentId: undefined,
  component: '',
  sort: 0,
  status: 1,
  permissionCode: '',
  isExternal: 0,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 菜单树数据（用于父级菜单选择）
const menuTree = ref<BackendMenu[]>([])

// 将菜单树转换为级联选择器需要的格式
const getCascaderOptions = (menus: BackendMenu[], excludeId?: number): any[] => {
  return menus
    .filter(m => m.id !== excludeId) // 排除自己，避免循环引用
    .map(m => ({
      value: m.id,
      label: m.name,
      children: m.children && m.children.length > 0 ? getCascaderOptions(m.children, excludeId) : undefined
    }))
}

const formConfig = reactive({
  fields: [
    {
      key: 'name',
      label: '菜单名称',
      type: 'input' as const,
      placeholder: '请输入菜单名称',
      width: 240,
      rules: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'path',
      label: '路由路径',
      type: 'input' as const,
      placeholder: '请输入路由路径',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'icon',
      label: '图标',
      type: 'input' as const,
      placeholder: '请输入图标名称',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'parentId',
      label: '父级菜单',
      type: 'select' as const,
      options: computed(() => {
        const options: any[] = [{ label: '无', value: undefined }]
        const cascaderOptions = getCascaderOptions(menuTree.value, formData.value.id)
        // 扁平化处理，方便选择
        const flattenOptions = (opts: any[]): any[] => {
          const result: any[] = []
          opts.forEach(opt => {
            result.push({ label: opt.label, value: opt.value })
            if (opt.children && opt.children.length > 0) {
              result.push(...flattenOptions(opt.children))
            }
          })
          return result
        }
        options.push(...flattenOptions(cascaderOptions))
        return options
      }),
      placeholder: '请选择父级菜单',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'component',
      label: '组件路径',
      type: 'input' as const,
      placeholder: '请输入组件路径',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'permissionCode',
      label: '权限代码',
      type: 'input' as const,
      placeholder: '请输入权限代码',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'sort',
      label: '排序',
      type: 'input' as const,
      placeholder: '请输入排序值',
      width: 240,
      inputType: 'number',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ],
      placeholder: '请选择状态',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'isExternal',
      label: '是否外部链接',
      type: 'select' as const,
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ],
      placeholder: '请选择',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  },
  labelWidth: '100px',
  fieldWidth: 250,
})

const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    if (data.id) {
      // 更新菜单
      const updateData: any = {
        name: data.name,
        path: data.path || undefined,
        icon: data.icon || undefined,
        parentId: data.parentId || undefined,
        component: data.component || undefined,
        sort: data.sort || 0,
        status: data.status !== undefined ? data.status : 1,
        permissionCode: data.permissionCode || undefined,
        isExternal: data.isExternal !== undefined ? data.isExternal : 0,
      }
      await updateMenu(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建菜单
      const createData: any = {
        name: data.name,
        path: data.path || undefined,
        icon: data.icon || undefined,
        parentId: data.parentId || undefined,
        component: data.component || undefined,
        sort: data.sort || 0,
        status: data.status !== undefined ? data.status : 1,
        permissionCode: data.permissionCode || undefined,
        isExternal: data.isExternal !== undefined ? data.isExternal : 0,
      }
      await addMenu(createData)
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
    path: '',
    icon: '',
    parentId: undefined,
    component: '',
    sort: 0,
    status: 1,
    permissionCode: '',
    isExternal: 0,
  }
}

const init = async (data: any) => {
  const { rowId, type: _type, menuTree: tree } = data
  type.value = _type || 'edit'
  
  // 设置菜单树
  if (tree) {
    menuTree.value = tree
  }

  if (rowId) {
    // 获取菜单详情
    const res = await getMenu(rowId)
    const menu = res.data as BackendMenu
    formData.value = {
      ...menu,
    }
  } else {
    // 新增模式
    type.value = 'create'
    formData.value = {
      name: '',
      path: '',
      icon: '',
      parentId: undefined,
      component: '',
      sort: 0,
      status: 1,
      permissionCode: '',
      isExternal: 0,
    }
  }
}

defineExpose({ init })
</script>

<style scoped>
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

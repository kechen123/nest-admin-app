<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <template #icon="{ field, model }">
          <IconPicker v-model="model[field.key]"
            :placeholder="typeof field.placeholder === 'string' ? field.placeholder : undefined"
            :disabled="typeof field.disabled === 'boolean' ? field.disabled : false" @change="handleIconChange" />
        </template>
        <template #parentId="{ field, model }">
          <el-tree-select v-model="model[field.key]" :data="treeSelectOptions"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            :placeholder="typeof field.placeholder === 'string' ? field.placeholder : undefined"
            :disabled="typeof field.disabled === 'boolean' ? field.disabled : false" clearable check-strictly
            :render-after-expand="false" style="width: 100%" />
        </template>
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
import { getMenu, addMenu, updateMenu, getMenuTree, type BackendMenu } from '@/api/sys_menu'
import { ElMessage } from 'element-plus'
import IconPicker from '@/components/IconPicker/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<BackendMenu>>({
  name: '',
  title: '',
  path: '',
  icon: '',
  parentId: undefined,
  component: '',
  sort: 0,
  status: 1,
  permissionCode: '',
  menuType: 'C',
  isExternal: 0,
  visible: 1,
  isCache: 0,
  query: '',
  remark: '',
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 菜单树数据（用于父级菜单选择）
const menuTree = ref<BackendMenu[]>([])

// 将菜单树转换为树形选择器需要的格式
const getTreeOptions = (menus: BackendMenu[], excludeId?: number): any[] => {
  return menus
    .filter(m => m.id !== excludeId) // 排除自己，避免循环引用
    .map(m => ({
      value: m.id,
      label: m.title || m.name, // 使用 title（菜单名称）作为显示文本
      children: m.children && m.children.length > 0 ? getTreeOptions(m.children, excludeId) : undefined
    }))
}

// 树形选择器的选项数据
const treeSelectOptions = computed(() => {
  return getTreeOptions(menuTree.value, formData.value.id)
})

const formConfig = reactive({
  fields: [
    {
      key: 'menuType',
      label: '菜单类型',
      type: 'select' as const,
      options: [
        { label: '目录', value: 'M' },
        { label: '菜单', value: 'C' },
        { label: '按钮', value: 'F' }
      ],
      placeholder: '请选择菜单类型',
      rules: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'name',
      label: '菜单名称',
      type: 'input' as const,
      placeholder: '请输入菜单名称',
      rules: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'title',
      label: '菜单标题',
      type: 'input' as const,
      placeholder: '请输入菜单标题',
      rules: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'path',
      label: '路由路径',
      type: 'input' as const,
      placeholder: '请输入路由路径',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'icon',
      label: '图标',
      type: 'input' as const,
      placeholder: '请选择图标',
      disabled: computed(() => type.value === 'view'),
      slot: 'icon', // 使用自定义插槽
    },
    {
      key: 'parentId',
      label: '父级菜单',
      type: 'select' as const,
      placeholder: '请选择父级菜单',
      disabled: computed(() => type.value === 'view'),
      slot: 'parentId', // 使用自定义插槽显示树形选择器
    },
    {
      key: 'component',
      label: '组件路径',
      type: 'input' as const,
      placeholder: '请输入组件路径',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'permissionCode',
      label: '权限代码',
      type: 'input' as const,
      placeholder: '请输入权限代码',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'sort',
      label: '排序',
      type: 'input' as const,
      placeholder: '请输入排序值',
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
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'visible',
      label: '显示状态',
      type: 'select' as const,
      options: [
        { label: '显示', value: 1 },
        { label: '隐藏', value: 0 }
      ],
      placeholder: '请选择显示状态',
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
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'isCache',
      label: '是否缓存',
      type: 'select' as const,
      options: [
        { label: '缓存', value: 0 },
        { label: '不缓存', value: 1 }
      ],
      placeholder: '请选择',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'query',
      label: '路由参数',
      type: 'input' as const,
      placeholder: '请输入路由参数，如：id=1&type=2',
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注',
      disabled: computed(() => type.value === 'view'),
      attrs: {
        rows: 3,
      }
    },
  ],
  rules: {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  },
  labelWidth: '100px',
  fieldWidth: 350,
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
        title: data.title,
        menuType: data.menuType || 'C',
        path: data.path || undefined,
        icon: data.icon || undefined,
        parentId: data.parentId || undefined,
        component: data.component || undefined,
        sort: data.sort || 0,
        status: data.status !== undefined ? data.status : 1,
        visible: data.visible !== undefined ? data.visible : 1,
        permissionCode: data.permissionCode || undefined,
        isExternal: data.isExternal !== undefined ? data.isExternal : 0,
        isCache: data.isCache !== undefined ? data.isCache : 0,
        query: data.query || undefined,
        remark: data.remark || undefined,
      }
      await updateMenu(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建菜单
      const createData: any = {
        name: data.name,
        title: data.title,
        menuType: data.menuType || 'C',
        path: data.path || undefined,
        icon: data.icon || undefined,
        parentId: data.parentId || undefined,
        component: data.component || undefined,
        sort: data.sort || 0,
        status: data.status !== undefined ? data.status : 1,
        visible: data.visible !== undefined ? data.visible : 1,
        permissionCode: data.permissionCode || undefined,
        isExternal: data.isExternal !== undefined ? data.isExternal : 0,
        isCache: data.isCache !== undefined ? data.isCache : 0,
        query: data.query || undefined,
        remark: data.remark || undefined,
      }
      await addMenu(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const handleIconChange = (value: string) => {
  formData.value.icon = value
}

const onReset = () => {
  formData.value = {
    name: '',
    title: '',
    path: '',
    icon: '',
    parentId: undefined,
    component: '',
    sort: 0,
    status: 1,
    menuType: 'C',
    permissionCode: '',
    isExternal: 0,
    visible: 1,
    isCache: 0,
    query: '',
    remark: '',
  }
}

const init = async (data: any) => {
  const { rowId, type: _type, menuTree: tree } = data
  type.value = _type || 'edit'

  // 设置菜单树
  if (tree && tree.length > 0) {
    menuTree.value = tree
  } else {
    // 如果没有传入菜单树，则重新加载
    try {
      const res = await getMenuTree() as any
      menuTree.value = res || []
    } catch (error) {
      console.error('加载菜单树失败', error)
      menuTree.value = []
    }
  }

  if (rowId) {
    // 获取菜单详情
    const res = await getMenu(rowId)
    // axios拦截器已经返回了data字段，所以res就是BackendMenu
    const menu = res as any as BackendMenu
    formData.value = {
      ...menu,
      // 确保 visible 和 isCache 有默认值
      visible: menu.visible !== undefined && menu.visible !== null ? menu.visible : 1,
      isCache: menu.isCache !== undefined && menu.isCache !== null ? menu.isCache : 0,
      // 确保其他字段也有默认值
      status: menu.status !== undefined && menu.status !== null ? menu.status : 1,
      isExternal: menu.isExternal !== undefined && menu.isExternal !== null ? menu.isExternal : 0,
      sort: menu.sort !== undefined && menu.sort !== null ? menu.sort : 0,
      menuType: menu.menuType || 'C',
    }
  } else {
    // 新增模式
    type.value = 'create'
    formData.value = {
      name: '',
      title: '',
      path: '',
      icon: '',
      parentId: undefined,
      component: '',
      sort: 0,
      status: 1,
      menuType: 'C',
      permissionCode: '',
      isExternal: 0,
      visible: 1,
      isCache: 0,
      query: '',
      remark: '',
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

<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #avatar="{ row }">
      <el-avatar :size="50" shape="square" :src="getPreviewUrl(row.avatar)">
        <el-icon>
          <User />
        </el-icon>
      </el-avatar>
    </template>
    <template #roles="{ row }">
      <el-tag v-for="role in row.roles || []" :key="role.id" size="small" type="primary"
        style="margin-right: 4px; margin-bottom: 4px;">
        {{ role.name }}
      </el-tag>
      <span v-if="!row.roles || row.roles.length === 0" style="color: #999;">-</span>
    </template>
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton v-if="hasPermission('system:user:edit')" type="primary" plain size="small" :label="'编辑'"
          @click="() => openUserDetail(row.id, 'edit')" />
        <CommonButton v-if="hasPermission('system:user:query')" type="success" plain size="small" :label="'查看详情'"
          @click="() => openUserDetail(row.id, 'view')" />
        <CommonButton v-if="hasPermission('system:user:remove')" type="danger" plain size="small" :label="'删除'"
          @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { User } from '@element-plus/icons-vue'
import { userApi, type User as UserType } from '@/api/user'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPreviewUrl } from '@/utils/common'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'
import { departmentApi } from '@/api/department'
import { postApi } from '@/api/post'
import { hasPermission } from '@/utils/permission'

interface Props {
  deptId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  deptId: null
})

// 选中的行数据
const selectedRows = ref<UserType[]>([])

// 字典选项
const genderOptions = ref<DictOption[]>([])
const statusOptions = ref<DictOption[]>([])
const isAdminOptions = ref<DictOption[]>([])

// 部门和岗位映射
const deptMap = ref<Record<number, string>>({})
const postMap = ref<Record<number, string>>({})

// 加载字典数据
const loadDicts = async () => {
  try {
    genderOptions.value = await getDictOptions('sys_user_sex')
    statusOptions.value = await getDictOptions('sys_normal_disable')
    isAdminOptions.value = await getDictOptions('sys_yes_no')

  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载部门和岗位数据
const loadDeptAndPost = async () => {
  try {
    // 获取部门列表
    // axios拦截器已经返回了res.data，所以这里直接使用返回的数组
    try {
      const deptList = await departmentApi.getAllDepartments()
      if (Array.isArray(deptList)) {
        const map: Record<number, string> = {}
        deptList.forEach((item: any) => {
          if (item.id && item.name) {
            map[item.id] = item.name
          }
        })
        deptMap.value = map
      }
    } catch (error) {
      console.warn('获取部门列表失败:', error)
    }

    // 获取岗位列表
    // axios拦截器已经返回了res.data，所以这里直接使用返回的数组
    try {
      const postList = await postApi.getAllPosts()
      if (Array.isArray(postList)) {
        const map: Record<number, string> = {}
        postList.forEach((item: any) => {
          if (item.id && item.name) {
            map[item.id] = item.name
          }
        })
        postMap.value = map
      }
    } catch (error) {
      console.warn('获取岗位列表失败:', error)
    }
  } catch (error) {
    console.error('加载部门和岗位数据失败:', error)
  }
}

// 组件挂载时加载字典和部门岗位数据
onMounted(() => {
  loadDicts()
  loadDeptAndPost()
})

// 列显示配置
const columnDisplayConfig = {
  // 当右侧栏目打开时隐藏的列
  hiddenWhenPanelOpen: [
    'selection',
    'avatar',
    'status',
    'isAdmin',
    'loginIp',
    'loginDate',
    'deptId',
    'postId',
    'actions',
  ],
  // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
  alwaysShow: []
}

// 基础列配置（使用计算属性，以便响应字典数据变化）
const baseColumns = computed<ColumnProps[]>(() => [
  {
    type: 'text',
    label: 'ID',
    prop: 'id',
    show: true,
    width: 80,
    align: 'center',
  },
  {
    type: 'slot',
    prop: 'avatar',
    label: '头像',
    show: true,
    align: 'center',
    width: 100,
  },
  {
    type: 'text',
    prop: 'username',
    align: 'left',
    show: true,
    label: '用户名',
    width: 150,
  },
  {
    type: 'text',
    prop: 'nickname',
    align: 'left',
    show: true,
    label: '昵称',
    width: 100,
  },
  {
    type: 'text',
    prop: 'email',
    align: 'left',
    show: true,
    label: '邮箱',
    showOverflowTooltip: true,
    width: 150,
  },
  {
    type: 'slot',
    prop: 'roles',
    align: 'left',
    label: '角色',
    width: 200,
    show: true,
  },
  {
    type: 'text',
    prop: 'phone',
    align: 'left',
    show: true,
    label: '手机号',
    width: 120,
  },
  {
    type: 'tag',
    prop: 'gender',
    align: 'center',
    label: '性别',
    width: 100,
    show: true,
    options: genderOptions.value.map(opt => ({
      value: Number(opt.value),
      label: opt.label,
      tagType: opt.tagType || 'info'
    }))
  },
  {
    type: 'text',
    prop: 'deptId',
    align: 'left',
    label: '部门',
    width: 120,
    show: true,
    formatter: (row: any) => {
      if (!row.deptId) return '-'
      return deptMap.value[row.deptId] || `部门ID: ${row.deptId}`
    }
  },
  {
    type: 'text',
    prop: 'postId',
    align: 'left',
    label: '岗位',
    width: 140,
    show: true,
    formatter: (row: any) => {
      if (!row.postId) return '-'
      return postMap.value[row.postId] || `岗位ID: ${row.postId}`
    }
  },
  {
    type: 'text',
    prop: 'loginIp',
    align: 'left',
    label: '登录IP',
    width: 130,
    show: true,
    formatter: (row: any) => row.loginIp || '-'
  },
  {
    type: 'text',
    prop: 'loginDate',
    align: 'center',
    label: '登录时间',
    width: 180,
    show: true,
    formatter: (row: any) => {
      return row.loginDate ? new Date(row.loginDate).toLocaleString('zh-CN') : '-'
    }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: statusOptions.value.map((opt: DictOption) => ({
      value: Number(opt.value),
      label: opt.label,
      tagType: opt.tagType || (opt.value === '1' ? 'success' : 'danger')
    }))
  },
  {
    type: 'tag',
    prop: 'isAdmin',
    align: 'center',
    label: '是否管理员',
    width: 120,
    show: true,
    options: computed(() => isAdminOptions.value.map((opt: DictOption) => ({
      value: Number(opt.value),
      label: opt.label,
      tagType: opt.tagType || (opt.value === '1' ? 'success' : 'info')
    })))
  },
  {
    type: 'text',
    prop: 'remark',
    align: 'center',
    show: true,
    label: '备注',
    showOverflowTooltip: true,
    width: 200,
  },
  {
    type: 'text',
    prop: 'createdAt',
    align: 'center',
    show: true,
    label: '创建时间',
    width: 180,
    formatter: (row: any) => {
      return row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-'
    }
  },
  {
    type: 'text',
    prop: 'updatedAt',
    align: 'center',
    show: true,
    label: '更新时间',
    width: 180,
    formatter: (row: any) => {
      return row.updatedAt ? new Date(row.updatedAt).toLocaleString('zh-CN') : '-'
    }
  },
  {
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 240
  }
])

// 请求函数：适配后端数据格式
// 注意：deptId 会在 beforeRequest 中添加，这里不需要重复处理
const requestUserList = async (params: any) => {
  // beforeRequest 已经处理了 size 转换和 deptId 添加
  return await userApi.getUserList(params)
}

// 响应适配器：将后端返回的数据格式转换为表格组件需要的格式
const responseAdapter = (raw: any, params: any) => {
  return {
    list: raw.list || [],
    total: raw.total || 0,
    page: raw.page || params.page || 1,
    size: raw.pageSize || params.size || 10,
  }
}

const tableConfig = computed<TableConfig>(() => ({
  columns: baseColumns.value,
  request: requestUserList,
  responseAdapter: responseAdapter,
  defaultPagination: { page: 1, size: 10 },
  beforeRequest: (params: any) => {
    // 将 size 转换为 pageSize（后端使用 pageSize）
    const requestParams: any = {
      ...params,
      pageSize: params.size || params.pageSize || 10,
    }
    delete requestParams.size

    // 添加部门ID过滤（确保使用最新的 props.deptId）
    if (props.deptId !== null && props.deptId !== undefined) {
      requestParams.deptId = props.deptId
    }

    return requestParams
  },
  showPagination: true,
  showLoading: true,
  options: {
    attributes: {
      border: false,
      'row-key': 'id',
      stripe: true,
    },
    events: {
      onSelectionChange: (selection: any[]) => {
        selectedRows.value = selection
      },
      // onRowClick: (row: any) => {
      //   // 点击行可以打开详情
      //   openUserDetail(row.id, 'view')
      // }
    }
  }
}))

// 动态生成工具栏配置
const toolbarConfig = computed(() => {
  const leftButtons = []

  // 新增用户按钮
  if (hasPermission('system:user:add')) {
    leftButtons.push({
      key: 'add',
      label: '新增用户',
      type: 'primary' as const,
      onClick: () => {
        openUserDetail()
      }
    })
  }

  // 批量删除按钮
  if (hasPermission('system:user:remove')) {
    leftButtons.push({
      key: 'batchDelete',
      label: `批量删除${selectedRows.value.length > 0 ? `(${selectedRows.value.length})` : ''}`,
      type: 'danger' as const,
      disabled: selectedRows.value.length === 0,
      onClick: async () => {
        try {
          await ElMessageBox.confirm(
            `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )

          // 执行批量删除
          const deletePromises = selectedRows.value.map(user => userApi.deleteUser(user.id))
          await Promise.all(deletePromises)

          ElMessage.success('批量删除成功')
          selectedRows.value = []
          await tableRef.value?.refresh()
        } catch (error) {
          if (error !== 'cancel') {
            ElMessage.error('批量删除失败')
          }
        }
      }
    })
  }

  return {
    leftButtons,
    rightButtons: [
      {
        key: 'refresh',
        label: '刷新',
        type: 'info' as const,
        icon: 'Refresh',
        onClick: async () => {
          await tableRef.value?.refresh()
          ElMessage.success('刷新成功')
        }
      }
    ]
  }
})

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'username',
        label: '用户名',
        type: 'input' as const,
        placeholder: '请输入用户名',
      },
      {
        key: 'email',
        label: '邮箱',
        type: 'input' as const,
        placeholder: '请输入邮箱',
      },
      {
        key: 'role',
        label: '角色',
        type: 'select' as const,
        placeholder: '请选择角色',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' }
        ]
      },
    ],
    defaultCount: 2,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true
  },
  table: tableConfig.value
}))

const tableRef = ref<InstanceType<typeof TableWithSlidePanel> & { refresh?: () => Promise<void> }>()

// 监听部门ID变化，自动刷新表格并重置分页
watch(() => props.deptId, async (newDeptId, oldDeptId) => {
  // 只有在 deptId 真正变化时才刷新（避免初始化时触发）
  if (newDeptId !== oldDeptId && tableRef.value) {
    // 重置分页到第一页
    if (tableRef.value.resetPagination) {
      tableRef.value.resetPagination()
    }
    // 使用 nextTick 确保 props.deptId 已经更新到最新值
    await nextTick()
    // 刷新数据
    if (tableRef.value.refresh) {
      await tableRef.value.refresh()
    }
  }
}, { immediate: false })

// 暴露 refresh 方法供父组件调用
defineExpose({
  refresh: () => {
    if (tableRef.value?.refresh) {
      return tableRef.value.refresh()
    }
  }
})

const openUserDetail = (rowId?: number, type?: string) => {
  // 确定标题：优先使用 type 参数，如果没有则根据 rowId 判断
  let title = '新增用户'
  if (type === 'view') {
    title = '查看用户'
  } else if (type === 'edit' || (rowId && !type)) {
    // 如果明确是编辑模式，或者有 rowId 但没有指定 type，则默认为编辑
    title = '编辑用户'
  } else if (!rowId) {
    title = '新增用户'
  }
  console.log('title', title)
  // 确定传递给组件的 type：如果没有指定，则根据 rowId 判断
  const finalType = type || (rowId ? 'edit' : 'create')

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      rowId,
      type: finalType,
    },
    width: 600,
    title,
    onClose: async (refresh: boolean) => {
      if (refresh) {
        await tableRef.value?.refresh()
      }
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await userApi.deleteUser(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

</script>

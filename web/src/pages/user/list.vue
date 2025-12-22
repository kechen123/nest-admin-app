<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #avatar="{ row }">
      <el-avatar :size="50" shape="square" :src="getPreviewUrl(row.avatar)">
        <el-icon>
          <User />
        </el-icon>
      </el-avatar>
    </template>
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openUserDetail(row.id, 'edit')">编辑</el-button>
      <el-button type="success" plain size="small" @click="openUserDetail(row.id, 'view')">查看详情</el-button>
      <el-button type="danger" plain size="small" @click="handleDelete(row.id)">删除</el-button>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { userApi, type User as UserType } from '@/api/user'
import Detail from './list/_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPreviewUrl } from '@/utils/common'

// 选中的行数据
const selectedRows = ref<UserType[]>([])

// 列显示配置
const columnDisplayConfig = {
  // 当右侧栏目打开时隐藏的列
  hiddenWhenPanelOpen: [
    'selection',
    'avatar',
    'status',
    'actions',
  ],
  // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
  alwaysShow: []
}

// 基础列配置
const baseColumns: ColumnProps[] = [
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
    width: 150,
  },
  {
    type: 'text',
    prop: 'email',
    align: 'left',
    show: true,
    label: '邮箱',
    showOverflowTooltip: true,
  },
  {
    type: 'tag',
    prop: 'role',
    align: 'center',
    label: '角色',
    width: 120,
    show: true,
    options: [
      { value: 'admin', label: '管理员', tagType: 'danger' },
      { value: 'user', label: '用户', tagType: 'primary' },
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: [
      { value: false, label: '禁用', tagType: 'danger' },
      { value: true, label: '启用', tagType: 'success' },
    ]
  },
  {
    type: 'text',
    prop: 'createdAt',
    align: 'center',
    show: true,
    label: '创建时间',
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
]

// 请求函数：适配后端数据格式
const requestUserList = async (params: any) => {
  // 将 size 转换为 pageSize（后端使用 pageSize）
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size

  return await userApi.getUserList(requestParams)
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

const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestUserList,
  responseAdapter: responseAdapter,
  defaultPagination: { page: 1, size: 10 },
  beforeRequest: (params: any) => {
    // 将 size 转换为 pageSize（后端使用 pageSize）
    const requestParams = {
      ...params,
      pageSize: params.size || params.pageSize || 10,
    }
    delete requestParams.size
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
}

// 动态生成工具栏配置
const toolbarConfig = computed(() => ({
  leftButtons: [
    {
      key: 'add',
      label: '新增用户',
      type: 'primary' as const,
      onClick: () => {
        openUserDetail()
      }
    },
    {
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
    }
  ],
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
}))

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
  table: tableConfig
}))

const tableRef = ref()

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

<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          :on-click="() => openUserDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          :on-click="() => openUserDetail(row.id, 'view')" />
        <CommonButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small"
          :label="row.status === 1 ? '禁用' : '启用'" :on-click="() => handleStatusChange(row)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { miniappUserApi } from '@/api/mall/miniapp-user'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage } from 'element-plus'

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: [
    'selection',
    'status',
    'actions',
  ],
  alwaysShow: []
}

// 基础列配置
const baseColumns: ColumnProps[] = [
  {
    type: 'text',
    prop: 'nickname',
    align: 'left',
    show: true,
    label: '昵称',
    width: 150,
    formatter: (row: any) => {
      return row.nickname || '-'
    }
  },
  {
    type: 'text',
    prop: 'phone',
    align: 'left',
    show: true,
    label: '手机号',
    width: 120,
    formatter: (row: any) => {
      return row.phone || '-'
    }
  },
  {
    type: 'text',
    prop: 'balance',
    align: 'right',
    show: true,
    label: '余额',
    width: 120,
    formatter: (row: any) => {
      return `¥${row.balance}`
    }
  },
  {
    type: 'text',
    prop: 'points',
    align: 'center',
    show: true,
    label: '积分',
    width: 100,
  },
  {
    prop: 'memberLevel',
    label: '会员等级',
    type: 'tag',
    show: true,
    align: 'center',
    width: 120,
    options: [
      { value: 0, label: '普通', tagType: 'info' },
      { value: 1, label: '银卡', tagType: '' },
      { value: 2, label: '金卡', tagType: 'warning' },
      { value: 3, label: '钻石', tagType: 'success' },
    ]
  },
  {
    type: 'text',
    prop: 'totalConsumption',
    align: 'right',
    show: true,
    label: '累计消费',
    width: 120,
    formatter: (row: any) => {
      return `¥${row.totalConsumption}`
    }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: [
      { value: 0, label: '禁用', tagType: 'danger' },
      { value: 1, label: '正常', tagType: 'success' },
    ]
  },
  {
    type: 'text',
    prop: 'createdAt',
    align: 'left',
    show: true,
    label: '注册时间',
    formatter: (row: any) => {
      return row.createdAt || '-'
    }
  },
  {
    type: 'slot',
    prop: 'actions',
    label: '操作',
    align: 'center',
    show: true,
    width: 280,
    fixed: 'right',
  },
]

// 请求函数：获取小程序用户列表
const requestMiniappUserList = async (params: any) => {
  try {
    const res = await miniappUserApi.getMiniappUserList({
      page: params.page || 1,
      pageSize: params.size || 10,
      nickname: params.nickname,
      phone: params.phone,
      status: params.status,
      memberLevel: params.memberLevel,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
    return {
      list: [],
      total: 0,
      page: params.page || 1,
      size: params.size || 10,
    }
  }
}

// 表格配置
const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestMiniappUserList,
  showPagination: true,
  showLoading: true,
  defaultPagination: { page: 1, size: 10 },
  options: {
    attributes: {
      stripe: true,
      highlightCurrentRow: true,
    },
  },
}

// KcConfig 配置
const kcConfig: KcConfig = {
  toolbar: {
    leftButtons: [],
  },
  search: {
    fields: [
      {
        key: 'nickname',
        label: '昵称',
        type: 'input',
        placeholder: '请输入昵称',
      },
      {
        key: 'phone',
        label: '手机号',
        type: 'input',
        placeholder: '请输入手机号',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        options: [
          { label: '禁用', value: 0 },
          { label: '正常', value: 1 },
        ],
      },
      {
        key: 'memberLevel',
        label: '会员等级',
        type: 'select',
        placeholder: '请选择会员等级',
        options: [
          { label: '普通', value: 0 },
          { label: '银卡', value: 1 },
          { label: '金卡', value: 2 },
          { label: '钻石', value: 3 },
        ],
      },
    ],
    defaultCount: 2,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true,
  },
  table: tableConfig,
}

// 表格引用
const tableRef = ref<InstanceType<typeof TableWithSlidePanel> & { refresh?: () => Promise<void> }>()

// 打开用户详情
const openUserDetail = (id: number, mode: 'edit' | 'view' = 'view') => {
  let title = '查看用户'
  if (mode === 'edit') {
    title = '编辑用户'
  }

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      id,
      mode,
    },
    width: 800,
    title,
    onClose: async (refresh?: boolean) => {
      if (refresh && tableRef.value?.refresh) {
        await tableRef.value.refresh()
      }
    },
  })
}

// 更新用户状态
const handleStatusChange = async (row: any) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    await miniappUserApi.updateUserStatus(row.id, newStatus)
    ElMessage.success(`${statusText}成功`)
    if (tableRef.value?.refresh) {
      await tableRef.value.refresh()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}
</script>

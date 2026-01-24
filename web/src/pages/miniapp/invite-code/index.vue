<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="danger" plain size="small" label="删除" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { miniappApi, type InviteCode } from '@/api/miniapp'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: ['selection', 'actions'],
  alwaysShow: []
}

// 状态选项
const statusOptions = [
  { label: '等待接受', value: 'pending', tagType: 'warning' },
  { label: '已接受', value: 'accepted', tagType: 'success' },
  { label: '已过期', value: 'expired', tagType: 'info' },
  { label: '已取消', value: 'cancelled', tagType: 'danger' },
]

// 基础列配置
const baseColumns = computed<ColumnProps[]>(() => [
  {
    type: 'selection',
    label: '选择',
    prop: 'selection',
    show: true,
    width: 50,
    align: 'center',
  },
  {
    type: 'text',
    label: 'ID',
    prop: 'id',
    show: true,
    width: 80,
    align: 'center',
  },
  {
    type: 'text',
    prop: 'code',
    align: 'left',
    show: true,
    label: '邀请码',
    width: 200,
    showOverflowTooltip: true,
  },
  {
    type: 'text',
    prop: 'inviter',
    align: 'left',
    show: true,
    label: '邀请者',
    width: 150,
    formatter: (row: any) => {
      return row.inviter?.nickname || `用户${row.inviterId}` || '-'
    }
  },
  {
    type: 'text',
    prop: 'accepter',
    align: 'left',
    show: true,
    label: '接受者',
    width: 150,
    formatter: (row: any) => {
      return row.accepter?.nickname || (row.acceptedBy ? `用户${row.acceptedBy}` : '-')
    }
  },
  {
    type: 'tag',
    prop: 'status',
    align: 'center',
    label: '状态',
    width: 120,
    show: true,
    options: statusOptions.map(opt => ({
      value: opt.value,
      label: opt.label,
      tagType: opt.tagType
    }))
  },
  {
    type: 'text',
    prop: 'expireTime',
    align: 'center',
    label: '过期时间',
    width: 180,
    formatter: (row: any) => {
      return row.expireTime ? new Date(row.expireTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    type: 'text',
    prop: 'acceptedAt',
    align: 'center',
    label: '接受时间',
    width: 180,
    formatter: (row: any) => {
      return row.acceptedAt ? new Date(row.acceptedAt).toLocaleString('zh-CN') : '-'
    }
  },
  {
    type: 'tag',
    prop: 'isShared',
    align: 'center',
    label: '是否已分享',
    width: 120,
    show: true,
    options: [
      { value: true, label: '是', tagType: 'success' },
      { value: false, label: '否', tagType: 'info' }
    ]
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
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 120
  }
])

// 请求函数
const requestInviteCodeList = async (params: any) => {
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size
  return await miniappApi.getInviteCodeList(requestParams)
}

// 响应适配器
const responseAdapter = (raw: any, params: any) => {
  return {
    list: raw.list || [],
    total: raw.total || 0,
    page: raw.page || params.page || 1,
    size: raw.pageSize || params.size || 10,
  }
}

// 表格配置
const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestInviteCodeList,
  responseAdapter: responseAdapter,
  defaultPagination: { page: 1, size: 10 },
  showPagination: true,
  showLoading: true,
  options: {
    attributes: {
      border: false,
      'row-key': 'id',
      stripe: true,
    },
  }
}

// 工具栏配置
const toolbarConfig = computed(() => ({
  leftButtons: [],
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
        key: 'code',
        label: '邀请码',
        type: 'input' as const,
        placeholder: '请输入邀请码',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: statusOptions
      },
      {
        key: 'inviterNickname',
        label: '邀请者昵称',
        type: 'input' as const,
        placeholder: '请输入邀请者昵称',
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

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该邀请码吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await miniappApi.deleteInviteCode(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

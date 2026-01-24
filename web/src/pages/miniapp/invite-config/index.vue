<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #image="{ row }">
      <el-image :src="getPreviewUrl(row.imageUrl)" :preview-src-list="[getPreviewUrl(row.imageUrl)]" fit="cover"
        style="width: 80px; height: 80px; border-radius: 4px;" :preview-teleported="true" />
    </template>
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" label="编辑" @click="() => openDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" label="查看" @click="() => openDetail(row.id, 'view')" />
        <CommonButton :type="row.isEnabled === 1 ? 'warning' : 'success'" plain size="small"
          :label="row.isEnabled === 1 ? '禁用' : '启用'" @click="() => handleToggle(row)" />
        <CommonButton type="danger" plain size="small" label="删除" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { miniappApi, type InviteConfig } from '@/api/miniapp'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPreviewUrl } from '@/utils/common'

// 列显示配置
const columnDisplayConfig = {
  hiddenWhenPanelOpen: ['selection', 'image', 'actions'],
  alwaysShow: []
}

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
    type: 'slot',
    prop: 'image',
    label: '图片',
    show: true,
    align: 'center',
    width: 120,
  },
  {
    type: 'text',
    prop: 'title',
    align: 'left',
    show: true,
    label: '标题',
    width: 200,
    showOverflowTooltip: true,
  },
  {
    type: 'tag',
    prop: 'isEnabled',
    align: 'center',
    label: '状态',
    width: 100,
    show: true,
    options: [
      { value: 1, label: '启用', tagType: 'success' },
      { value: 0, label: '禁用', tagType: 'info' }
    ]
  },
  {
    type: 'text',
    prop: 'sortOrder',
    align: 'center',
    label: '排序',
    width: 100,
    show: true,
  },
  {
    type: 'text',
    prop: 'remark',
    align: 'left',
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
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 280
  }
])

// 请求函数
const requestInviteConfigList = async (params: any) => {
  const requestParams = {
    ...params,
    pageSize: params.size || params.pageSize || 10,
  }
  delete requestParams.size
  return await miniappApi.getInviteConfigList(requestParams)
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
  request: requestInviteConfigList,
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
  leftButtons: [
    {
      key: 'add',
      label: '新增邀请信息',
      type: 'primary' as const,
      onClick: () => {
        openDetail()
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
        key: 'isEnabled',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 }
        ]
      },
    ],
    defaultCount: 1,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true
  },
  table: tableConfig
}))

const tableRef = ref()

const openDetail = (rowId?: number, type?: string) => {
  let title = '新增邀请信息'
  if (type === 'view') {
    title = '查看邀请信息'
  } else if (type === 'edit' || (rowId && !type)) {
    title = '编辑邀请信息'
  } else if (!rowId) {
    title = '新增邀请信息'
  }

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
    await ElMessageBox.confirm('确定要删除该邀请信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await miniappApi.deleteInviteConfig(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggle = async (row: InviteConfig) => {
  try {
    const newStatus = row.isEnabled === 1 ? 0 : 1
    const action = newStatus === 1 ? '启用' : '禁用'

    await ElMessageBox.confirm(`确定要${action}该邀请信息吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await miniappApi.toggleInviteConfigEnabled(row.id, { isEnabled: newStatus })
    ElMessage.success(`${action}成功`)
    await tableRef.value?.refresh()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}
</script>

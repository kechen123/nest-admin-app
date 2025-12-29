<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          @click="() => openOrderDetail(row.id, 'view')" />
        <CommonButton v-if="row.status === 1" type="primary" plain size="small" :label="'发货'"
          @click="() => handleShip(row.id)" />
        <CommonButton v-if="row.status === 0 || row.status === 1" type="warning" plain size="small" :label="'取消订单'"
          @click="() => handleCancel(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { orderApi } from '@/api/mall/order'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'

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
    prop: 'orderNo',
    align: 'left',
    show: true,
    label: '订单号',
    width: 180,
  },
  {
    type: 'text',
    prop: 'user',
    align: 'left',
    show: true,
    label: '用户',
    width: 150,
    formatter: (row: any) => {
      return row.user?.nickname || row.user?.phone || '-'
    }
  },
  {
    type: 'text',
    prop: 'payAmount',
    align: 'right',
    show: true,
    label: '实付金额',
    width: 120,
    formatter: (row: any) => {
      return `¥${row.payAmount}`
    }
  },
  {
    prop: 'status',
    label: '订单状态',
    type: 'tag',
    show: true,
    align: 'center',
    width: 120,
    options: [
      { value: 0, label: '待付款', tagType: 'warning' },
      { value: 1, label: '待发货', tagType: 'info' },
      { value: 2, label: '待收货', tagType: 'primary' },
      { value: 3, label: '已完成', tagType: 'success' },
      { value: 4, label: '已取消', tagType: 'danger' },
    ]
  },
  {
    prop: 'payType',
    label: '支付方式',
    type: 'tag',
    show: true,
    align: 'center',
    width: 120,
    options: [
      { value: 0, label: '未支付', tagType: 'info' },
      { value: 1, label: '微信支付', tagType: 'success' },
      { value: 2, label: '余额支付', tagType: 'primary' },
    ]
  },
  {
    type: 'text',
    prop: 'receiverName',
    align: 'center',
    show: true,
    label: '收货人',
    width: 100,
  },
  {
    type: 'text',
    prop: 'receiverPhone',
    align: 'left',
    show: true,
    label: '收货电话',
    width: 120,
  },
  {
    type: 'text',
    prop: 'createdAt',
    align: 'center',
    show: true,
    label: '创建时间',
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
    width: 350,
    fixed: 'right',
  },
]

// 请求函数：获取订单列表
const requestOrderList = async (params: any) => {
  try {
    const res = await orderApi.getOrderList({
      page: params.page || 1,
      pageSize: params.size || 10,
      orderNo: params.orderNo,
      userId: params.userId,
      status: params.status,
      payType: params.payType,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单列表失败')
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
  request: requestOrderList,
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
        key: 'orderNo',
        label: '订单号',
        type: 'input',
        placeholder: '请输入订单号',
      },
      {
        key: 'status',
        label: '订单状态',
        type: 'select',
        placeholder: '请选择订单状态',
        options: [
          { label: '待付款', value: 0 },
          { label: '待发货', value: 1 },
          { label: '待收货', value: 2 },
          { label: '已完成', value: 3 },
          { label: '已取消', value: 4 },
        ],
      },
      {
        key: 'payType',
        label: '支付方式',
        type: 'select',
        placeholder: '请选择支付方式',
        options: [
          { label: '未支付', value: 0 },
          { label: '微信支付', value: 1 },
          { label: '余额支付', value: 2 },
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

// 打开订单详情
const openOrderDetail = (id: number, mode: 'view' = 'view') => {
  tableRef.value?.openPanel({
    component: Detail,
    data: {
      id,
      mode,
    },
    width: 900,
    title: '订单详情',
    onClose: async (refresh?: boolean) => {
      if (refresh && tableRef.value?.refresh) {
        await tableRef.value.refresh()
      }
    },
  })
}

// 发货
const handleShip = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要发货吗？', '提示', {
      type: 'warning',
    })
    await orderApi.shipOrder(id)
    ElMessage.success('发货成功')
    if (tableRef.value?.refresh) {
      await tableRef.value.refresh()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  }
}

// 取消订单
const handleCancel = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning',
    })
    await orderApi.cancelOrder(id)
    ElMessage.success('取消成功')
    if (tableRef.value?.refresh) {
      await tableRef.value.refresh()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}
</script>

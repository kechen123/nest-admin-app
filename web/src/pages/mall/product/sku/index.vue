<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'" @click="() => openSkuDetail(row.id, 'edit')" />
        <CommonButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small"
          :label="row.status === 1 ? '禁用' : '启用'" @click="() => handleStatusChange(row)" />
        <CommonButton type="danger" plain size="small" :label="'删除'" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { productSkuApi } from '@/api/mall/product-sku'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'

// 从路由参数获取商品ID和规格ID
const route = useRoute()
const productId = computed(() => {
  const id = route.query.productId
  return id ? Number(id) : undefined
})
const skuIdFromQuery = computed(() => {
  const id = route.query.skuId
  return id ? Number(id) : undefined
})

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
    prop: 'skuCode',
    align: 'left',
    show: true,
    label: 'SKU编码',
    width: 200,
  },
  {
    type: 'text',
    prop: 'product',
    align: 'left',
    show: true,
    label: '商品',
    width: 200,
    formatter: (row: any) => {
      return row.product?.name || '-'
    }
  },
  {
    type: 'text',
    prop: 'specName',
    align: 'left',
    show: true,
    label: '规格名称',
    width: 200,
  },
  {
    type: 'text',
    prop: 'price',
    align: 'right',
    show: true,
    label: '价格',
    width: 120,
    formatter: (row: any) => {
      return `¥${row.price}`
    }
  },
  {
    type: 'text',
    prop: 'originalPrice',
    align: 'right',
    show: true,
    label: '原价',
    width: 120,
    formatter: (row: any) => {
      return row.originalPrice ? `¥${row.originalPrice}` : '-'
    }
  },
  {
    type: 'text',
    prop: 'stock',
    align: 'center',
    show: true,
    label: '库存',
    width: 100,
  },
  {
    type: 'text',
    prop: 'sales',
    align: 'center',
    show: true,
    label: '销量',
    width: 100,
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
      { value: 1, label: '启用', tagType: 'success' },
    ]
  },
  {
    type: 'slot',
    prop: 'actions',
    label: '操作',
    align: 'center',
    show: true,
    width: 250,
    fixed: 'right',
  },
]

// 请求函数：获取规格列表
const requestSkuList = async (params: any) => {
  try {
    const res = await productSkuApi.getSkuList({
      page: params.page || 1,
      pageSize: params.size || 10,
      productId: productId.value || params.productId,
      productName: params.productName, // 支持商品名称搜索
      status: params.status,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取规格列表失败')
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
  request: requestSkuList,
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
    leftButtons: [
      {
        key: 'add',
        label: '新增',
        type: 'primary',
        icon: 'Plus',
        onClick: () => {
          openSkuDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'productName',
        label: '商品名称',
        type: 'input',
        placeholder: '请输入商品名称搜索',
        hidden: computed(() => !!productId.value), // 如果从商品详情页进入，隐藏商品筛选
        value: route.query.productName,
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        options: [
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ],
      },
      {
        key: 'skuCode',
        label: 'SKU编码',
        type: 'input',
        placeholder: '请输入SKU编码搜索',
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

// 打开规格详情
const openSkuDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增规格'
  if (mode === 'view') {
    title = '查看规格'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑规格'
  } else if (!id) {
    title = '新增规格'
  }

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      id,
      mode,
      productId: productId.value,
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

// 更新规格状态
const handleStatusChange = async (row: any) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${statusText}该规格吗？`, '提示', {
      type: 'warning',
    })
    await productSkuApi.updateSkuStatus(row.id, newStatus)
    ElMessage.success(`${statusText}成功`)
    if (tableRef.value?.refresh) {
      await tableRef.value.refresh()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 删除规格
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该规格吗？', '提示', {
      type: 'warning',
    })
    await productSkuApi.deleteSku(id)
    ElMessage.success('删除成功')
    if (tableRef.value?.refresh) {
      await tableRef.value.refresh()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  console.log('所有路由：', skuIdFromQuery.value, productId.value)
  // 如果从商品详情页跳转过来并带有skuId，自动打开编辑面板
  if (skuIdFromQuery.value) {
    nextTick(() => {
      openSkuDetail(skuIdFromQuery.value, 'edit')
    })
  }
})
</script>

<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          :on-click="() => openProductDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          :on-click="() => openProductDetail(row.id, 'view')" />
        <CommonButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small"
          :label="row.status === 1 ? '下架' : '上架'" :on-click="() => handleStatusChange(row)" />
        <CommonButton type="danger" plain size="small" :label="'删除'" :on-click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { productApi } from '@/api/mall/product'
import { categoryApi } from '@/api/mall/category'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'

// 分类选项
const categoryOptions = ref<any[]>([])

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await categoryApi.getCategoryTree()
    const buildOptions = (categories: any[]): any[] => {
      const options: any[] = []
      categories.forEach(cat => {
        options.push({ label: cat.name, value: cat.id })
        if (cat.children && cat.children.length > 0) {
          buildOptions(cat.children).forEach(child => {
            options.push({ label: `  └─ ${child.label}`, value: child.value })
          })
        }
      })
      return options
    }
    categoryOptions.value = buildOptions(res as any)
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

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
    prop: 'name',
    align: 'left',
    show: true,
    label: '商品名称',
    width: 200,
  },
  {
    type: 'text',
    prop: 'category',
    align: 'left',
    show: true,
    label: '分类',
    width: 150,
    formatter: (row: any) => {
      return row.category?.name || '-'
    }
  },
  {
    type: 'text',
    prop: 'minPrice',
    align: 'left',
    show: true,
    label: '价格区间',
    formatter: (row: any) => {
      if (row.minPrice === row.maxPrice) {
        return `¥${row.minPrice}`
      }
      return `¥${row.minPrice} - ¥${row.maxPrice}`
    }
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
    type: 'text',
    prop: 'stock',
    align: 'center',
    show: true,
    label: '库存',
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
      { value: 0, label: '下架', tagType: 'danger' },
      { value: 1, label: '上架', tagType: 'success' },
    ]
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

// 请求函数：获取商品列表
const requestProductList = async (params: any) => {
  try {
    const res = await productApi.getProductList({
      page: params.page || 1,
      pageSize: params.size || 10,
      name: params.name,
      categoryId: params.categoryId,
      status: params.status,
      isRecommend: params.isRecommend,
      isNew: params.isNew,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品列表失败')
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
  request: requestProductList,
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
          openProductDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'name',
        label: '商品名称',
        type: 'input',
        placeholder: '请输入商品名称',
      },
      {
        key: 'categoryId',
        label: '分类',
        type: 'select',
        placeholder: '请选择分类',
        options: categoryOptions,
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        options: [
          { label: '下架', value: 0 },
          { label: '上架', value: 1 },
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

// 打开商品详情
const openProductDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增商品'
  if (mode === 'view') {
    title = '查看商品'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑商品'
  } else if (!id) {
    title = '新增商品'
  }

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      id,
      mode,
    },
    width: 900,
    title,
    onClose: async (refresh?: boolean) => {
      if (refresh && tableRef.value?.refresh) {
        await tableRef.value.refresh()
      }
    },
  })
}

// 更新商品状态
const handleStatusChange = async (row: any) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '上架' : '下架'
    await ElMessageBox.confirm(`确定要${statusText}该商品吗？`, '提示', {
      type: 'warning',
    })
    await productApi.updateProductStatus(row.id, newStatus)
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

// 删除商品
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning',
    })
    await productApi.deleteProduct(id)
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
  loadCategories()
})
</script>

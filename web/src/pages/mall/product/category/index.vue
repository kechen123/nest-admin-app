<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          @click="() => openCategoryDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          @click="() => openCategoryDetail(row.id, 'view')" />
        <CommonButton type="danger" plain size="small" :label="'删除'" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { categoryApi } from '@/api/mall/category'
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
    prop: 'name',
    align: 'left',
    show: true,
    label: '分类名称',
  },
  {
    type: 'text',
    prop: 'icon',
    align: 'left',
    show: true,
    label: '分类图标',
    formatter: (row: any) => {
      return row.icon || '-'
    }
  },
  {
    type: 'text',
    prop: 'parentId',
    align: 'center',
    show: true,
    label: '父分类ID',
    width: 120,
    formatter: (row: any) => {
      return row.parentId || 0
    }
  },
  {
    prop: 'orderNum',
    label: '显示顺序',
    type: 'text',
    align: 'center',
    show: true,
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
    width: 300,
    fixed: 'right',
  },
]

// 请求函数：获取分类列表
const requestCategoryList = async (params: any) => {
  try {
    const res = await categoryApi.getCategoryList({
      page: params.page || 1,
      pageSize: params.size || 10,
      name: params.name,
      parentId: params.parentId,
      status: params.status,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类列表失败')
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
  request: requestCategoryList,
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
          openCategoryDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'name',
        label: '分类名称',
        type: 'input',
        placeholder: '请输入分类名称',
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

// 打开分类详情
const openCategoryDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增分类'
  if (mode === 'view') {
    title = '查看分类'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑分类'
  } else if (!id) {
    title = '新增分类'
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

// 删除分类
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      type: 'warning',
    })
    await categoryApi.deleteCategory(id)
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
</script>

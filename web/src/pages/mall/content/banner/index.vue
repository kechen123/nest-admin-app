<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #image="{ row }">
      <el-image v-if="row.image" :src="row.image" :preview-src-list="[row.image]" fit="cover"
        style="width: 100px; height: 60px; border-radius: 4px;" :preview-teleported="true" />
      <span v-else style="color: #999;">暂无图片</span>
    </template>
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'" @click="() => openBannerDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          @click="() => openBannerDetail(row.id, 'view')" />
        <CommonButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small"
          :label="row.status === 1 ? '禁用' : '启用'" @click="() => handleStatusChange(row)" />
        <CommonButton type="danger" plain size="small" :label="'删除'" @click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { bannerApi } from '@/api/mall/banner'
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
    type: 'slot',
    prop: 'image',
    align: 'center',
    show: true,
    label: '图片',
    width: 120,
  },
  {
    type: 'text',
    prop: 'title',
    align: 'left',
    show: true,
    label: '标题',
  },
  {
    prop: 'linkType',
    label: '跳转类型',
    type: 'tag',
    show: true,
    align: 'center',
    width: 120,
    options: [
      { value: 0, label: '无', tagType: 'info' },
      { value: 1, label: '商品', tagType: 'success' },
      { value: 2, label: '分类', tagType: 'primary' },
      { value: 3, label: '链接', tagType: 'warning' },
    ]
  },
  {
    type: 'text',
    prop: 'linkValue',
    align: 'left',
    show: true,
    label: '跳转值',
    formatter: (row: any) => {
      return row.linkValue || '-'
    }
  },
  {
    prop: 'sortOrder',
    label: '排序',
    type: 'text',
    align: 'center',
    show: true,
    width: 80,
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

// 请求函数：获取轮播图列表
const requestBannerList = async (params: any) => {
  try {
    const res = await bannerApi.getBannerList({
      page: params.page || 1,
      pageSize: params.size || 10,
      title: params.title,
      status: params.status,
      linkType: params.linkType,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取轮播图列表失败')
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
  request: requestBannerList,
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
          openBannerDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'title',
        label: '标题',
        type: 'input',
        placeholder: '请输入标题',
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
        key: 'linkType',
        label: '跳转类型',
        type: 'select',
        placeholder: '请选择跳转类型',
        options: [
          { label: '无', value: 0 },
          { label: '商品', value: 1 },
          { label: '分类', value: 2 },
          { label: '链接', value: 3 },
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

// 打开轮播图详情
const openBannerDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增轮播图'
  if (mode === 'view') {
    title = '查看轮播图'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑轮播图'
  } else if (!id) {
    title = '新增轮播图'
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

// 更新轮播图状态
const handleStatusChange = async (row: any) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${statusText}该轮播图吗？`, '提示', {
      type: 'warning',
    })
    await bannerApi.updateBanner(row.id, { status: newStatus })
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

// 删除轮播图
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
      type: 'warning',
    })
    await bannerApi.deleteBanner(id)
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

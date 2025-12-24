<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          :on-click="() => openRoleDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          :on-click="() => openRoleDetail(row.id, 'view')" />
        <CommonButton type="danger" plain size="small" :label="'删除'" :on-click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { roleApi } from '@/api/role'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 字典选项
const statusOptions = ref<DictOption[]>([])
const dataScopeOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
    // 数据范围选项
    dataScopeOptions.value = [
      { label: '全部数据', value: '1' },
      { label: '自定义数据', value: '2' },
      { label: '本部门数据', value: '3' },
      { label: '本部门及以下数据', value: '4' },
      { label: '仅本人数据', value: '5' },
    ]
  } catch (error) {
    console.error('加载字典数据失败:', error)
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
    label: '角色名称',
    width: 150,
  },
  {
    prop: 'code',
    label: '角色代码',
    type: 'text',
    align: 'left',
    show: true,
    width: 250,
  },
  {
    prop: 'dataScope',
    label: '数据范围',
    type: 'tag',
    show: true,
    align: 'center',
    width: 250,
    options: [
      { value: '1', label: '全部数据', tagType: 'success' },
      { value: '2', label: '自定义数据', tagType: 'warning' },
      { value: '3', label: '本部门数据', tagType: 'info' },
      { value: '4', label: '本部门及以下数据', tagType: 'primary' },
      { value: '5', label: '仅本人数据', tagType: 'danger' },
    ],
    formatter: (row: any) => {
      const scopeMap: Record<string, string> = {
        '1': '全部数据',
        '2': '自定义数据',
        '3': '本部门数据',
        '4': '本部门及以下数据',
        '5': '仅本人数据',
      }
      return scopeMap[row.dataScope] || '-'
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
    width: 150,
    options: [
      { value: 0, label: '禁用', tagType: 'danger' },
      { value: 1, label: '正常', tagType: 'success' },
    ]
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'text',
    align: 'left',
    show: true,
    showOverflowTooltip: true,
    formatter: (row: any) => {
      return row.remark || '-'
    }
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

// 请求函数：获取角色列表
const requestRoleList = async (params: any) => {
  try {
    const res = await roleApi.getRoleList({
      page: params.page || 1,
      pageSize: params.size || 10,
      name: params.name,
      code: params.code,
      status: params.status,
    }) as any // axios拦截器已经返回了data字段，所以res就是PaginationResponse<Role>
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
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
  request: requestRoleList,
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
          openRoleDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'name',
        label: '角色名称',
        type: 'input',
        placeholder: '请输入角色名称',
      },
      {
        key: 'code',
        label: '角色代码',
        type: 'input',
        placeholder: '请输入角色代码',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        options: statusOptions,
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

// 打开角色详情
const openRoleDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  // 确定标题
  let title = '新增角色'
  if (mode === 'view') {
    title = '查看角色'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑角色'
  } else if (!id) {
    title = '新增角色'
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

// 删除角色
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      type: 'warning',
    })
    await roleApi.deleteRole(id)
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
  loadDicts()
})
</script>

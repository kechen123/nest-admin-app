<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          :on-click="() => openDepartmentDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          :on-click="() => openDepartmentDetail(row.id, 'view')" />
        <CommonButton type="danger" plain size="small" :label="'删除'" :on-click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { departmentApi } from '@/api/department'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 字典选项
const statusOptions = ref<DictOption[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
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
    label: '部门名称',
    width: 200,
  },
  {
    prop: 'leader',
    label: '负责人',
    type: 'text',
    align: 'left',
    show: true,
    width: 120,
    formatter: (row: any) => {
      return row.leader || '-'
    }
  },
  {
    prop: 'phone',
    label: '联系电话',
    type: 'text',
    align: 'left',
    show: true,
    width: 150,
    formatter: (row: any) => {
      return row.phone || '-'
    }
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'text',
    align: 'left',
    show: true,
    width: 200,
    formatter: (row: any) => {
      return row.email || '-'
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
      { value: 0, label: '停用', tagType: 'danger' },
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

// 请求函数：获取部门列表
const requestDepartmentList = async (params: any) => {
  try {
    const res = await departmentApi.getDepartmentList({
      page: params.page || 1,
      pageSize: params.size || 10,
      name: params.name,
      status: params.status,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取部门列表失败')
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
  request: requestDepartmentList,
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
          openDepartmentDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'name',
        label: '部门名称',
        type: 'input',
        placeholder: '请输入部门名称',
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

// 打开部门详情
const openDepartmentDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增部门'
  if (mode === 'view') {
    title = '查看部门'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑部门'
  } else if (!id) {
    title = '新增部门'
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

// 删除部门
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      type: 'warning',
    })
    await departmentApi.deleteDepartment(id)
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

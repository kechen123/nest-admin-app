<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <div class="actions-buttons">
        <CommonButton type="primary" plain size="small" :label="'编辑'"
          :on-click="() => openDictTypeDetail(row.id, 'edit')" />
        <CommonButton type="success" plain size="small" :label="'查看详情'"
          :on-click="() => openDictTypeDetail(row.id, 'view')" />
        <CommonButton type="danger" plain size="small" :label="'删除'" :on-click="() => handleDelete(row.id)" />
      </div>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { dictApi } from '@/api/dict'
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
    prop: 'dictName',
    align: 'left',
    show: true,
    label: '字典名称',
    width: 200,
  },
  {
    prop: 'dictType',
    label: '字典类型',
    type: 'text',
    align: 'left',
    show: true,
    width: 250,
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

// 请求函数：获取字典类型列表
const requestDictTypeList = async (params: any) => {
  try {
    const res = await dictApi.getDictTypeList({
      page: params.page || 1,
      pageSize: params.size || 10,
      dictName: params.dictName,
      dictType: params.dictType,
      status: params.status,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取字典类型列表失败')
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
  request: requestDictTypeList,
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
          openDictTypeDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'dictName',
        label: '字典名称',
        type: 'input',
        placeholder: '请输入字典名称',
      },
      {
        key: 'dictType',
        label: '字典类型',
        type: 'input',
        placeholder: '请输入字典类型',
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

// 打开字典类型详情
const openDictTypeDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增字典类型'
  if (mode === 'view') {
    title = '查看字典类型'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑字典类型'
  } else if (!id) {
    title = '新增字典类型'
  }

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      id,
      mode,
    },
    width: 600,
    title,
    onClose: async (refresh?: boolean) => {
      if (refresh && tableRef.value?.refresh) {
        await tableRef.value.refresh()
      }
    },
  })
}

// 删除字典类型
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典类型吗？', '提示', {
      type: 'warning',
    })
    await dictApi.deleteDictType(id)
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

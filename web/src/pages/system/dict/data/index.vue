<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openDictDataDetail(row.id, 'edit')">编辑</el-button>
      <el-button type="success" plain size="small" @click="openDictDataDetail(row.id, 'view')">查看详情</el-button>
      <el-button type="danger" plain size="small" @click="handleDelete(row.id)">删除</el-button>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { dictApi, type DictType } from '@/api/dict'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 字典选项
const statusOptions = ref<DictOption[]>([])
const dictTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    statusOptions.value = await getDictOptions('sys_normal_disable')
    // 加载字典类型列表
    const types = await dictApi.getAllDictTypes() as any
    dictTypeOptions.value = (types || []).map((item: DictType) => ({
      label: item.dictName,
      value: item.dictType,
    }))
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
    prop: 'dictType',
    label: '字典类型',
    type: 'text',
    align: 'left',
    show: true,
    width: 200,
  },
  {
    prop: 'dictLabel',
    label: '字典标签',
    type: 'text',
    align: 'left',
    show: true,
    width: 150,
  },
  {
    prop: 'dictValue',
    label: '字典键值',
    type: 'text',
    align: 'left',
    show: true,
    width: 150,
  },
  {
    prop: 'dictSort',
    label: '排序',
    type: 'text',
    align: 'center',
    show: true,
    width: 80,
  },
  {
    prop: 'isDefault',
    label: '是否默认',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: [
      { value: 0, label: '否', tagType: 'info' },
      { value: 1, label: '是', tagType: 'success' },
    ]
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

// 请求函数：获取字典数据列表
const requestDictDataList = async (params: any) => {
  try {
    const res = await dictApi.getDictDataList({
      page: params.page || 1,
      pageSize: params.size || 10,
      dictType: params.dictType,
      dictLabel: params.dictLabel,
      status: params.status,
    }) as any
    return {
      list: res.list || [],
      total: res.total || 0,
      page: res.page || params.page || 1,
      size: res.pageSize || params.size || 10,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取字典数据列表失败')
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
  request: requestDictDataList,
  showPagination: true,
  showLoading: true,
  defaultPagination: { page: 1, size: 10 },
  options: {
    attributes: {
      border: true,
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
          openDictDataDetail(undefined, 'add')
        },
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'dictType',
        label: '字典类型',
        type: 'select',
        placeholder: '请选择字典类型',
        options: computed(() => dictTypeOptions.value),
      },
      {
        key: 'dictLabel',
        label: '字典标签',
        type: 'input',
        placeholder: '请输入字典标签',
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

// 打开字典数据详情
const openDictDataDetail = (id?: number, mode: 'add' | 'edit' | 'view' = 'add') => {
  let title = '新增字典数据'
  if (mode === 'view') {
    title = '查看字典数据'
  } else if (mode === 'edit' || (id && mode === 'add')) {
    title = '编辑字典数据'
  } else if (!id) {
    title = '新增字典数据'
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

// 删除字典数据
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该字典数据吗？', '提示', {
      type: 'warning',
    })
    await dictApi.deleteDictData(id)
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

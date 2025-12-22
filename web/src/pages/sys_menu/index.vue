<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #avatar_url="{ row }">
      <el-avatar :size="50" shape="square" :src="row.avatar_url" />
    </template>
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openUserDetail(row.id, 'edit')">编辑</el-button>
      <el-button type="success" plain size="small" @click="openUserDetail(row.id, 'view')">查看详情</el-button>
      <el-button type="danger" plain size="small" @click="handleClick">删除</el-button>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { getMenuLis, getMenuTree } from '@/api/sys_menu'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import { useRouterStore } from '@/stores/router'
import type { KcConfig, TableConfig, ColumnProps, ButtonConfig } from '@/components/Kc/types'

const routerStore = useRouterStore()

// 选中的行数据
const selectedRows = ref<any[]>([])

const departmentList = ref<any[]>([])
const positionList = ref<any[]>([])

// 列显示配置
const columnDisplayConfig = {
  // 当右侧栏目打开时隐藏的列
  hiddenWhenPanelOpen: [
    'selection',
    'icon',
    'status',
    'visible',
    'actions',
  ],
  // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
  alwaysShow: [

  ]
}

// 基础列配置
const baseColumns: ColumnProps[] = [

  // {
  //   type: 'index',
  //   label: '序号',
  //   prop: 'index',
  //   show: true,
  //   treeNodeColumn: true,
  //   width: 80,
  //   align: 'center',
  // },
  {
    type: 'text',
    label: 'ID',
    treeNodeColumn: true,
    prop: 'id',
    show: true,
    width: 100,
    align: 'center',
  },
  {
    type: 'tag',
    prop: 'menu_type',
    align: 'center',
    label: '菜单类型',
    width: 160,
    show: true,
    options: [
      { value: 'M', label: '目录', tagType: 'primary' },
      { value: 'C', label: '菜单', tagType: 'success' },
    ]
  },
  {
    type: 'text',
    prop: 'menu_name',
    align: 'center',
    show: true,
    label: '菜单名称',
  },
  {
    prop: 'icon',
    label: '图标',
    type: 'text',
    show: true,
    align: 'center',
  },
  {
    label: '路由名称',
    prop: 'route_name',
    type: 'text',
    align: 'center',
    show: true,
    width: 150
  },
  {
    label: '路由路径',
    prop: 'path',
    type: 'text',
    align: 'center',
    show: true,
    width: 150
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    show: true,
    align: 'center',
    options: [
      { value: '0', label: '禁用', tagType: 'danger' },
      { value: '1', label: '启用', tagType: 'success' },
    ]
  },
  {
    prop: 'visible',
    label: '是否隐藏',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: [
      { value: '0', label: '显示', tagType: 'success' },
      { value: '1', label: '隐藏', tagType: 'danger' },
    ]
  },
  {
    label: '父级菜单ID',
    prop: 'parent_id',
    type: 'text',
    show: true,
    align: 'center',
  },
  {
    label: '排序',
    prop: 'order_num',
    type: 'text',
    show: true,
    align: 'center',
  },
  {
    label: '操作',
    prop: 'actions',
    show: true,
    type: 'slot',
    align: 'center',
    fixed: 'right',
    width: 240
  }
]

const tableConfig: TableConfig = {
  columns: baseColumns,

  request: getMenuTree,
  // defaultPagination: { page: 1, size: 10 },
  beforeRequest: (params: any) => {
    console.log('beforeRequest', params)
    //判断是否搜索 params参数除了page和size之外的参数是否为空
    const searchParams = Object.keys(params).filter(key => key !== 'page' && key !== 'size')
    if (searchParams.length > 0) {
      params.search = true
    }

    return params
  },
  showPagination: false,
  showLoading: true,
  options: {
    attributes: {
      border: false,
      'row-key': 'id',
      'tree-props': { children: 'children' },
      height: 'auto',
    },
    events: {
      onSelectionChange: (selection: any[]) => {
        console.log('onSelectionChange', selection)
        selectedRows.value = selection
      },
      onRowClick: (row: any, column: any, event: any) => {
        console.log('onRowClick', row, column, event)
      }
    }
  }
}

// 动态生成工具栏配置
const toolbarConfig = computed(() => ({
  leftButtons: [
    {
      key: 'add',
      label: '新增',
      type: 'primary' as const,
      onClick: (btn: ButtonConfig) => {
        console.log('新增按钮被点击', btn)
        // 这里可以添加新增用户的逻辑
        openUserDetail()
      }
    },
    {
      key: 'batchDelete',
      label: `批量删除${selectedRows.value.length > 0 ? `(${selectedRows.value.length})` : ''}`,
      type: 'danger' as const,
      disabled: selectedRows.value.length === 0, // 根据选中状态动态设置
      onClick: (btn: ButtonConfig) => {
        console.log('批量删除按钮被点击', btn)
        if (confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`)) {
          // 执行批量删除逻辑
          console.log('执行批量删除', selectedRows.value)
          // 这里可以调用API删除选中的用户
          selectedRows.value = [] // 清空选中状态
        }
      }
    }
  ],
  rightButtons: [
    {
      key: 'export',
      label: '更新菜单',
      type: 'success' as const,
      icon: 'Refresh',
      onClick: async (btn: ButtonConfig) => {
        console.log('导出按钮被点击', btn)
        const res = await routerStore.initMenu()
        if (res.status != 200) {
          ElMessage.error('更新菜单失败')
        } else {
          ElMessage.success('更新菜单成功')
        }
      }
    },
    {
      key: 'refresh',
      label: '刷新',
      type: 'info' as const,
      icon: 'Refresh',
      onClick: (btn: ButtonConfig) => {
        console.log('刷新按钮被点击', btn)
        // 刷新表格数据
        // 这里可以通过 ref 调用表格的刷新方法
      }
    }
  ]
}))

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'menu_type',
        label: '菜单类型',
        type: 'select' as const,
        placeholder: '请选择菜单类型',
        options: [
          { label: '目录', value: 'M' },
          { label: '菜单', value: 'C' }
        ]
      },
      {
        key: 'menu_name',
        label: '菜单名称',
        type: 'input' as const,
        placeholder: '请输入菜单名称',
      },
      {
        key: 'route_name',
        label: '路由名称',
        type: 'input' as const,
        placeholder: '请输入路由名称',
      },
      {
        key: 'path',
        label: '路由路径',
        type: 'input' as const,
        placeholder: '请输入路由路径',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' }
        ]
      },
      // {
      //   key: 'visible',
      //   label: '是否隐藏',
      //   type: 'select' as const,
      //   placeholder: '请选择',
      //   options: [
      //     { label: '显示', value: '0' },
      //     { label: '隐藏', value: '1' }
      //   ]
      // }
    ],
    defaultCount: 2,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true
  },
  table: tableConfig
}))

const tableRef = ref()

const openUserDetail = (rowId?: any, type?: string) => {
  tableRef.value.openPanel({
    component: Detail,
    data: {
      rowId,
      type,
      departmentList: departmentList.value,
      positionList: positionList.value
    },
    width: 600,
    title: '用户详情',
    onClose: async (refresh: boolean) => {
      console.log('关闭用户详情')
      if (refresh) {
        await tableRef.value.refresh()
      }
    }
  })
}

const handleClick = () => {
  console.log('click')
}

</script>

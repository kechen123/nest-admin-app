<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openMenuDetail(row.id, 'edit')">编辑</el-button>
      <el-button type="success" plain size="small" @click="openMenuDetail(row.id, 'view')">查看详情</el-button>
      <el-button type="danger" plain size="small" @click="handleDelete(row.id)">删除</el-button>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { getMenuTree, deleteMenu, type BackendMenu } from '@/api/sys_menu'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import { useRouterStore } from '@/stores/router'
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const routerStore = useRouterStore()

// 选中的行数据
const selectedRows = ref<BackendMenu[]>([])

// 菜单树数据（用于父级菜单选择）
const menuTree = ref<BackendMenu[]>([])

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
    type: 'text',
    prop: 'title',
    align: 'left',
    show: true,
    label: '菜单名称',
    width: 150,
  },
  {
    prop: 'icon',
    label: '图标',
    type: 'text',
    show: true,
    align: 'center',
    width: 100,
    formatter: (row: any) => {
      return row.icon || '-'
    }
  },
  {
    label: '路由路径',
    prop: 'path',
    type: 'text',
    align: 'left',
    show: true,
    width: 200,
    showOverflowTooltip: true,
    formatter: (row: any) => {
      return row.path || '-'
    }
  },
  {
    label: '组件路径',
    prop: 'component',
    type: 'text',
    align: 'left',
    show: true,
    width: 200,
    showOverflowTooltip: true,
    formatter: (row: any) => {
      return row.component || '-'
    }
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
    prop: 'isExternal',
    label: '外部链接',
    type: 'tag',
    show: true,
    align: 'center',
    width: 100,
    options: [
      { value: 0, label: '否', tagType: 'success' },
      { value: 1, label: '是', tagType: 'warning' },
    ]
  },
  {
    label: '权限代码',
    prop: 'permissionCode',
    type: 'text',
    align: 'left',
    show: true,
    width: 150,
    showOverflowTooltip: true,
    formatter: (row: any) => {
      return row.permissionCode || '-'
    }
  },
  {
    label: '父级菜单ID',
    prop: 'parentId',
    type: 'text',
    show: true,
    align: 'center',
    width: 120,
    formatter: (row: any) => {
      return row.parentId || '-'
    }
  },
  {
    label: '排序',
    prop: 'sort',
    type: 'text',
    show: true,
    align: 'center',
    width: 80,
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

// 过滤树形数据的辅助函数
const filterTree = (menus: BackendMenu[], filters: { name?: string; path?: string; status?: number }): BackendMenu[] => {
  if (!filters.name && !filters.path && filters.status === undefined) {
    return menus
  }

  const filterMenu = (menu: BackendMenu): BackendMenu | null => {
    // 检查当前菜单是否匹配搜索条件
    const matchName = !filters.name || (menu.title && menu.title.includes(filters.name))
    const matchPath = !filters.path || (menu.path && menu.path.includes(filters.path))
    const matchStatus = filters.status === undefined || menu.status === filters.status

    const currentMatch = matchName && matchPath && matchStatus

    // 递归过滤子菜单
    let filteredChildren: BackendMenu[] = []
    if (menu.children && menu.children.length > 0) {
      filteredChildren = menu.children
        .map(child => filterMenu(child))
        .filter((child): child is BackendMenu => child !== null)
    }

    // 如果当前菜单匹配或有匹配的子菜单，则保留
    if (currentMatch || filteredChildren.length > 0) {
      return {
        ...menu,
        children: filteredChildren.length > 0 ? filteredChildren : menu.children
      }
    }

    return null
  }

  return menus
    .map(menu => filterMenu(menu))
    .filter((menu): menu is BackendMenu => menu !== null)
}

// 请求函数：获取菜单数据（统一使用树形接口，前端过滤）
const requestMenuTree = async (params: any) => {
  // 统一使用 getMenuTree 接口获取树形数据
  const res = await getMenuTree() as any // axios拦截器已经返回了data字段，所以res就是BackendMenu[]
  let menuList: BackendMenu[] = res || []

  // 如果有搜索条件，在前端进行过滤
  if (params.name || params.path || params.status !== undefined) {
    menuList = filterTree(menuList, {
      name: params.name,
      path: params.path,
      status: params.status,
    })
  }

  // 计算总数（递归计算所有节点）
  const countNodes = (menus: BackendMenu[]): number => {
    let count = menus.length
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        count += countNodes(menu.children)
      }
    })
    return count
  }

  return {
    list: menuList,
    total: countNodes(menuList),
  }
}

const tableConfig: TableConfig = {
  columns: baseColumns,
  request: requestMenuTree,
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
        selectedRows.value = selection
      },
    }
  }
}

// 动态生成工具栏配置
const toolbarConfig = computed(() => ({
  leftButtons: [
    {
      key: 'add',
      label: '新增菜单',
      type: 'primary' as const,
      onClick: () => {
        openMenuDetail()
      }
    },
    {
      key: 'batchDelete',
      label: `批量删除${selectedRows.value.length > 0 ? `(${selectedRows.value.length})` : ''}`,
      type: 'danger' as const,
      disabled: selectedRows.value.length === 0,
      onClick: async () => {
        try {
          await ElMessageBox.confirm(
            `确定要删除选中的 ${selectedRows.value.length} 个菜单吗？`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )

          // 执行批量删除
          const deletePromises = selectedRows.value.map(menu => deleteMenu(menu.id))
          await Promise.all(deletePromises)

          ElMessage.success('批量删除成功')
          selectedRows.value = []
          await tableRef.value?.refresh()
          // 刷新菜单树
          await loadMenuTree()
        } catch (error) {
          if (error !== 'cancel') {
            ElMessage.error('批量删除失败')
          }
        }
      }
    }
  ],
  rightButtons: [
    {
      key: 'updateMenu',
      label: '更新菜单',
      type: 'success' as const,
      icon: 'Refresh',
      onClick: async () => {
        try {
          const res = await routerStore.initMenu()
          if (res.status != 200) {
            ElMessage.error('更新菜单失败')
          } else {
            ElMessage.success('更新菜单成功')
          }
        } catch {
          ElMessage.error('更新菜单失败')
        }
      }
    },
    {
      key: 'refresh',
      label: '刷新',
      type: 'info' as const,
      icon: 'Refresh',
      onClick: async () => {
        await tableRef.value?.refresh()
        await loadMenuTree()
        ElMessage.success('刷新成功')
      }
    }
  ]
}))

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'name',
        label: '菜单名称',
        type: 'input' as const,
        placeholder: '请输入菜单名称',
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
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 }
        ]
      },
    ],
    defaultCount: 2,
    fieldWidth: '250px',
    showSearch: true,
    showReset: true
  },
  table: tableConfig
}))

const tableRef = ref()

// 加载菜单树（用于父级菜单选择）
const loadMenuTree = async () => {
  try {
    const res = await getMenuTree() as any // axios拦截器已经返回了data字段，所以res就是BackendMenu[]
    menuTree.value = res || []
  } catch (error) {
    console.error('加载菜单树失败', error)
  }
}

onMounted(() => {
  // loadMenuTree()
})

const openMenuDetail = (rowId?: number, type?: string) => {
  // 确定标题：优先使用 type 参数，如果没有则根据 rowId 判断
  let title = '新增菜单'
  if (type === 'view') {
    title = '查看菜单'
  } else if (type === 'edit' || (rowId && !type)) {
    title = '编辑菜单'
  } else if (!rowId) {
    title = '新增菜单'
  }

  // 确定传递给组件的 type：如果没有指定，则根据 rowId 判断
  const finalType = type || (rowId ? 'edit' : 'create')

  tableRef.value?.openPanel({
    component: Detail,
    data: {
      rowId,
      type: finalType,
      menuTree: menuTree.value,
    },
    width: 600,
    title,
    onClose: async (refresh: boolean) => {
      if (refresh) {
        await tableRef.value?.refresh()
        // 刷新菜单树
        await loadMenuTree()
      }
    }
  })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteMenu(id)
    ElMessage.success('删除成功')
    await tableRef.value?.refresh()
    // 刷新菜单树
    await loadMenuTree()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

</script>

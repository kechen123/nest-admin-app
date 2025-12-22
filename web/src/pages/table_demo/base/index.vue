<template>
  <TableWithSlidePanel :config="kcConfig" :column-display-config="columnDisplayConfig" ref="tableRef">
    <template #avatar_url="{ row }">
      <el-avatar :size="50" shape="square" :src="row.avatar_url" />
    </template>
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openUserDetail(row.id)">编辑</el-button>
      <el-button type="success" plain size="small" @click="openUserDetail(row.id, 'view')">查看详情</el-button>
      <el-button type="danger" plain size="small" @click="handleClick">删除</el-button>
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
/**
 * 表格动态列显示功能说明：
 *
 * 当右侧栏目打开时，表格宽度会缩小，此时会自动隐藏一些列以优化显示效果。
 *
 * 使用方法：
 * 1. 在 columnDisplayConfig.hiddenWhenPanelOpen 数组中添加需要在右侧栏目打开时隐藏的列名
 * 2. 在 columnDisplayConfig.alwaysShow 数组中添加始终显示的列名（优先级高于隐藏列表）
 * 3. 列名对应的是 ColumnProps 中的 prop 属性值
 *
 * 示例：
 * - 隐藏手机号、邮箱等详细信息列
 * - 保持姓名、头像、操作等核心列始终显示
 *
 * 当右侧栏目关闭时，所有列都会恢复正常显示。
 */

import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { getList, getDepartment, getPosition } from '@/api/test'
import Detail from './_detail.vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import type { KcConfig, TableConfig, ColumnProps, ButtonConfig } from '@/components/Kc/types'

// 选中的行数据
const selectedRows = ref<any[]>([])

const departmentList = ref<any[]>([])
const positionList = ref<any[]>([])

// 列显示配置
const columnDisplayConfig = {
  // 当右侧栏目打开时隐藏的列
  hiddenWhenPanelOpen: [
    'phone',        // 手机号
    'email',        // 邮箱
    'age',          // 年龄
    'remark',       // 备注
    'role',         // 角色
    'is_verified',  // 是否已验证邮箱
    'login_count',  // 登录次数
    'last_login_time', // 最后登录时间
    'actions'       // 操作列
  ],
  // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
  alwaysShow: [
    'selection',    // 选择框
    'index',        // 序号
    'nickname',     // 姓名
    'username',     // 英文名
    'gender',       // 性别
    'avatar_url',   // 头像
    'status',       // 激活状态
    'position_id',  // 职位
    'department_id' // 部门
  ]
}

// 基础列配置
const baseColumns: ColumnProps[] = [
  {
    type: 'selection',
    show: true,
    width: 55,
  },
  {
    type: 'index',
    label: '序号',
    show: true,
    width: 80,
    align: 'center',
  },
  {
    type: 'text',
    prop: 'nickname',
    align: 'center',
    label: '姓名',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formatter: (row: any, _column: any, _cellValue: any, _index: number) => {
      return row.nickname + '（格式化）'
    },
    width: 160,
    show: true,
  },
  {
    type: 'text',
    prop: 'username',
    align: 'center',
    show: true,
    label: '英文名',
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'tag',
    show: true,
    align: 'center',
    options: [
      { value: 0, label: '未知', tagType: 'danger' },
      { value: 1, label: '男', tagType: 'primary' },
      { value: 2, label: '女', tagType: 'success' },
    ]
  },
  {
    label: '头像',
    prop: 'avatar_url',
    type: 'slot',
    align: 'center',
    show: true,
    width: 100
  },
  {
    prop: 'status',
    label: '激活',
    show: true,
    align: 'center',
    type: 'switch',
    options: {
      activeValue: 1,
      inactiveValue: 0,
      onChange: (val: any) => {
        console.log('change', val)
      }
    },
  },
  {
    prop: 'position_id',
    label: '职位',
    type: 'tag',
    show: true,
    align: 'center',
    width: 120,
    options: computed(() => positionList.value)
  },
  {
    type: 'text',
    prop: 'phone',
    label: '手机号',
    align: 'center',
    width: 160,
    show: true,
  },
  {
    type: 'text',
    prop: 'email',
    label: '邮箱',
    align: 'center',
    width: 160,
    show: true,
  },
  {
    type: 'text',
    prop: 'age',
    label: '年龄',
    align: 'center',
    show: true,
  },
  {
    prop: 'department_id',
    label: '部门',
    type: 'tag',
    show: true,
    align: 'center',
    options: computed(() => departmentList.value)
  },

  {
    type: 'text',
    prop: 'last_login_time',
    label: '最后登录时间',
    align: 'center',
    width: 200,
    show: true,
  },
  {
    type: 'text',
    prop: 'remark',
    label: '备注',
    align: 'center',
    show: true,
  },
  {
    type: 'text',
    prop: 'role',
    label: '角色',
    align: 'center',
    show: true,
  },
  {
    type: 'tag',
    prop: 'is_verified',
    label: '是否已验证邮箱',
    options: [
      { value: 0, label: '否', tagType: 'danger' },
      { value: 1, label: '是', tagType: 'primary' },
    ]
  },
  {
    type: 'text',
    prop: 'login_count',
    label: '登录次数',
    align: 'center',
    show: true,
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
  request: getList,
  defaultPagination: { page: 1, size: 2 },
  showPagination: true,
  showLoading: true,
  options: {
    attributes: {
      border: false,
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

const kcConfig = computed<KcConfig>(() => ({
  toolbar: toolbarConfig.value,
  search: {
    fields: [
      {
        key: 'username',
        label: '用户名',
        type: 'input' as const,
        placeholder: '请输入用户名',
      },
      {
        key: 'email',
        label: '邮箱',
        type: 'input' as const,
        placeholder: '请输入邮箱'
      },
      {
        key: 'phone',
        label: '手机号',
        type: 'input' as const,
        placeholder: '请输入手机号',
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
      {
        key: 'role',
        label: '角色',
        type: 'select' as const,
        placeholder: '请选择角色',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' }
        ]
      },
      {
        key: 'department',
        label: '部门',
        type: 'select' as const,
        placeholder: '请选择部门',
        options: [
          { label: '技术部', value: 'tech' },
          { label: '产品部', value: 'product' },
          { label: '运营部', value: 'operation' }
        ]
      }
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
    title: '用户详情'
  })
}

const handleClick = () => {
  console.log('click')
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
      label: '导出',
      type: 'success' as const,
      icon: 'Download',
      onClick: (btn: ButtonConfig) => {
        console.log('导出按钮被点击', btn)
        // 导出逻辑
        alert('导出功能')
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

onMounted(async () => {
  const res = await getDepartment()
  departmentList.value = res.data.map((item: any) => ({
    label: item.name,
    value: item.id
  }))
  const res2 = await getPosition()
  positionList.value = res2.data.map((item: any) => ({
    label: item.name,
    value: item.id
  }))
  console.log(departmentList.value, positionList.value)
})

</script>

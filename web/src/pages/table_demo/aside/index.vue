<template>
  <AsideContainer ref="containerRef" :asideWidth="350">
    <template #asideTitle>
      <div class="asideTitle">
        <h3>部门列表</h3>
        <el-button type="primary" plain size="small" @click="handleClearCheck" style="margin-top: 4px">重置</el-button>
      </div>
    </template>
    <template #asideBody>
      <div style="width: 100%;padding: 10px;">
        <el-tree ref="treeRef" style="max-width: 600px" :data="treeData" :props="treeDefaultProps"
          @node-click="handleCheck" />
      </div>
    </template>
    <Kc :config="kcConfig" ref="tableRef">
      <template #avatar_url="{ row }">
        <el-avatar :size="50" shape="square" :src="row.avatar_url" />
      </template>
      <template #actions="{ row }">
        <el-button type="primary" plain size="small" @click="openUserDetail(row.name)">编辑</el-button>
        <el-button type="success" plain size="small" @click="openUserDetail(row.name)">查看详情</el-button>
        <el-button type="danger" plain size="small" @click="handleClick">删除</el-button>
      </template>
    </Kc>
  </AsideContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { arrayToTree } from '@/utils/common'
import { getList, getDepartment, getPosition } from '@/api/test'
import type { KcConfig, TableConfig, ColumnProps, ButtonConfig } from '@/components/Kc/types'

import Detail from './_detail.vue'
import BtnList from './_btnList.vue'

const treeDefaultProps = {
  children: 'children',
  label: 'label',
}

const containerRef = ref()
const treeRef = ref()
const tableRef = ref()
// 选中的行数据
const selectedRows = ref<any[]>([])
const departmentList = ref<any[]>([])

const positionList = ref<any[]>([])

const columns: ColumnProps[] = [
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
  columns: columns,
  request: getList,
  defaultPagination: { page: 1, size: 1 },
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
        openUserDetail('new')
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

const treeData = computed(() => arrayToTree(departmentList.value, 'id', 'parent_id'))


const openUserDetail = (userId: string) => {
  containerRef.value.open({
    default: {
      component: Detail,
      props: {
        _userId: userId,
        _departmentList: departmentList.value,
        _positionList: positionList.value
      },
      width: 600,
      title: '用户详情',
      onClose: () => {
        console.log('onclose')
      }
    },
    footer: {
      component: BtnList,
      props: { userId },
      onClick: () => {
        console.log('onclose')
      }
    }
  })
}

const handleClick = () => {
  console.log('click')
}

const handleCheck = (data: any) => {
  if (data.children.length === 0) {
    tableRef.value.resetPagination()
    tableRef.value.setSearchParams({
      department_id: data.id
    })
    tableRef.value.fetchData()
  }
}

const handleClearCheck = () => {
  tableRef.value.resetPagination()
  tableRef.value.delSearchParams('department_id')
  tableRef.value.fetchData()
}

onMounted(async () => {
  const res = await getDepartment()
  departmentList.value = res.data.map((item: any) => ({
    ...item,
    label: item.name,
    value: item.id
  }))
  const res2 = await getPosition()
  positionList.value = res2.data.map((item: any) => ({
    ...item,
    label: item.name,
    value: item.id
  }))
})
</script>

<style lang="less" scoped>
.asideTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>

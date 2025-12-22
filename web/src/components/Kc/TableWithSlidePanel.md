# TableWithSlidePanel 组件

一个集成了表格和右侧栏目的组件，支持动态列显示功能。

## 功能特性

- 集成 Kc 表格组件
- 集成 SlideContainer 右侧栏目
- 当右侧栏目打开时，自动隐藏指定的列以优化显示效果
- 支持自定义列显示规则
- 简化的 API 接口

## 使用方法

### 基础用法

```vue
<template>
  <TableWithSlidePanel
    :config="kcConfig"
    :column-display-config="columnDisplayConfig"
    ref="tableRef"
  >
    <template #avatar_url="{ row }">
      <el-avatar :size="50" shape="square" :src="row.avatar_url" />
    </template>
    <template #actions="{ row }">
      <el-button type="primary" plain size="small" @click="openUserDetail(row.id)">编辑</el-button>
      <el-button type="success" plain size="small" @click="openUserDetail(row.id, 'view')"
        >查看详情</el-button
      >
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel.vue'
import Detail from './_detail.vue'
import type { KcConfig } from '@/components/Kc/types'

// 列显示配置
const columnDisplayConfig = {
  // 当右侧栏目打开时隐藏的列
  hiddenWhenPanelOpen: [
    'phone', // 手机号
    'email', // 邮箱
    'age', // 年龄
    'remark', // 备注
    'role', // 角色
    'is_verified', // 是否已验证邮箱
    'login_count', // 登录次数
    'last_login_time', // 最后登录时间
    'actions', // 操作列
  ],
  // 当右侧栏目打开时始终显示的列（优先级高于隐藏列表）
  alwaysShow: [
    'selection', // 选择框
    'index', // 序号
    'nickname', // 姓名
    'username', // 英文名
    'gender', // 性别
    'avatar_url', // 头像
    'status', // 激活状态
    'position_id', // 职位
    'department_id', // 部门
  ],
}

// Kc 配置
const kcConfig: KcConfig = {
  toolbar: {
    leftButtons: [
      {
        key: 'add',
        label: '新增',
        type: 'primary',
        onClick: () => openUserDetail(),
      },
    ],
  },
  search: {
    fields: [
      {
        key: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名',
      },
    ],
    defaultCount: 2,
    showSearch: true,
    showReset: true,
  },
  table: {
    columns: [
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
        label: '姓名',
        show: true,
      },
      // ... 更多列配置
    ],
    request: getList,
    defaultPagination: { page: 1, size: 50 },
    showPagination: true,
    showLoading: true,
  },
}

const tableRef = ref()

// 打开用户详情
const openUserDetail = (rowId?: any, type?: string) => {
  tableRef.value.openPanel({
    component: Detail,
    data: {
      rowId,
      type,
      // 其他数据
    },
    width: 600,
    title: '用户详情',
  })
}
</script>
```

## API

### Props

| 参数                | 类型     | 默认值 | 说明          |
| ------------------- | -------- | ------ | ------------- |
| config              | KcConfig | -      | Kc 组件的配置 |
| columnDisplayConfig | object   | {}     | 列显示配置    |

#### columnDisplayConfig

| 参数                | 类型     | 默认值 | 说明                                                     |
| ------------------- | -------- | ------ | -------------------------------------------------------- |
| hiddenWhenPanelOpen | string[] | []     | 当右侧栏目打开时隐藏的列名数组                           |
| alwaysShow          | string[] | []     | 当右侧栏目打开时始终显示的列名数组（优先级高于隐藏列表） |

### Methods

| 方法名     | 参数    | 返回值 | 说明         |
| ---------- | ------- | ------ | ------------ |
| openPanel  | options | void   | 打开右侧栏目 |
| closePanel | -       | void   | 关闭右侧栏目 |

#### openPanel 参数

| 参数      | 类型      | 默认值 | 说明             |
| --------- | --------- | ------ | ---------------- |
| component | Component | -      | 要显示的组件     |
| data      | object    | {}     | 传递给组件的数据 |
| width     | number    | 600    | 栏目宽度         |
| title     | string    | '详情' | 栏目标题         |
| onClose   | function  | -      | 关闭时的回调函数 |

### Events

组件会透传所有 Kc 组件的事件。

## 注意事项

1. 列名对应的是 `ColumnProps` 中的 `prop` 属性值
2. `alwaysShow` 的优先级高于 `hiddenWhenPanelOpen`
3. 当右侧栏目关闭时，所有列都会恢复正常显示
4. 组件会自动处理列的显示/隐藏逻辑，无需手动管理

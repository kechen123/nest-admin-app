# 表格页面开发

本文档详细介绍如何使用 Kc 组件库快速开发表格页面。

## 开发流程

开发一个完整的表格页面通常包括以下步骤：

1. **创建页面文件**：在 `src/pages/` 目录下创建页面文件
2. **定义 API 接口**：在 `src/api/` 目录下定义接口函数
3. **配置表格列**：定义表格列配置
4. **配置搜索表单**：定义搜索字段配置
5. **配置工具栏**：定义工具栏按钮
6. **实现业务逻辑**：实现增删改查等功能

## 快速开始

### 1. 创建页面文件

在 `src/pages/system/user/index.vue` 创建用户管理页面：

```vue
<template>
  <div class="user-page">
    <Kc :config="kcConfig" ref="kcRef">
      <!-- 自定义列插槽 -->
      <template #avatar="{ row }">
        <el-avatar :size="40" :src="row.avatar" />
      </template>
      
      <!-- 操作列插槽 -->
      <template #actions="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </Kc>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Kc from '@/components/Kc'
import type { KcConfig } from '@/components/Kc/types'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const kcRef = ref()

// 表格列配置
const baseColumns = [
  { type: 'index', label: '序号', width: 60 },
  { type: 'text', prop: 'username', label: '用户名', width: 120 },
  { type: 'slot', prop: 'avatar', label: '头像', width: 100 },
  { type: 'text', prop: 'email', label: '邮箱', width: 200 },
  { type: 'tag', prop: 'status', label: '状态', width: 100,
    options: [
      { value: 1, label: '启用', tagType: 'success' },
      { value: 0, label: '禁用', tagType: 'danger' },
    ],
  },
  { type: 'slot', prop: 'actions', label: '操作', width: 200, fixed: 'right' },
]

// 请求函数
const requestUserList = async (params: any) => {
  const res = await getUserList(params)
  return {
    list: res.list || [],
    total: res.total || 0,
    page: res.page || params.page || 1,
    size: res.size || params.size || 10,
  }
}

// 响应适配器（如果需要转换数据格式）
const responseAdapter = (raw: any, params: any) => {
  return {
    list: raw.list || [],
    total: raw.total || 0,
    page: raw.page || params.page || 1,
    size: raw.size || params.size || 10,
  }
}

// Kc 配置
const kcConfig = computed<KcConfig>(() => ({
  // 工具栏配置
  toolbar: {
    leftButtons: [
      {
        key: 'add',
        label: '新增',
        type: 'primary',
        icon: 'Plus',
        onClick: () => handleAdd(),
      },
      {
        key: 'batchDelete',
        label: '批量删除',
        type: 'danger',
        icon: 'Delete',
        onClick: () => handleBatchDelete(),
      },
    ],
  },
  
  // 搜索配置
  search: {
    fields: [
      {
        key: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名',
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    ],
    defaultCount: 2,
    showSearch: true,
    showReset: true,
  },
  
  // 表格配置
  table: {
    columns: baseColumns,
    request: requestUserList,
    responseAdapter: responseAdapter,
    defaultPagination: { page: 1, size: 10 },
    showPagination: true,
    showLoading: true,
    options: {
      attributes: {
        stripe: true,
        'row-key': 'id',
      },
      events: {
        onSelectionChange: (selection: any[]) => {
          selectedRows.value = selection
        },
      },
    },
  },
}))

// 选中行
const selectedRows = ref<any[]>([])

// 新增
const handleAdd = () => {
  // 打开新增对话框
  openUserDialog()
}

// 编辑
const handleEdit = (row: any) => {
  // 打开编辑对话框
  openUserDialog(row)
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning',
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    kcRef.value?.refresh()
  } catch (error) {
    // 用户取消
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
      type: 'warning',
    })
    // 批量删除逻辑
    ElMessage.success('删除成功')
    kcRef.value?.refresh()
  } catch (error) {
    // 用户取消
  }
}

// 打开用户对话框
const openUserDialog = (row?: any) => {
  // 对话框逻辑
}
</script>

<style scoped lang="less">
.user-page {
  padding: 20px;
}
</style>
```

### 2. 定义 API 接口

在 `src/api/user.ts` 中定义接口：

```typescript
import axios from '@/utils/http/axios'

export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  status: number
}

export interface UserListParams {
  page?: number
  size?: number
  username?: string
  status?: number
}

// 获取用户列表
export const getUserList = (params?: UserListParams) => {
  return axios.get('/user/list', { params })
}

// 创建用户
export const createUser = (data: Partial<User>) => {
  return axios.post('/user', data)
}

// 更新用户
export const updateUser = (id: number, data: Partial<User>) => {
  return axios.put(`/user/${id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return axios.delete(`/user/${id}`)
}
```

## 表格列配置详解

### 列类型

支持以下列类型：

#### text - 文本列

```typescript
{
  type: 'text',
  prop: 'username',
  label: '用户名',
  width: 120,
  align: 'left',
  formatter: (row) => {
    return row.username || '-'
  },
}
```

#### tag - 标签列

```typescript
{
  type: 'tag',
  prop: 'status',
  label: '状态',
  options: [
    { value: 1, label: '启用', tagType: 'success' },
    { value: 0, label: '禁用', tagType: 'danger' },
  ],
}
```

#### slot - 插槽列

```typescript
{
  type: 'slot',
  prop: 'avatar',
  label: '头像',
}
```

在模板中使用：

```vue
<template #avatar="{ row }">
  <el-avatar :size="40" :src="row.avatar" />
</template>
```

#### index - 序号列

```typescript
{
  type: 'index',
  label: '序号',
  width: 60,
}
```

#### selection - 选择列

```typescript
{
  type: 'selection',
  width: 55,
}
```

### 列属性

常用列属性：

```typescript
{
  prop: 'username',              // 字段名
  label: '用户名',                // 列标题
  width: 120,                    // 列宽度（数字或字符串）
  minWidth: 100,                 // 最小宽度
  align: 'left',                 // 对齐方式：left/center/right
  fixed: 'right',               // 固定列：left/right
  show: true,                    // 是否显示
  showOverflowTooltip: true,     // 超出显示提示
  formatter: (row) => {},        // 格式化函数
}
```

## 搜索表单配置

### 字段类型

#### input - 输入框

```typescript
{
  key: 'username',
  label: '用户名',
  type: 'input',
  placeholder: '请输入用户名',
  clearable: true,
}
```

#### select - 下拉选择

```typescript
{
  key: 'status',
  label: '状态',
  type: 'select',
  placeholder: '请选择状态',
  options: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ],
  clearable: true,
}
```

#### 动态选项

使用 `computed` 实现动态选项：

```typescript
import { computed } from 'vue'

const statusOptions = computed(() => [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
])

const searchConfig = {
  fields: [
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: statusOptions, // 使用 computed
    },
  ],
}
```

### 搜索配置

```typescript
search: {
  fields: [],                  // 搜索字段数组
  defaultCount: 2,            // 默认显示字段数
  fieldWidth: '250px',        // 字段宽度
  showSearch: true,           // 显示搜索按钮
  showReset: true,            // 显示重置按钮
  showExpand: true,           // 显示展开/收起按钮
}
```

## 工具栏配置

### 按钮配置

```typescript
toolbar: {
  leftButtons: [
    {
      key: 'add',              // 按钮唯一标识
      label: '新增',            // 按钮文本
      type: 'primary',          // 按钮类型
      icon: 'Plus',             // 图标名称
      size: 'default',          // 按钮大小
      disabled: false,         // 是否禁用
      onClick: () => {},       // 点击事件
    },
  ],
  rightButtons: [],           // 右侧按钮
}
```

### 权限控制

结合 `PermissionButton` 组件实现权限控制：

```typescript
import { hasPermission } from '@/utils/permission'

toolbar: {
  leftButtons: [
    ...(hasPermission('system:user:add') ? [{
      key: 'add',
      label: '新增',
      type: 'primary',
      onClick: () => handleAdd(),
    }] : []),
  ],
}
```

## 请求处理

### 请求函数

请求函数需要返回符合以下格式的数据：

```typescript
const requestUserList = async (params: any) => {
  const res = await getUserList(params)
  return {
    list: res.list || [],      // 数据列表
    total: res.total || 0,     // 总条数
    page: res.page || 1,       // 当前页
    size: res.size || 10,      // 每页条数
  }
}
```

### 响应适配器

如果后端返回的数据格式不同，可以使用响应适配器：

```typescript
const responseAdapter = (raw: any, params: any) => {
  return {
    list: raw.data?.records || [],
    total: raw.data?.total || 0,
    page: params.page || 1,
    size: params.size || 10,
  }
}

const tableConfig = {
  request: requestUserList,
  responseAdapter: responseAdapter,
}
```

### 请求前处理

使用 `beforeRequest` 处理请求参数：

```typescript
const tableConfig = {
  request: requestUserList,
  beforeRequest: (params: any) => {
    // 转换参数格式
    return {
      ...params,
      pageSize: params.size,  // 后端使用 pageSize
    }
  },
}
```

## 表格操作

### 刷新表格

```typescript
// 刷新当前页
kcRef.value?.refresh()

// 重置到第一页并刷新
kcRef.value?.resetPagination()
kcRef.value?.refresh()
```

### 获取选中行

```typescript
const selectedRows = kcRef.value?.getSelectedRows() || []
```

### 设置搜索参数

```typescript
// 设置搜索参数
kcRef.value?.setSearchParams({
  username: 'test',
  status: 1,
})

// 重置搜索参数
kcRef.value?.resetSearchParams()

// 删除指定搜索参数
kcRef.value?.delSearchParams('username')
```

### 获取请求参数

```typescript
const params = kcRef.value?.getRequestParams()
// 返回：{ page: 1, size: 10, username: 'test', ... }
```

## 表格+侧边栏模式

使用 `TableWithSlidePanel` 组件实现表格+右侧详情面板：

```vue
<template>
  <TableWithSlidePanel 
    :table-config="tableConfig"
    :panel-config="panelConfig"
    ref="tableRef"
  >
    <!-- 表格操作列 -->
    <template #actions="{ row }">
      <el-button @click="openDetail(row)">详情</el-button>
    </template>
    
    <!-- 侧边栏内容 -->
    <template #panel="{ row }">
      <UserDetail :user-id="row.id" @success="handleSuccess" />
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel'
import UserDetail from './_detail.vue'

const tableRef = ref()

const panelConfig = {
  title: '用户详情',
  width: '600px',
}

const openDetail = (row: any) => {
  tableRef.value?.openPanel(row)
}

const handleSuccess = () => {
  tableRef.value?.closePanel()
  tableRef.value?.refresh()
}
</script>
```

## 最佳实践

### 1. 列配置复用

将常用的列配置提取为常量：

```typescript
// utils/tableColumns.ts
export const commonColumns = {
  index: { type: 'index', label: '序号', width: 60 },
  actions: { type: 'slot', prop: 'actions', label: '操作', width: 200, fixed: 'right' },
}

// 在页面中使用
const columns = [
  commonColumns.index,
  { type: 'text', prop: 'name', label: '名称' },
  commonColumns.actions,
]
```

### 2. 统一错误处理

在请求函数中统一处理错误：

```typescript
const requestUserList = async (params: any) => {
  try {
    const res = await getUserList(params)
    return {
      list: res.list || [],
      total: res.total || 0,
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
    return {
      list: [],
      total: 0,
    }
  }
}
```

### 3. 使用 TypeScript

使用 TypeScript 确保类型安全：

```typescript
import type { KcConfig, TableConfig, ColumnProps } from '@/components/Kc/types'

const columns: ColumnProps[] = [
  // 列配置
]

const tableConfig: TableConfig = {
  // 表格配置
}
```

### 4. 响应式配置

使用 `computed` 实现响应式配置：

```typescript
const kcConfig = computed<KcConfig>(() => ({
  toolbar: {
    leftButtons: [
      ...(hasPermission('system:user:add') ? [{
        key: 'add',
        label: '新增',
        onClick: () => handleAdd(),
      }] : []),
    ],
  },
  // ...
}))
```

### 5. 代码组织

将配置和逻辑分离：

```typescript
// 配置
const tableConfig = { /* ... */ }
const searchConfig = { /* ... */ }
const toolbarConfig = { /* ... */ }

// 逻辑
const handleAdd = () => { /* ... */ }
const handleEdit = (row: any) => { /* ... */ }
const handleDelete = (row: any) => { /* ... */ }
```

## 常见问题

### 1. 表格不刷新

确保使用 `ref` 获取组件实例：

```typescript
const kcRef = ref()

// 刷新
kcRef.value?.refresh()
```

### 2. 搜索参数不生效

检查搜索字段的 `key` 是否与后端接口参数名一致。

### 3. 分页参数格式不对

使用 `beforeRequest` 转换参数格式：

```typescript
beforeRequest: (params: any) => {
  return {
    ...params,
    pageSize: params.size,
  }
}
```

### 4. 选中行数据丢失

确保表格配置了 `row-key`：

```typescript
options: {
  attributes: {
    'row-key': 'id',
  },
}
```

## 下一步

- 查看 [组件使用](./components.md) 了解更多组件用法
- 查看 [项目配置](./configuration.md) 了解相关配置
- 查看实际页面示例：`src/pages/system/user/index.vue`


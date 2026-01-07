# 组件使用

本文档介绍项目中常用组件的使用方法和最佳实践。

## 组件概览

项目提供了丰富的组件库，主要包括：

- **Kc 组件库**：业务组件库，包含表格、搜索、工具栏等
- **Layout 组件**：布局相关组件
- **功能组件**：ECharts、图片上传、图标选择器等

## Kc 组件库

Kc 是基于业务场景封装的组件库，提供快速搭建列表页的能力。

### 组件清单

- `Kc`：组合页组件，内置搜索、工具栏、表格
- `KcSearch`：搜索表单组件
- `KcToolbar`：工具栏按钮组件
- `KcTable`：数据表格组件
- `TableWithSlidePanel`：集成右侧滑出面板的表格

### Kc 组合组件

`Kc` 是最常用的组件，集成了搜索、工具栏和表格功能。

#### 基础使用

```vue
<template>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Kc from '@/components/Kc'
import type { KcConfig } from '@/components/Kc/types'
import { getUserList } from '@/api/user'

const kcRef = ref()

const kcConfig: KcConfig = {
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
    ],
    rightButtons: [
      {
        key: 'export',
        label: '导出',
        onClick: () => handleExport(),
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
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    ],
    defaultCount: 2,        // 默认显示字段数
    showSearch: true,      // 显示搜索按钮
    showReset: true,       // 显示重置按钮
  },
  
  // 表格配置
  table: {
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { type: 'text', prop: 'username', label: '用户名', width: 120 },
      { type: 'slot', prop: 'avatar', label: '头像', width: 100 },
      { type: 'tag', prop: 'status', label: '状态', width: 100, 
        options: [
          { value: 1, label: '启用', tagType: 'success' },
          { value: 0, label: '禁用', tagType: 'danger' },
        ],
      },
      { type: 'slot', prop: 'actions', label: '操作', width: 200, fixed: 'right' },
    ],
    request: getUserList,
    defaultPagination: { page: 1, size: 10 },
    showPagination: true,
    showLoading: true,
  },
}

// 刷新表格
const refresh = () => {
  kcRef.value?.refresh()
}

// 获取选中行
const getSelectedRows = () => {
  return kcRef.value?.getSelectedRows() || []
}
</script>
```

#### 配置说明

**toolbar 配置**：

```typescript
toolbar: {
  leftButtons: [          // 左侧按钮
    {
      key: 'add',          // 按钮唯一标识
      label: '新增',        // 按钮文本
      type: 'primary',      // 按钮类型
      icon: 'Plus',         // 图标名称
      onClick: () => {},    // 点击事件
    },
  ],
  rightButtons: [],        // 右侧按钮
}
```

**search 配置**：

```typescript
search: {
  fields: [                // 搜索字段
    {
      key: 'username',     // 字段名
      label: '用户名',      // 标签
      type: 'input',        // 字段类型
      placeholder: '请输入',
      options: [],          // 选项（select 类型需要）
    },
  ],
  defaultCount: 2,         // 默认显示字段数
  fieldWidth: '250px',     // 字段宽度
  showSearch: true,        // 显示搜索按钮
  showReset: true,         // 显示重置按钮
}
```

**table 配置**：

```typescript
table: {
  columns: [               // 表格列配置
    {
      type: 'text',         // 列类型：text/tag/slot/index
      prop: 'username',     // 字段名
      label: '用户名',      // 列标题
      width: 120,          // 列宽度
      align: 'left',        // 对齐方式
      fixed: 'right',       // 固定列
      formatter: (row) => {}, // 格式化函数
    },
  ],
  request: fetchList,       // 请求函数
  responseAdapter: (raw) => ({ list: raw.list, total: raw.total }), // 响应适配器
  defaultPagination: { page: 1, size: 10 }, // 默认分页
  showPagination: true,     // 显示分页
  showLoading: true,        // 显示加载状态
}
```

### KcTable 表格组件

独立使用表格组件：

```vue
<template>
  <KcTable :config="tableConfig">
    <template #actions="{ row }">
      <el-button @click="handleEdit(row)">编辑</el-button>
    </template>
  </KcTable>
</template>

<script setup lang="ts">
import KcTable from '@/components/Kc/Table'
import type { TableConfig } from '@/components/Kc/types'

const tableConfig: TableConfig = {
  columns: [
    { type: 'text', prop: 'name', label: '名称' },
    { type: 'slot', prop: 'actions', label: '操作' },
  ],
  request: fetchList,
}
</script>
```

### TableWithSlidePanel 表格+侧边栏

集成右侧滑出面板的表格组件：

```vue
<template>
  <TableWithSlidePanel 
    :table-config="tableConfig"
    :panel-config="panelConfig"
    ref="tableRef"
  >
    <!-- 表格插槽 -->
    <template #actions="{ row }">
      <el-button @click="openDetail(row)">详情</el-button>
    </template>
    
    <!-- 侧边栏内容 -->
    <template #panel="{ row }">
      <UserDetail :user-id="row.id" />
    </template>
  </TableWithSlidePanel>
</template>

<script setup lang="ts">
import TableWithSlidePanel from '@/components/Kc/TableWithSlidePanel'

const tableRef = ref()

const panelConfig = {
  title: '用户详情',
  width: '600px',
}
</script>
```

## Layout 布局组件

### Header 顶部导航

顶部导航栏组件，包含 Logo、菜单、用户信息等。

### Aside 侧边栏

侧边栏菜单组件，支持多级菜单和权限控制。

### Tags 标签页

页面标签页组件，用于快速切换已打开的页面。

## 功能组件

### Echarts 图表组件

封装了 ECharts 的 Vue 组件：

```vue
<template>
  <Echarts :option="chartOption" :height="400" />
</template>

<script setup lang="ts">
import Echarts from '@/components/Echarts'
import { ref } from 'vue'

const chartOption = ref({
  title: { text: '示例图表' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'bar' }],
})
</script>
```

### ImageUpload 图片上传

图片上传组件，支持预览、裁剪等功能：

```vue
<template>
  <ImageUpload v-model="imageUrl" :limit="1" />
</template>

<script setup lang="ts">
import ImageUpload from '@/components/ImageUpload'
import { ref } from 'vue'

const imageUrl = ref('')
</script>
```

### IconPicker 图标选择器

图标选择器组件，用于选择 Element Plus 图标：

```vue
<template>
  <IconPicker v-model="iconName" />
</template>

<script setup lang="ts">
import IconPicker from '@/components/IconPicker'
import { ref } from 'vue'

const iconName = ref('')
</script>
```

### PermissionButton 权限按钮

带权限控制的按钮组件：

```vue
<template>
  <PermissionButton permission="system:user:add" @click="handleAdd">
    新增
  </PermissionButton>
</template>

<script setup lang="ts">
import PermissionButton from '@/components/PermissionButton'
</script>
```

## 组件使用最佳实践

### 1. 优先使用项目组件

项目提供的组件已经过优化和测试，优先使用项目组件而非第三方组件。

### 2. 查看组件文档

每个组件都有对应的 README 文档，使用前请仔细阅读：
- `src/components/Kc/README.md`
- `src/components/Kc/TableWithSlidePanel.md`
- `src/components/PermissionButton/README.md`

### 3. 合理使用插槽

组件提供了丰富的插槽，可以自定义内容：

```vue
<Kc :config="config">
  <!-- 自定义列内容 -->
  <template #customColumn="{ row }">
    <CustomContent :data="row" />
  </template>
</Kc>
```

### 4. 组件组合使用

多个组件可以组合使用，实现复杂功能：

```vue
<template>
  <div>
    <KcToolbar :config="toolbarConfig" />
    <KcSearch :config="searchConfig" @search="handleSearch" />
    <KcTable :config="tableConfig" />
  </div>
</template>
```

### 5. 类型安全

使用 TypeScript 确保类型安全：

```typescript
import type { KcConfig, TableConfig } from '@/components/Kc/types'

const config: KcConfig = {
  // 配置项
}
```

## 组件扩展

### 创建自定义组件

在 `src/components/` 目录下创建新组件：

```vue
<!-- src/components/CustomComponent/index.vue -->
<template>
  <div class="custom-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped lang="less">
.custom-component {
  // 组件样式
}
</style>
```

### 组件注册

组件会自动注册（通过 `unplugin-vue-components`），无需手动导入：

```vue
<template>
  <!-- 直接使用，无需 import -->
  <CustomComponent />
</template>
```

## 下一步

- 查看 [表格页面开发](./table-development.md) 了解如何使用组件开发页面
- 查看 [项目配置](./configuration.md) 了解组件相关配置


# Kc 组件库说明

基于业务场景封装的表格/搜索/工具栏一体化组件，提供快速搭建列表页的能力，并可与 Slide Panel 联动。

## 组件清单

- `Kc`（默认导出 `index.vue`）：组合页，内置搜索、工具栏、表格。
- `KcSearch`：搜索表单，支持字段配置与默认值。
- `KcToolbar`：工具栏按钮区，支持左右插槽。
- `KcTable`：数据表格，支持分页、远程请求、插槽列。
- `TableWithSlidePanel`：集成右侧滑出面板的表格（见同目录 `TableWithSlidePanel.md`）。

## 快速使用

```vue
<template>
  <Kc :config="kcConfig" ref="kcRef">
    <template #avatar="{ row }">
      <el-avatar :size="40" :src="row.avatar" />
    </template>
    <template #actions="{ row }">
      <el-button size="small" @click="openDetail(row)">详情</el-button>
    </template>
  </Kc>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Kc from '@/components/Kc'
import type { KcConfig } from '@/components/Kc/types'

const kcRef = ref()

const kcConfig: KcConfig = {
  toolbar: {
    leftButtons: [{ key: 'add', label: '新增', type: 'primary', onClick: () => openDetail() }],
  },
  search: {
    fields: [
      { key: 'username', label: '用户名', type: 'input', placeholder: '请输入用户名' },
      { key: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }] },
    ],
    defaultCount: 2,
    showSearch: true,
    showReset: true,
  },
  table: {
    columns: [
      { type: 'index', label: '序号', width: 60 },
      { type: 'text', prop: 'username', label: '用户名' },
      { type: 'slot', prop: 'avatar', label: '头像' },
      { type: 'slot', prop: 'actions', label: '操作', width: 160 },
    ],
    request: fetchList, // 返回 Promise<{ list:any[]; total:number }>
    defaultPagination: { page: 1, size: 20 },
    showPagination: true,
    showLoading: true,
  },
}

const fetchList = async (params: any) => {
  // 这里调用后端接口
  return { list: [], total: 0 }
}

const openDetail = (row?: any) => {
  // 自定义逻辑
}
</script>
```

## 核心配置（`KcConfig` 摘要）

- `toolbar`：按钮配置，支持左右区域、点击回调、权限控制等。
- `search`：字段数组（`key`、`label`、`type`、`options` 等），支持联动事件与重置。
- `table`：
  - `columns`：列定义（类型 `text/slot/index/selection` 等）。
  - `request(params)`：返回 `{ list, total }` 的异步函数；组件自动处理分页和 loading。
  - `defaultPagination` / `showPagination` / `showLoading` 等。

详细类型请查看 `types.ts`。

## 事件

`Kc`（index.vue）对外触发：
- `toolbarClick(btn)`：当按钮被点击（除自身 onClick 外的透传事件）。
- `search(data)`：搜索表单提交。
- `reset()`：搜索重置。
- `searchChange(key, value)`：单个字段变更。

表格事件（如行选择、排序）透传自 `KcTable`，可在对应组件上监听。

## 暴露方法（`ref`）

- `tableRef`：内部表格实例。
- `fetchData()` / `refresh()`：重新请求数据。
- `resetPagination()`：重置到第一页。
- `setSearchParams(params)` / `resetSearchParams()`：设置/清空搜索参数。
- `getRequestParams()`：返回当前分页+搜索参数。
- `delSearchParams(key)`：删除指定搜索参数。

## TableWithSlidePanel

若需要列表 + 右侧详情联动，使用 `TableWithSlidePanel`：
- 文档：`TableWithSlidePanel.md`
- 内部已集成 `SlideContainer`，可调用 `openPanel` / `closePanel`。
- 与 slide-panel 模块的联动示例见 `slide-panel/README.md`。

## 最佳实践

- 列 `prop` 应与后端字段一致，便于复用隐藏/显示规则。
- 在 `request` 中统一处理错误（可结合 `@/utils/http/axios` 的错误处理）。
- 复杂搜索项可使用自定义插槽（字段类型设为 `slot`），在 `#fieldKey` 中渲染。
- 表格插槽命名与列 `prop` 对应，例如列 `prop: 'avatar'` 对应 `#avatar`。


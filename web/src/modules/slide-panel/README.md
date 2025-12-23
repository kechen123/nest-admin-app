# Slide Panel 模块说明

用于在页面右侧快速打开滑出面板，支持内容区域/右栏自适应宽度、拖拽调整、统一数据传递与生命周期钩子。

## 组件与安装

- `SlideContainer`：核心容器，负责右栏滑出、数据下发与布局计算。
- `AsideContainer`：在左侧附带可折叠的辅助栏，并内置一个 `SlideContainer`。

全局注册（建议在模块入口）：

```ts
import slidePanel from '@/modules/slide-panel'
app.use(slidePanel)
// 或按需：app.component('SlideContainer', SlideContainer)
```

## SlideContainer API

### 插槽

- 默认插槽：主内容区域。

### 暴露方法（`ref` 获取）

| 方法 | 说明 |
| ---- | ---- |
| `open(options)` | 打开右侧面板 |
| `close(value?)` | 关闭右侧面板并传递可选值给 `onClose` |
| `updateContentLayout()` | 手动触发布局重新计算 |

#### `open(options)` 参数

```ts
open({
  default: {
    component,          // 必填，右侧要渲染的组件
    props?,             // 传给组件的 props
    method?: 'init',    // 组件暴露的方法名，默认 init
    data?: object,      // 统一透传给组件的方法参数
    width?: number,     // 右栏宽度，默认 400
    title?: string,     // 右栏标题，默认“详情”
    onOpen?: () => void,// 动画完成后触发
    onClose?: (v:any)=>void // 关闭时回调
  }
})
```

### 组件侧接收数据

右侧组件无需 props，只需暴露 `init`（或自定义 `method`）：

```vue
<script setup lang="ts">
const init = async (data: { rowId?: number; list?: any[] }) => {
  // 在这里获取所有透传数据
}
defineExpose({ init })
</script>
```

数据流：调用方传入 `data` → `SlideContainer` 缓存 → 组件挂载后调用 `method` 并传参 → 组件内部处理。

### 右栏尺寸与拖拽

- `width` 控制初始宽度。
- 右栏可拖拽调整，主内容区域会自动缩放；需要时可手动调用 `updateContentLayout()`（例如容器尺寸变化）。

## AsideContainer API

封装左侧可折叠区域 + `SlideContainer`。

### Props

| 名称 | 类型 | 默认 | 说明 |
| ---- | ---- | ---- | ---- |
| `asideWidth` | `string \| number` | `400px` | 左侧区域宽度 |
| `minimized` | `boolean` | `false` | 是否初始收起 |

### AsideContainer 插槽

- `asideTitle`：左侧标题区域。
- `asideBody`：左侧主体内容。
- 默认插槽：主内容区域（内部已包含 `SlideContainer`）。

### 暴露方法

| 方法 | 说明 |
| ---- | ---- |
| `open(options)` / `close()` | 代理内部 `SlideContainer` 的开关 |
| `toggleAside()` | 展开/收起左侧区域 |

## 快速示例

```vue
<template>
  <SlideContainer ref="containerRef">
    <MainTable @row-click="openDetail" />
  </SlideContainer>
</template>

<script setup lang="ts">
import Detail from './Detail.vue'
const containerRef = ref()

const openDetail = (row) => {
  containerRef.value.open({
    default: {
      component: Detail,
      data: { rowId: row.id, extra: row },
      width: 600,
      title: '用户详情',
      onClose: (val) => console.log('closed with', val)
    }
  })
}
</script>
```

组件内：

```vue
<script setup lang="ts">
const init = async ({ rowId, extra }) => {
  // 加载详情
}
defineExpose({ init })
</script>
```

## 与 Kc.TableWithSlidePanel 联动

`TableWithSlidePanel` 直接内置 `SlideContainer`，可通过 `openPanel` / `closePanel` 调起右栏：

```ts
tableRef.value.openPanel({
  component: Detail,
  data: { rowId },
  width: 600,
  title: '用户详情'
})
```

## 使用建议

- 右侧组件务必暴露 `init`（或自定义 `method`）以接收数据。
- 如需避免布局抖动，拖拽时容器禁用动画，释放后自动过渡。
- 当容器尺寸变化（窗口缩放、父级折叠）时可调用 `updateContentLayout()` 以重新计算宽高。

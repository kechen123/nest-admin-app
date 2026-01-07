# Slide Panel 模块说明

用于在页面右侧快速打开滑出面板，支持内容区域/右栏自适应宽度、拖拽调整、统一数据传递与生命周期钩子。

## 功能特性

- ✅ 右栏滑出与收起
- ✅ 内容区域自适应宽度
- ✅ 右栏宽度拖拽调整
- ✅ 统一数据传递与生命周期钩子
- ✅ 自动未保存修改检测
- ✅ TypeScript 类型支持

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
    title?: string,     // 右栏标题，默认"详情"
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

## 自动未保存修改检测

SlideContainer 内置了自动未保存修改检测功能，无需在每个组件中重复实现。

### 工作原理

当调用 `close()` 时，SlideContainer 会自动：

1. 检查组件是否暴露了 `checkUnsavedChanges` 方法（优先使用）
2. 如果没有，则自动检测表单数据变化
3. 根据 `formConfig.fields` 中 `compare` 配置决定哪些字段参与比较
4. 支持额外数据源检测（如富文本编辑器）

### 表单配置

在 `formConfig.fields` 中为每个字段添加 `compare` 属性：

```ts
const formConfig = computed(() => ({
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      compare: true,  // 参与比较
    },
    {
      key: 'password',
      label: '密码',
      type: 'input',
      compare: false, // 不参与比较
    }
  ]
}))
```

### 组件数据暴露

组件需要暴露以下数据给 SlideContainer 进行自动检测：

```vue
<script setup lang="ts">
// 表单数据
const formData = ref({ name: '', email: '' })
const formConfig = computed(() => ({ /* ... */ }))

// 初始数据（在 init 方法中设置）
const initialFormData = ref({ name: '', email: '' })

// 额外数据源（如富文本编辑器）
const content = ref('')
const initialContent = ref('')

defineExpose({
  init,
  // 暴露给 SlideContainer 用于自动检测
  formData,
  formConfig,
  initialFormData,
  // 额外数据源
  additionalDataSources: [content],
  initialAdditionalDataSources: [initialContent]
})
</script>
```

### 自定义检测逻辑

如果需要自定义检测逻辑，可以在组件中暴露 `checkUnsavedChanges` 方法：

```vue
<script setup lang="ts">
const checkUnsavedChanges = () => {
  // 自定义检测逻辑
  return hasChanges.value
}

defineExpose({
  init,
  checkUnsavedChanges,
  // 如果有 handleClose，也会优先使用
  handleClose
})
</script>
```

### 数据重置

提交成功后，需要手动更新初始数据：

```vue
const onSubmit = async () => {
  // ... 提交逻辑
  await api.save(formData.value)

  // 更新初始数据
  initialFormData.value = { ...formData.value }
  initialContent.value = content.value

  close(true)
}
```

## 完整示例

```vue
<!-- 父组件 -->
<template>
  <SlideContainer ref="containerRef">
    <!-- 主内容 -->
  </SlideContainer>
</template>

<script setup lang="ts">
const containerRef = ref()

const openDetail = () => {
  containerRef.value.open({
    default: {
      component: DetailComponent,
      data: { rowId: 1, type: 'edit' },
      title: '编辑用户'
    }
  })
}
</script>
```

```vue
<!-- 子组件 (DetailComponent.vue) -->
<template>
  <KcForm :config="formConfig" v-model="formData" />
</template>

<script setup lang="ts">
const formData = ref({ name: '', email: '' })
const initialFormData = ref({ name: '', email: '' })

const formConfig = computed(() => ({
  fields: [
    { key: 'name', label: '姓名', type: 'input', compare: true },
    { key: 'email', label: '邮箱', type: 'input', compare: true }
  ]
}))

const init = async (data: any) => {
  // 加载数据
  const result = await api.getById(data.rowId)
  formData.value = result
  initialFormData.value = { ...result }
}

const onSubmit = async () => {
  await api.save(formData.value)
  // 更新初始数据
  initialFormData.value = { ...formData.value }
  close(true)
}

defineExpose({
  init,
  formData,
  formConfig,
  initialFormData
})
</script>
```

## 注意事项

1. **compare 配置**：默认为 `true`，只有明确设置为 `false` 的字段才不参与比较
2. **初始数据设置**：在 `init` 方法中正确设置 `initialFormData`
3. **数据重置**：提交成功后及时更新 `initialFormData`
4. **额外数据源**：如有富文本编辑器等非表单数据，通过 `additionalDataSources` 暴露
5. **查看模式**：查看模式下不进行检测，可通过 `checkUnsavedChanges` 方法返回 `false`
6. **自定义逻辑**：如需复杂检测逻辑，可暴露 `checkUnsavedChanges` 方法
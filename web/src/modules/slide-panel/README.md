# Slide Panel 统一数据传递功能

## 功能说明

SlideContainer 现在支持统一的数据传递机制。你只需要传递一个 `data` 对象，系统会通过组件的 `init` 函数将所有数据传递给组件。

## 使用方法

### 1. 调用时统一传递数据

```javascript
const openUserDetail = (rowId, type) => {
  containerRef.value.open({
    default: {
      component: Detail,
      data: {
        // 所有数据都通过 init 函数传递
        rowId,
        type,
        departmentList: departmentList.value,
        positionList: positionList.value,
        userConfig: { theme: 'dark', lang: 'zh' },
      },
      width: 600,
      title: '用户详情',
    },
  })
}
```

### 2. 在组件中通过 init 函数接收数据

```vue
<script setup lang="ts">
// 不需要定义 props，所有数据通过 init 函数接收
const departmentList = ref([])
const positionList = ref([])

const init = async (data) => {
  // 从 init 函数参数中获取所有数据
  const { rowId, type, departmentList: deptList, positionList: posList, userConfig } = data

  // 设置组件内部状态
  departmentList.value = deptList || []
  positionList.value = posList || []

  // 根据 rowId 获取用户数据
  if (rowId) {
    const res = await getUser(rowId)
    Object.assign(formData.value, res.data[0])
  }

  console.log('用户配置:', userConfig)
}

defineExpose({ init })
</script>
```

## 数据传递流程

1. **调用方**：传递 `data` 对象
2. **SlideContainer**：保存数据，等待组件挂载
3. **组件挂载**：调用组件的 `init` 函数
4. **组件接收**：通过 `init` 函数参数获取所有数据

## 优势

1. **统一接口**：只需要传递一个 `data` 对象
2. **简洁明了**：组件不需要定义 props 或使用 inject
3. **DOM 干净**：没有任何数据暴露到 DOM 元素上
4. **类型安全**：支持 TypeScript 类型定义
5. **性能优化**：避免不必要的 props 传递和响应式处理

## 示例场景

### 场景1：表单组件

```javascript
// 传递表单数据和选项
data: {
  formData: { name: 'John', age: 30 },
  validationRules: [...],
  submitUrl: '/api/users',
  isEdit: true
}
```

### 场景2：列表组件

```javascript
// 传递列表数据和配置
data: {
  items: [...],
  columns: [...],
  pagination: { page: 1, size: 10 },
  loading: false,
  title: '用户列表'
}
```

## 注意事项

1. 组件必须定义 `init` 函数并暴露给父组件
2. `init` 函数会在组件挂载后自动调用
3. 建议使用 `inheritAttrs: false` 防止 DOM 属性污染
4. 所有数据都通过 `init` 函数参数传递，包括简单值和复杂对象

# FormGenerator 组件扩展指南

## 概述

`FormGenerator` 采用**配置化 + 属性穿透**的通用架构，支持轻松扩展新的组件类型，无需修改核心代码。

## 架构设计

### 核心文件

1. **`fieldConfig.ts`** - 组件类型配置映射
2. **`FormGenerator.vue`** - 通用表单生成器组件

### 工作原理

1. 组件类型配置存储在 `FIELD_TYPE_CONFIGS` 中
2. `FormGenerator` 通过动态组件渲染，根据 `field.type` 查找对应配置
3. 属性穿透机制自动传递所有 Element Plus 组件支持的属性
4. 特殊属性通过 `transform` 函数处理

## 如何添加新组件类型

### 步骤 1: 在 `fieldConfig.ts` 中添加配置

```typescript
// 示例：添加 DatePicker 类型
datepicker: {
  component: 'ElDatePicker',
  reservedKeys: ['format', 'valueFormat'], // 可选：需要特殊处理的字段
  defaultAttrs: {
    clearable: true,
    type: 'date',
  },
  transform: (field, attrs) => {
    // placeholder 处理
    if (field.placeholder !== undefined) {
      attrs.placeholder = unwrapValue(field.placeholder) || ''
    }
    
    // disabled 处理
    if (field.disabled !== undefined) {
      attrs.disabled = Boolean(unwrapValue(field.disabled))
    }
    
    // 其他特殊处理...
    return attrs
  },
},
```

### 步骤 2: 在 `FormGenerator.vue` 中注册组件

```typescript
import { ElDatePicker } from 'element-plus'

// 在 getComponent 函数中添加
const componentMap: Record<string, any> = {
  ElInput,
  ElSelect,
  ElDatePicker, // 新增
}
```

### 步骤 3: 更新类型定义（可选）

如果需要在类型系统中明确支持，可以在 `types.ts` 中更新：

```typescript
type: 'input' | 'select' | 'textarea' | 'datepicker' | 'custom'
```

## 配置选项说明

### FieldTypeConfig 接口

```typescript
interface FieldTypeConfig {
  /** 组件名称（Element Plus 组件名） */
  component: string
  
  /** 需要过滤的保留字段（这些字段不会传递给组件） */
  reservedKeys?: string[]
  
  /** 属性转换函数（可选，用于特殊处理） */
  transform?: FieldTransform
  
  /** 默认属性 */
  defaultAttrs?: Record<string, any>
  
  /** 是否需要 options 子组件（如 Select 需要 ElOption） */
  hasOptions?: boolean
}
```

### 配置示例

#### 示例 1: Switch 组件（简单类型）

```typescript
switch: {
  component: 'ElSwitch',
  transform: (field, attrs) => {
    if (field.disabled !== undefined) {
      attrs.disabled = Boolean(unwrapValue(field.disabled))
    }
    return attrs
  },
},
```

#### 示例 2: Radio 组件（需要子组件）

```typescript
radio: {
  component: 'ElRadioGroup',
  reservedKeys: ['options'],
  hasOptions: true, // 需要渲染 ElRadio 子组件
  transform: (field, attrs) => {
    if (field.disabled !== undefined) {
      attrs.disabled = Boolean(unwrapValue(field.disabled))
    }
    return attrs
  },
},
```

#### 示例 3: DatePicker 组件（复杂类型）

```typescript
datepicker: {
  component: 'ElDatePicker',
  defaultAttrs: {
    clearable: true,
    type: 'date',
  },
  transform: (field, attrs) => {
    // 支持所有 DatePicker 属性自动穿透
    // 只需要处理特殊逻辑
    if (field.placeholder !== undefined) {
      attrs.placeholder = unwrapValue(field.placeholder) || ''
    }
    return attrs
  },
},
```

## 使用示例

### 基础使用

```typescript
const fields: FormField[] = [
  {
    key: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    maxlength: 20,
    showWordLimit: true,
  },
  {
    key: 'birthday',
    label: '生日',
    type: 'datepicker', // 使用新添加的类型
    placeholder: '请选择日期',
    format: 'YYYY-MM-DD',
  },
]
```

### 响应式属性

```typescript
const isDisabled = ref(false)

const fields: FormField[] = [
  {
    key: 'username',
    label: '用户名',
    type: 'input',
    disabled: isDisabled, // 支持响应式
    placeholder: computed(() => '动态提示'),
  },
]
```

## 属性穿透机制

### 工作原理

1. **自动穿透**: `FormField` 中除了保留字段外的所有属性都会自动传递给组件
2. **优先级**: `transform` 函数 > 穿透属性 > 默认属性
3. **响应式支持**: 自动解包 `Ref` 和 `ComputedRef`

### 保留字段

以下字段不会传递给组件（用于 FormGenerator 内部配置）：

- `key` - 字段标识
- `label` - 标签文本
- `type` - 组件类型
- `width` - 字段宽度
- `labelWidth` - 标签宽度
- `slot` - 自定义插槽
- `options` - 选项数据（Select/Radio 等使用）
- `inputType` - Input 的 type 属性（会转换为 `type`）

### 示例：属性穿透

```typescript
{
  key: 'email',
  label: '邮箱',
  type: 'input',
  // 以下属性会自动传递给 ElInput
  maxlength: 50,
  showWordLimit: true,
  prefixIcon: 'Message',
  suffixIcon: 'Search',
  autocomplete: 'off',
  readonly: false,
  tabindex: 1,
  // ... Element Plus Input 支持的所有属性
}
```

## 最佳实践

1. **优先使用属性穿透**: 对于标准属性，直接使用属性穿透，无需在 `transform` 中处理
2. **特殊逻辑用 transform**: 只在需要特殊处理时使用 `transform` 函数
3. **保持配置简洁**: 尽量使用默认配置，减少重复代码
4. **类型安全**: 在 `types.ts` 中定义明确的类型，提高开发体验

## 常见问题

### Q: 如何覆盖默认属性？

A: 在 `transform` 函数中处理，或者在字段配置中直接设置（优先级更高）

### Q: 如何支持自定义事件？

A: 在 `FormGenerator.vue` 中添加事件监听，或使用 `@change` 统一处理

### Q: 如何支持复杂的子组件结构？

A: 使用 `slot` 功能，或者扩展 `hasOptions` 机制支持更多子组件类型

## 总结

通过配置化的方式，添加新组件类型只需要：
1. 在 `fieldConfig.ts` 中添加配置（1-10 行代码）
2. 在 `FormGenerator.vue` 中注册组件（1 行代码）

无需修改核心逻辑，完全符合**开闭原则**！


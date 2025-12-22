import type { FormField } from '../types'
import type { Ref, ComputedRef } from 'vue'
import { isRef } from 'vue'

/**
 * 字段属性转换函数类型
 * 用于对字段属性进行特殊处理（如 inputType 转 type）
 */
type FieldTransform = (field: FormField, attrs: Record<string, any>) => Record<string, any>

/**
 * 组件类型配置
 */
export interface FieldTypeConfig {
  /** 组件名称（Element Plus 组件名，如 'ElInput', 'ElSelect'） */
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

/**
 * FormField 的全局保留字段（所有类型都通用）
 */
const GLOBAL_RESERVED_KEYS = ['key', 'label', 'type', 'width', 'labelWidth', 'slot'] as const

/**
 * 通用的属性值解包函数（支持 Ref/ComputedRef）
 */
function unwrapValue(value: any): any {
  return isRef(value) ? value.value : value
}

/**
 * 通用的属性提取函数
 */
export function getComponentAttrs(field: FormField, config: FieldTypeConfig): Record<string, any> {
  const attrs: Record<string, any> = {}

  // 合并全局保留字段和类型特定的保留字段
  const reservedKeys = new Set([...GLOBAL_RESERVED_KEYS, ...(config.reservedKeys || [])])

  // 1. 先收集所有可穿透的属性（排除保留字段）
  Object.keys(field).forEach((key) => {
    if (!reservedKeys.has(key)) {
      attrs[key] = unwrapValue(field[key])
    }
  })

  // 2. 应用默认属性（优先级最低）
  if (config.defaultAttrs) {
    Object.assign(attrs, config.defaultAttrs)
  }

  // 3. 应用属性转换函数（可以覆盖穿透属性和默认属性）
  if (config.transform) {
    return config.transform(field, attrs)
  }

  return attrs
}

/**
 * 组件类型配置映射
 * 新增组件类型时，只需在此添加配置即可
 */
export const FIELD_TYPE_CONFIGS: Record<string, FieldTypeConfig> = {
  // Input 类型
  input: {
    component: 'ElInput',
    reservedKeys: ['inputType'],
    defaultAttrs: {
      clearable: true,
    },
    transform: (field, attrs) => {
      // inputType 转换为 type
      if (field.inputType) {
        attrs.type = field.inputType
      } else {
        attrs.type = attrs.type || 'text'
      }

      // placeholder 处理（支持 computed）
      if (field.placeholder !== undefined) {
        attrs.placeholder = unwrapValue(field.placeholder) || ''
      }

      // clearable 处理（默认 true）
      if (field.clearable !== undefined) {
        attrs.clearable = field.clearable !== false
      }

      // disabled 处理（支持 computed）
      if (field.disabled !== undefined) {
        attrs.disabled = Boolean(unwrapValue(field.disabled))
      }

      return attrs
    },
  },

  // Textarea 类型（复用 Input 配置，但 type 固定为 textarea）
  textarea: {
    component: 'ElInput',
    reservedKeys: ['inputType'],
    defaultAttrs: {
      type: 'textarea',
      clearable: true,
    },
    transform: (field, attrs) => {
      // textarea 固定 type
      attrs.type = 'textarea'

      // placeholder 处理
      if (field.placeholder !== undefined) {
        attrs.placeholder = unwrapValue(field.placeholder) || ''
      }

      // clearable 处理
      if (field.clearable !== undefined) {
        attrs.clearable = field.clearable !== false
      }

      // disabled 处理
      if (field.disabled !== undefined) {
        attrs.disabled = Boolean(unwrapValue(field.disabled))
      }

      return attrs
    },
  },

  // Select 类型
  select: {
    component: 'ElSelect',
    reservedKeys: ['options'], // multiple 需要传递给组件，所以不在这里
    defaultAttrs: {
      clearable: true,
    },
    hasOptions: true,
    transform: (field, attrs) => {
      // placeholder 处理
      if (field.placeholder !== undefined) {
        attrs.placeholder = unwrapValue(field.placeholder) || ''
      }

      // clearable 处理
      if (field.clearable !== undefined) {
        attrs.clearable = field.clearable !== false
      }

      // disabled 处理
      if (field.disabled !== undefined) {
        attrs.disabled = Boolean(unwrapValue(field.disabled))
      }

      // multiple 处理
      if (field.multiple !== undefined) {
        attrs.multiple = field.multiple
      }

      return attrs
    },
  },

  // DatePicker 类型（示例，展示如何添加新类型）
  // datepicker: {
  //   component: 'ElDatePicker',
  //   defaultAttrs: {
  //     clearable: true,
  //   },
  //   transform: (field, attrs) => {
  //     if (field.placeholder !== undefined) {
  //       attrs.placeholder = unwrapValue(field.placeholder) || ''
  //     }
  //     return attrs
  //   },
  // },

  // Switch 类型（示例）
  // switch: {
  //   component: 'ElSwitch',
  //   transform: (field, attrs) => {
  //     if (field.disabled !== undefined) {
  //       attrs.disabled = Boolean(unwrapValue(field.disabled))
  //     }
  //     return attrs
  //   },
  // },

  // Radio 类型（示例）
  // radio: {
  //   component: 'ElRadioGroup',
  //   reservedKeys: ['options'],
  //   hasOptions: true,
  //   transform: (field, attrs) => {
  //     if (field.disabled !== undefined) {
  //       attrs.disabled = Boolean(unwrapValue(field.disabled))
  //     }
  //     return attrs
  //   },
  // },
}

<template>
  <el-form-item class="formItem" v-for="field in fields" :key="field.key" :label="field.label" :prop="field.key"
    :style="{ width: getFieldWidth(field) }" :label-width="field.labelWidth || undefined">
    <!-- slot 渲染优先 -->
    <slot v-if="field.slot" :name="typeof field.slot === 'string' ? field.slot : field.key" :field="field"
      :model="formData" />

    <!-- 动态组件渲染 -->
    <component v-else-if="getComponent(field)" :is="getComponent(field)" v-model="formData[field.key]"
      v-bind="getComponentAttrs(field)" @change="handleFieldChange(field.key, formData[field.key])">
      <!-- Select/Option 等需要子组件的类型 -->
      <template v-if="getComponentConfig(field)?.hasOptions">
        <el-option v-for="option in getOptions(field.options)" :key="option.value" :label="option.label"
          :value="option.value" />
      </template>
    </component>

  </el-form-item>
</template>

<script setup lang="ts">
import { computed, isRef } from 'vue'
import { ElFormItem, ElInput, ElSelect, ElOption, ElInputNumber } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'
import type { FormField } from '../types'
import { FIELD_TYPE_CONFIGS, getComponentAttrs as getAttrsFromConfig, type FieldTypeConfig } from './fieldConfig'

interface Props {
  fields: FormField[]
  modelValue?: Record<string, any>
  fieldWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  fieldWidth: '250px'
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  change: [key: string, value: any]
}>()

// 使用computed来处理双向绑定，避免无限循环
const formData = computed({
  get() {
    return props.modelValue || {}
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 获取字段宽度 - 三级优先级
const getFieldWidth = (field: FormField): string => {
  // 1. 单个字段自定义宽度（最高优先级）
  if (field.width) {
    return typeof field.width === 'number' ? `${field.width}px` : field.width
  }

  // 2. 整体统一宽度（中等优先级）
  if (props.fieldWidth) {
    return typeof props.fieldWidth === 'number' ? `${props.fieldWidth}px` : props.fieldWidth
  }

  // 3. 默认宽度（最低优先级）
  return '250px'
}

// 自动解包 options
function getOptions(options: any): { label: string; value: any }[] {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (isRef(options)) return options.value as { label: string; value: any }[]
  return []
}

/**
 * 获取组件配置
 */
function getComponentConfig(field: FormField): FieldTypeConfig | undefined {
  return FIELD_TYPE_CONFIGS[field.type]
}

/**
 * 获取组件属性（通用方法）
 */
function getComponentAttrs(field: FormField): Record<string, any> {
  const config = getComponentConfig(field)
  if (!config) {
    console.warn(`Unknown field type: ${field.type}`)
    return {}
  }
  return getAttrsFromConfig(field, config)
}

/**
 * 获取组件实例（用于动态组件）
 */
function getComponent(field: FormField) {
  const config = getComponentConfig(field)
  if (!config) return null

  // 根据组件名称返回对应的组件实例
  const componentMap: Record<string, any> = {
    ElInput,
    ElSelect,
    ElInputNumber,
    ImageUpload,
    // 未来可以在这里添加更多组件
    // ElDatePicker,
    // ElSwitch,
    // ElRadioGroup,
  }

  return componentMap[config.component] || null
}

const handleFieldChange = (key: string, value: any) => {
  emit('change', key, value)
}
</script>

<style lang="less" scoped>
.formItem {
  margin-bottom: 0;
}
</style>

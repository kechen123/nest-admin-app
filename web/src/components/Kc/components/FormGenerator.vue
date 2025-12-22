<template>
  <el-form-item class="formItem" v-for="field in fields" :key="field.key" :label="field.label" :prop="field.key"
    :style="{ width: getFieldWidth(field) }" :label-width="field.labelWidth || undefined">
    <!-- slot 渲染优先 -->
    <slot v-if="field.slot" :name="typeof field.slot === 'string' ? field.slot : field.key" :field="field"
      :model="formData" />

    <!-- Input 类型 -->
    <el-input
      v-else-if="field.type === 'input'"
      v-model="formData[field.key]"
      :type="field.inputType || 'text'"
      :placeholder="getPlaceholder(field)"
      :clearable="field.clearable !== false"
      :disabled="getDisabled(field)"
      @change="handleFieldChange(field.key, formData[field.key])"
    />

    <!-- Select 类型 -->
    <el-select v-else-if="field.type === 'select'" v-model="formData[field.key]" :placeholder="field.placeholder"
      :clearable="field.clearable !== false" :disabled="field.disabled" :multiple="field.multiple"
      @change="handleFieldChange(field.key, formData[field.key])">
      <el-option v-for="option in getOptions(field.options)" :key="option.value" :label="option.label"
        :value="option.value" />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed, isRef } from 'vue'
import { ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import type { FormField } from '../types'

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

// 获取 placeholder（支持 computed）
function getPlaceholder(field: FormField): string {
  if (!field.placeholder) return ''
  if (isRef(field.placeholder)) return field.placeholder.value
  return field.placeholder
}

// 获取 disabled（支持 computed）
function getDisabled(field: FormField): boolean {
  if (field.disabled === undefined) return false
  if (isRef(field.disabled)) return field.disabled.value
  return field.disabled
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

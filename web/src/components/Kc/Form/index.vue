<template>
  <div class="kc-form-container">
    <!-- Loading 占位符 -->
    <div v-show="!isReady" class="loading-placeholder">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 实际表单内容 -->
    <div v-show="isReady" class="form-content">
      <el-form ref="formRef" :model="formData" :rules="getRules() as any" :label-width="config.labelWidth || '100px'"
        :inline="config.inline || false" class="kc-form">
        <FormGenerator :fields="config.fields" v-model="formData" :field-width="config.fieldWidth"
          @change="handleFieldChange">
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </FormGenerator>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, isRef } from 'vue'
import { ElForm, ElSkeleton } from 'element-plus'
import FormGenerator from '../components/FormGenerator.vue'
import type { FormField } from '../types'

interface FormConfig {
  fields: FormField[]
  rules?: Record<string, any>
  labelWidth?: string | number
  fieldWidth?: string | number
  inline?: boolean
}

interface Props {
  config: FormConfig
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  submit: [data: Record<string, any>]
  reset: []
  change: [key: string, value: any]
}>()

const formRef = ref()
const formData = ref<Record<string, any>>({ ...props.modelValue })
const isReady = ref(false)

// 组件挂载后设置 ready 状态
onMounted(() => {
  // 给一个最小显示时间，确保用户体验
  setTimeout(() => {
    isReady.value = true
  }, 300)
})

// 简化的 watch，只在外部值真正变化时更新
watch(() => props.modelValue, (val) => {
  // 避免直接赋值响应式对象
  if (val && typeof val === 'object') {
    formData.value = { ...val }
  }
}, { deep: true })

const handleFieldChange = (key: string, value: any) => {
  emit('change', key, value)
  // 手动触发 modelValue 更新
  emit('update:modelValue', formData.value)
}

// 获取 rules（支持 computed）
const getRules = () => {
  if (!props.config.rules) return {}
  if (isRef(props.config.rules)) return props.config.rules.value
  return props.config.rules
}

defineExpose({
  formRef
})
</script>

<style lang="less" scoped>
.kc-form-container {
  width: 100%;
  position: relative;
}

.loading-placeholder {
  padding: 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-content {
  width: 100%;
}

.kc-form {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: flex-start;

  .el-form-item {
    margin-bottom: 0;
    align-items: flex-start;
    box-sizing: border-box;
    // 移除固定宽度，使用动态宽度（通过 :style 设置）
    // 注意：flex-basis 会被 :style 中的 width 覆盖，所以不需要设置 flex

    .el-form-item__label {
      text-align: right;
      font-weight: 500;
      color: var(--el-text-color-regular);
      padding-right: 8px;
      white-space: normal;
      word-break: break-all;
    }

    .el-form-item__content {
      text-align: left;
    }
  }
}
</style>

<template>
  <el-dialog v-model="visible" :title="title" width="800px" :before-close="handleClose">
    <el-descriptions :column="2" border>
      <el-descriptions-item v-for="(item, index) in displayFields" :key="index" :label="item.label">
        <template v-if="item.type === 'tag'">
          <el-tag :type="getTagType(data[item.prop])">
            {{ formatValue(data[item.prop], item) }}
          </el-tag>
        </template>
        <template v-else-if="item.type === 'date'">
          {{ formatDateTime(data[item.prop]) }}
        </template>
        <template v-else>
          {{ formatValue(data[item.prop], item) }}
        </template>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDateTime } from '@/utils/format';

interface FieldConfig {
  prop: string;
  label: string;
  type?: 'text' | 'tag' | 'date';
  formatter?: (value: any) => string;
  tagTypeMap?: Record<string, string>;
}

interface Props {
  modelValue: boolean;
  title?: string;
  data: Record<string, any>;
  fields: FieldConfig[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '数据预览',
  data: () => ({}),
  fields: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const displayFields = computed(() => {
  return props.fields.filter((field) => props.data.hasOwnProperty(field.prop));
});

const formatValue = (value: any, field: FieldConfig): string => {
  if (field.formatter) {
    return field.formatter(value);
  }
  return value ?? '-';
};

const getTagType = (value: any): string => {
  // 可以根据值返回不同的tag类型
  if (value === 'admin' || value === true) return 'danger';
  if (value === 'user' || value === false) return 'primary';
  return 'info';
};

const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
:deep(.el-descriptions) {
  .el-descriptions__label {
    font-weight: 600;
  }
}
</style>

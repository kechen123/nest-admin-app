<template>
  <div v-if="loading" class="skeleton-table">
    <el-skeleton v-for="i in rows" :key="i" :rows="1" animated :loading="true">
      <template #template>
        <div class="skeleton-row">
          <el-skeleton-item v-for="j in columns" :key="j" variant="rect" :style="{ width: getColumnWidth(j) }"
            class="skeleton-cell" />
        </div>
      </template>
    </el-skeleton>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  loading: boolean;
  rows?: number;
  columns?: number;
  columnWidths?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 6,
  columnWidths: () => [],
});

const getColumnWidth = (index: number): string => {
  if (props.columnWidths[index]) {
    return props.columnWidths[index];
  }
  // 默认宽度分配
  const widths = ['80px', '120px', '150px', '200px', '100px', '120px'];
  return widths[index] || '120px';
};
</script>

<style scoped lang="scss">
.skeleton-table {
  padding: $spacing-md;
}

.skeleton-row {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  align-items: center;
}

.skeleton-cell {
  height: 20px;
  border-radius: $border-radius-base;
}
</style>

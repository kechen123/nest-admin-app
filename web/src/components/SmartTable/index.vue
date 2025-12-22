<template>
  <el-table v-bind="$attrs" :data="data" :border="border" style="width: 100%" v-loading="loading">
    <template v-for="col in computedColumns" :key="col.prop">
      <el-table-column :label="col.label" :prop="col.prop" :width="col.width" :fixed="col.fixed"
        :align="col.align || 'left'">
        <template v-if="col.slot" #default="scope">
          <!-- 手动绑定具名插槽：col.slot -->
          <slot :name="col.slot" v-bind="scope" />
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'

type TableColumn = {
  label: string
  prop: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  hideInCompact?: boolean
  slot?: string
  fixed?: boolean | 'left' | 'right'
}

const props = defineProps<{
  data: any[]
  loading?: boolean
  border?: boolean
  columns: TableColumn[]
  compactMode?: boolean
}>()

const computedColumns = computed<TableColumn[]>(() => {
  const cols = props.columns ?? []
  return props.compactMode ? cols.filter(col => !col.hideInCompact) : cols
})
</script>

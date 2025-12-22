<template>
  <div class="button-generator">
    <el-button v-for="btn in buttons" :key="btn.key" :type="btn.type || 'default'" :size="btn.size || 'default'"
      :disabled="btn.disabled" :loading="btn.loading" :icon="btn.icon" @click="handleClick(btn)">
      {{ btn.label }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus';
import type { ButtonConfig } from '../../types'

interface Props {
  config: ButtonConfig[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [btn: ButtonConfig]
}>()

const buttons = computed(() => props.config || [])

const handleClick = (btn: ButtonConfig) => {
  emit('click', btn)
}
</script>

<style lang="less" scoped>
.button-generator {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
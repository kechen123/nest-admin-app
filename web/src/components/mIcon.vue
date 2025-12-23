<template>
  <component v-if="isValidIcon" :is="props.iconName" class="myIcon"></component>
  <span v-else class="myIcon">-</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

interface Props {
  iconName: string
}
const props = withDefaults(defineProps<Props>(), {
  iconName: ''
})

// 检查图标名称是否有效
const isValidIcon = computed(() => {
  if (!props.iconName || props.iconName.trim() === '' || props.iconName === '#') {
    return false
  }
  // 检查图标是否存在于 Element Plus Icons 中
  return props.iconName in ElementPlusIconsVue
})
</script>

<style scoped></style>

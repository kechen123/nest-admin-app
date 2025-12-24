<template>
  <div class="button-generator">
    <CommonButton
      v-for="btn in buttons"
      :key="btn.key"
      :type="btn.type || 'default'"
      :size="btn.size || 'default'"
      :disabled="btn.disabled"
      :loading="btn.loading"
      :icon="getIconComponent(btn.icon)"
      :label="btn.label"
      :prevent-double-click="btn.preventDoubleClick || false"
      :debounce="btn.debounce || 0"
      :on-click="() => handleClick(btn)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { ButtonConfig } from '../../types'

interface Props {
  config: ButtonConfig[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [btn: ButtonConfig]
}>()

const buttons = computed(() => props.config || [])

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return undefined
  const iconComponents = ElementPlusIconsVue as Record<string, any>
  return iconComponents[iconName]
}

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
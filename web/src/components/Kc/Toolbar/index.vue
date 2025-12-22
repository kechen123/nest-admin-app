<template>
  <div class="kc-toolbar">
    <div class="toolbar-left">
      <ButtonGenerator v-if="props.config.leftButtons" :config="props.config.leftButtons" @click="handleButtonClick" />
      <slot name="left" />
    </div>
    <div class="toolbar-right">
      <ButtonGenerator v-if="props.config.rightButtons" :config="props.config.rightButtons"
        @click="handleButtonClick" />
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonGenerator from './components/ButtonGenerator.vue'
import type { ButtonConfig, ToolbarConfig } from '../types'

interface Props {
  config?: ToolbarConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({})
})

const emit = defineEmits<{
  buttonClick: [btn: ButtonConfig]
}>()

const handleButtonClick = (btn: ButtonConfig) => {
  emit('buttonClick', btn)
}
</script>

<style lang="less" scoped>
.kc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 16px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

<template>
  <div class="collapse-wrapper" @click="handleToggle">
    <el-icon size="24" class="collapse-icon">
      <MIcon :iconName="isCollapse ? 'Expand' : 'Fold'" />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'

const layoutStore = useLayoutStore()
const { isCollapse } = storeToRefs(layoutStore)
const { toggleCollapse } = layoutStore

const handleToggle = () => {
  toggleCollapse()
}
</script>

<style scoped lang="less">
.collapse-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: var(--el-color-info-light-8);
    
    .collapse-icon {
      color: var(--el-color-primary);
    }
  }
  
  .collapse-icon {
    transition: transform 0.3s;
  }
  
  &:active .collapse-icon {
    transform: scale(0.9);
  }
}
</style>

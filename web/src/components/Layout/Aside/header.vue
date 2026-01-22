<template>
  <div class="aside-header" :class="{ 'is-collapse': isCollapse }">
    <!-- <Logo /> -->
    <div class="title" v-show="!isCollapse">YL1 Admin</div>
    <div class="title-collapse" v-show="isCollapse">YL</div>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'
import Logo from '@/assets/svg/logo.svg'

const layoutStore = useLayoutStore()
const { isCollapse } = storeToRefs(layoutStore)
</script>

<style scoped lang="less">
.aside-header {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 55px;
  transition: all 0.3s ease-in-out;
  border-bottom: 1px solid var(--el-border-color-lighter);

  svg {
    width: 40px;
    height: 40px;
    fill: var(--msidebar-text-color);
  }

  .title {
    height: 35px;
    line-height: 35px;
    margin-left: 10px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    transition: opacity 0.3s ease-in-out;
  }

  .title-collapse {
    height: 35px;
    line-height: 35px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: linear-gradient(135deg, var(--el-color-primary-light-8), var(--el-color-primary-light-9));
    transition: all 0.3s ease-in-out;
  }

  &.is-collapse {
    padding: 10px;
    justify-content: center;
  }
}
</style>

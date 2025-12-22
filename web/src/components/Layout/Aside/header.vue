<template>
  <div class="aside-header">
    <!-- <Logo /> -->
    <div class="title">Vue3 Admin</div>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/assets/svg/logo.svg'
</script>

<style scoped lang="less">
.aside-header {
  padding: 10px 20px;
  display: flex;
  align-items: center;

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
    color: var(--sidebar-text-color);
  }

}
</style>

<template>
  <div class="body">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="header-left">
      <LayoutHeaderLeft />
      <LayoutHeaderBreadcrumb />
    </div>
    
    <!-- 右侧：导航栏 -->
    <LayoutHeaderNavigation />
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.body {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // background-color: var(--header-bg);
  // color: var(--header-text-color);
  padding: 10px 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--el-border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0; // 允许 flex 子元素收缩
}
</style>

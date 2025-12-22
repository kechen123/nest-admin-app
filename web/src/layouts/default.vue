<template>
  <el-container class="layout-container">
    <el-aside class="sidebar">
      <LayoutAside />
    </el-aside>
    <el-container>
      <el-header class="header">
        <LayoutHeader />
      </el-header>
      <LayoutTags />
      <el-main class="main">
        <RouterView v-slot="{ Component, route }">
          <template v-if="Component">
            <KeepAlive>
              <Transition name="fade" mode="out-in">
                <component :is="Component" :key="route.path" />
              </Transition>
            </KeepAlive>
          </template>
        </RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.layout-container {
  height: 100vh;
  background-color: var(--el-bg-color);

  .sidebar {
    // background-color: var(--sidebar-bg);
    width: 200px;
    transition: all 0.3s ease-in-out;
    transform: translateX(0);
    // border-right: var(--sidebar-border);
    // box-shadow: var(--border);
    border-right-width: 1px;
    border-right-style: solid;
    border-right-color: var(--el-border-color);
  }

  .header {
    height: var(--header-height);
    padding: 0;
  }

  .main {
    background-color: var(--el-bg-color-page);
  }
}
</style>

<style>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
  /* 从右边开始进入 */
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
  /* 向左移出 */
}
</style>

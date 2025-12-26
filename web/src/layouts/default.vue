<template>
  <el-container class="layout-container">
    <el-aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
      <LayoutAside />
    </el-aside>
    <el-container>
      <el-header class="header">
        <LayoutHeader />
      </el-header>
      <LayoutTags />
      <el-main class="main">
        <router-view />
        <!-- <RouterView v-slot="{ Component, route }">
          <template v-if="Component">
            <KeepAlive>
              <Transition name="fade" mode="out-in">
                <component :is="Component" :key="route.path" />
              </Transition>
            </KeepAlive>
          </template>
</RouterView> -->
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { Loading, Warning } from '@element-plus/icons-vue'

const layoutStore = useLayoutStore()
const { isCollapse } = storeToRefs(layoutStore)
const route = useRoute()

</script>

<style scoped lang="less">
.layout-container {
  height: 100vh;
  background-color: var(--el-bg-color);

  .sidebar {
    // background-color: var(--sidebar-bg);
    width: 200px;
    transition: width 0.3s ease-in-out;
    transform: translateX(0);
    // border-right: var(--sidebar-border);
    // box-shadow: var(--border);
    border-right-width: 1px;
    border-right-style: solid;
    border-right-color: var(--el-border-color);
    overflow: hidden;
    background-color: var(--el-bg-color);

    &.is-collapse {
      width: 64px;
    }
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

<style lang="less">
// 暗色模式下侧边栏背景区分
.dark .layout-container .sidebar {
  background-color: var(--el-bg-color-page);
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

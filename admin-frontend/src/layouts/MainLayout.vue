<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '200px'" class="sidebar">
      <div class="sidebar-header">
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">管理系统</span>
        <span v-else class="logo-icon">M</span>
      </div>
      <el-menu :default-active="activeMenu" :collapse="appStore.sidebarCollapsed" router class="sidebar-menu"
        :background-color="appStore.theme === 'dark' ? 'transparent' : 'transparent'"
        :text-color="appStore.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)'"
        :active-text-color="appStore.theme === 'dark' ? '#667eea' : '#667eea'">
        <el-menu-item index="/dashboard">
          <el-icon>
            <House />
          </el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon>
            <User />
          </el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/permission">
          <el-icon>
            <Key />
          </el-icon>
          <template #title>权限管理</template>
        </el-menu-item>
        <el-menu-item index="/role">
          <el-icon>
            <Lock />
          </el-icon>
          <template #title>角色管理</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon>
            <Setting />
          </el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button :icon="appStore.sidebarCollapsed ? Expand : Fold" circle @click="appStore.toggleSidebar()" />
          <Breadcrumb />
        </div>
        <div class="header-right">
          <el-tooltip content="切换主题" placement="bottom">
            <el-button :icon="appStore.theme === 'dark' ? Sunny : Moon" circle @click="toggleTheme" />
          </el-tooltip>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon>
                    <User />
                  </el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  House,
  User,
  Setting,
  Fold,
  Expand,
  Sunny,
  Moon,
  UserFilled,
  ArrowDown,
  SwitchButton,
  Key,
  Lock,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue';
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

const activeMenu = computed(() => route.path);

const toggleTheme = () => {
  const newTheme = appStore.theme === 'light' ? 'dark' : 'light';
  appStore.setTheme(newTheme);
};

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        userStore.logout();
        router.push('/login');
      } catch {
        // 用户取消
      }
      break;
  }
};
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;

  // 明亮主题下的样式
  [data-theme="light"] & {
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.05);
  }

  // 添加微妙的边框效果
  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%);

    [data-theme="light"] & {
      background: linear-gradient(180deg,
          transparent 0%,
          rgba(0, 0, 0, 0.06) 50%,
          transparent 100%);
    }
  }

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 $spacing-md;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s;

    [data-theme="light"] & {
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }

    .logo-text {
      white-space: nowrap;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.5px;
    }

    .logo-icon {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: $spacing-md 0;
  background: transparent;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    [data-theme="light"] & {
      background: rgba(0, 0, 0, 0.2);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3);

      [data-theme="light"] & {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  :deep(.el-menu-item) {
    margin: 4px $spacing-sm;
    border-radius: 8px;
    height: 48px;
    line-height: 48px;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    font-size: 14px;

    [data-theme="light"] & {
      color: rgba(0, 0, 0, 0.65);
    }

    // 添加微妙的背景动画
    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: rgba(255, 255, 255, 0.05);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      [data-theme="light"] & {
        background: rgba(0, 0, 0, 0.03);
      }
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: rgba(255, 255, 255, 0.9);
      transform: translateX(4px);
      padding-left: 20px;

      [data-theme="light"] & {
        background: rgba(0, 0, 0, 0.04) !important;
        color: rgba(0, 0, 0, 0.85);
      }

      &::after {
        width: 3px;
      }

      .el-icon {
        transform: scale(1.1);
      }
    }

    &.is-active {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
      color: #667eea !important;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      padding-left: 20px;

      [data-theme="light"] & {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%) !important;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 0 3px 3px 0;
        box-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
      }

      &::after {
        width: 3px;
      }

      .el-icon {
        color: #667eea !important;
        transform: scale(1.1);
      }
    }

    .el-icon {
      font-size: 20px;
      margin-right: $spacing-sm;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 20px;
      height: 20px;
    }
  }

  // 折叠状态下的样式
  &.el-menu--collapse {
    :deep(.el-menu-item) {
      margin: 4px $spacing-xs;
      justify-content: center;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-base);
  padding: 0 $spacing-lg;
  height: 64px;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;

    .el-button {
      transition: all 0.3s;

      &:hover {
        transform: rotate(90deg);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-xs $spacing-md;
  border-radius: $border-radius-large;
  transition: all 0.3s;

  &:hover {
    background-color: var(--bg-color-page);
    transform: translateY(-1px);
  }

  .username {
    font-size: $font-size-base;
    color: var(--text-primary);
    font-weight: 500;
  }
}

.main-content {
  background-color: var(--bg-color-page);
  padding: $spacing-lg;
  overflow-y: auto;
  transition: background-color 0.3s;
}
</style>

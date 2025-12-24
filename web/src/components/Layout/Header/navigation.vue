<template>
  <div class="navbar-collapse">
    <ul>
      <li @click="handleSearch">
        <el-icon size="20">
          <MIcon iconName="Search" />
        </el-icon>
      </li>
      <li>
        <el-dropdown trigger="click" placement="bottom-end" :teleported="true"
          @visible-change="handleNotificationVisible">
          <div class="notification-trigger">
            <el-badge :value="unreadCount" class="badge" :hidden="unreadCount === 0">
              <el-icon size="20">
                <MIcon iconName="Bell" />
              </el-icon>
            </el-badge>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="notification-menu">
              <div class="notification-header">
                <span>消息通知</span>
                <el-button text type="primary" size="small" @click="markAllAsRead">全部已读</el-button>
              </div>
              <el-scrollbar height="400px">
                <div v-if="notifications.length > 0">
                  <div v-for="(item, index) in notifications" :key="index" class="notification-item"
                    :class="{ 'is-unread': !item.read }" @click="handleNotificationClick(item)">
                    <el-icon class="notification-icon"
                      :style="{ color: item.type === 'success' ? '#67c23a' : item.type === 'warning' ? '#e6a23c' : item.type === 'error' ? '#f56c6c' : '#409eff' }">
                      <MIcon :iconName="getNotificationIcon(item.type)" />
                    </el-icon>
                    <div class="notification-content">
                      <div class="notification-title">{{ item.title }}</div>
                      <div class="notification-message">{{ item.message }}</div>
                      <div class="notification-time">{{ item.time }}</div>
                    </div>
                    <div v-if="!item.read" class="unread-badge"></div>
                  </div>
                </div>
                <el-empty v-else description="暂无消息" :image-size="100" />
              </el-scrollbar>
              <div class="notification-footer" v-if="notifications.length > 0">
                <el-button text type="primary" @click="viewAllNotifications">查看全部</el-button>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </li>
      <li @click="toggleFullscreen">
        <el-icon size="20">
          <MIcon :iconName="isFullscreen ? 'Aim' : 'FullScreen'" />
        </el-icon>
      </li>
      <li>
        <el-icon size="20">
          <MIcon v-if="isDark" iconName="Moon" @click="triggerTransition" />
          <MIcon v-else iconName="Sunny" @click="triggerTransition" />
        </el-icon>
      </li>
      <li>
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="el-dropdown-link">
            <div class="user">
              <img :src="displayAvatar" :alt="displayName" />
              <span>{{ displayName }}</span>
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in dropdownList" :key="item.path" :command="item.path"
                :divided="index == dropdownList.length - 1">
                <el-icon :size="16">
                  <MIcon :iconName="item.icon" />
                </el-icon>
                <span>{{ item.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </li>
    </ul>

    <!-- 搜索对话框 -->
    <el-dialog v-model="searchDialogVisible" title="全局搜索" width="600px" :close-on-click-modal="false"
      class="search-dialog">
      <el-input v-model="searchKeyword" placeholder="搜索菜单、功能..." clearable @input="handleSearchInput"
        @keyup.enter="handleSearchEnter">
        <template #prefix>
          <el-icon>
            <MIcon iconName="Search" />
          </el-icon>
        </template>
      </el-input>

      <div class="search-results" v-if="searchResults.length > 0">
        <div v-for="(item, index) in searchResults" :key="index" class="search-result-item"
          @click="handleSearchItemClick(item)">
          <el-icon class="result-icon">
            <MIcon :iconName="item.icon || 'Document'" />
          </el-icon>
          <div class="result-content">
            <div class="result-title">{{ item.title }}</div>
            <div class="result-path">{{ item.path }}</div>
          </div>
        </div>
      </div>

      <div class="search-empty" v-else-if="searchKeyword && searchResults.length === 0">
        <el-empty description="未找到相关结果" :image-size="80" />
      </div>

      <div class="search-tips" v-else>
        <p>💡 提示：输入关键词搜索菜单和功能</p>
        <p>支持快捷键：Ctrl + K</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useThemeTransition } from '@/hooks/useThemeTransition'
import { useRouterStore } from '@/stores/router'
import { useUserStore } from '@/stores/user'
import { clearAuthStorage } from '@/utils/storage'
import { storeToRefs } from 'pinia'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/user.jpg'

const router = useRouter()
const routerStore = useRouterStore()
const userStore = useUserStore()
const { isDark, triggerTransition } = useThemeTransition()
const { getUserName, getUserAvatar } = storeToRefs(userStore)

// 全屏功能
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch((err) => {
      console.warn('进入全屏失败:', err)
      ElMessage.warning('浏览器不支持全屏功能')
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch((err) => {
      console.warn('退出全屏失败:', err)
    })
  }
}

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

// 搜索功能
const searchDialogVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref<MenuItem[]>([])

interface MenuItem {
  id: string | number
  title: string
  path: string
  icon?: string
  children?: MenuItem[]
}

// 在菜单树中查找节点（支持路径匹配）
function findNodeInTree(menuList: MenuItem[], path: string): MenuItem | null {
  for (const item of menuList) {
    if (item.path === path) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const found = findNodeInTree(item.children, path)
      if (found) return found
    }
  }
  return null
}

// 查找第一个可用的子菜单项（递归查找）
function findFirstChildMenuItem(menuItem: MenuItem): MenuItem | null {
  // 如果没有子菜单，返回 null
  if (!menuItem.children || menuItem.children.length === 0) {
    return null
  }

  // 遍历子菜单，找到第一个可用的菜单项
  for (const child of menuItem.children) {
    // 如果子菜单项本身没有子菜单，直接返回
    if (!child.children || child.children.length === 0) {
      // 检查路径是否有效
      if (child.path && child.path.trim() !== '') {
        return child
      }
    } else {
      // 如果子菜单项还有子菜单，递归查找
      const firstChild = findFirstChildMenuItem(child)
      if (firstChild) {
        return firstChild
      }
    }
  }

  return null
}

// 递归搜索菜单
function searchMenu(menuList: MenuItem[], keyword: string): MenuItem[] {
  const results: MenuItem[] = []
  const lowerKeyword = keyword.toLowerCase()

  for (const item of menuList) {
    // 检查标题是否匹配
    if (item.title.toLowerCase().includes(lowerKeyword)) {
      results.push(item)
    }

    // 递归搜索子菜单
    if (item.children && item.children.length > 0) {
      const childResults = searchMenu(item.children, keyword)
      results.push(...childResults)
    }
  }

  return results
}

const handleSearch = () => {
  searchDialogVisible.value = true
  // 延迟聚焦输入框
  nextTick(() => {
    const input = document.querySelector('.search-dialog .el-input__inner') as HTMLInputElement
    if (input) {
      input.focus()
    }
  })
}

const handleSearchInput = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  const menuList = routerStore.roles as MenuItem[]
  const results = searchMenu(menuList, searchKeyword.value.trim())
  searchResults.value = results.slice(0, 10) // 限制显示10条结果
}

const handleSearchEnter = () => {
  if (searchResults.value.length > 0) {
    handleSearchItemClick(searchResults.value[0])
  }
}

const handleSearchItemClick = (item: MenuItem) => {
  if (!item.path) {
    return
  }

  // 查找对应的完整菜单项（包含 children 信息）
  const menuList = routerStore.roles as MenuItem[]
  const menuItem = findNodeInTree(menuList, item.path)

  // 如果菜单项存在且有子菜单，跳转到第一个子菜单
  if (menuItem) {
    const firstChild = findFirstChildMenuItem(menuItem)
    if (firstChild && firstChild.path && firstChild.path.trim() !== '') {
      // 跳转到第一个子菜单
      const targetPath = firstChild.path
      router.push(targetPath).catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          console.warn('搜索跳转到子菜单失败:', err, '目标路径:', targetPath)
          // 如果跳转失败，尝试使用 route_name
          if ((firstChild as any).route_name) {
            router.push({ name: (firstChild as any).route_name }).catch(() => {
              console.warn('使用 route_name 跳转也失败')
            })
          }
        }
      })
      searchDialogVisible.value = false
      searchKeyword.value = ''
      searchResults.value = []
      return
    }
  }

  // 如果没有子菜单或找不到子菜单，正常跳转到当前路径
  router.push(item.path).catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.warn('搜索跳转失败:', err, '目标路径:', item.path)
      // 如果跳转失败，尝试使用 route_name（如果有）
      if (menuItem && (menuItem as any).route_name) {
        router.push({ name: (menuItem as any).route_name }).catch(() => {
          console.warn('使用 route_name 跳转也失败')
        })
      }
    }
  })
  searchDialogVisible.value = false
  searchKeyword.value = ''
  searchResults.value = []
}

// 快捷键支持
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl + K 打开搜索
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      handleSearch()
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})

// 消息通知功能
const unreadCount = ref(12)
const notifications = ref([
  {
    id: 1,
    title: '系统通知',
    message: '您有新的系统消息，请及时查看',
    time: '2分钟前',
    type: 'info',
    read: false
  },
  {
    id: 2,
    title: '任务提醒',
    message: '您有一个待处理的任务即将到期',
    time: '1小时前',
    type: 'warning',
    read: false
  },
  {
    id: 3,
    title: '操作成功',
    message: '用户信息已成功更新',
    time: '3小时前',
    type: 'success',
    read: true
  },
  {
    id: 4,
    title: '错误提示',
    message: '数据同步失败，请检查网络连接',
    time: '昨天',
    type: 'error',
    read: false
  }
])

const handleNotificationVisible = (visible: boolean) => {
  // 下拉菜单显示/隐藏时的处理
  if (visible) {
    // 可以在这里加载最新的通知
  }
}

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    success: 'CircleCheck',
    warning: 'Warning',
    error: 'CircleClose',
    info: 'InfoFilled'
  }
  return iconMap[type] || 'Bell'
}

const handleNotificationClick = (item: any) => {
  if (!item.read) {
    item.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  // 这里可以添加跳转到详情页的逻辑
}

const markAllAsRead = () => {
  notifications.value.forEach(item => {
    if (!item.read) {
      item.read = true
    }
  })
  unreadCount.value = 0
  ElMessage.success('已全部标记为已读')
}

const viewAllNotifications = () => {
  // 跳转到消息中心页面
  router.push('/notifications').catch(() => {
    ElMessage.info('消息中心页面开发中...')
  })
}

// 计算显示的用户名和头像
const displayName = computed(() => getUserName.value || '游客')
const displayAvatar = computed(() => {
  const avatar = getUserAvatar.value
  // 如果有头像且是完整路径，直接使用
  if (avatar && (avatar.startsWith('http') || avatar.startsWith('/'))) {
    return avatar
  }
  // 默认头像
  return defaultAvatar
})


const dropdownList = ref([
  {
    label: '个人中心',
    icon: 'User',
    path: '/profile'
  },
  {
    label: '设置',
    icon: 'Setting',
    path: '/setting'
  },
  {
    label: '退出登录',
    icon: 'SwitchButton',
    path: 'logout'
  }
])

const handleCommand = async (command: string | number | object) => {
  if (command === 'logout') {
    try {
      // 调用退出登录接口
      await authApi.logout()
    } catch (error) {
      // 即使接口失败也继续执行退出逻辑
      console.warn('退出登录接口调用失败:', error)
    }
    // 清除所有认证信息和菜单数据
    clearAuthStorage()
    routerStore.clearRoles()
    userStore.clearUserInfo()
    ElMessage.success('已退出登录')
    // 添加错误处理，避免路由错误导致整页刷新
    router.push('/login').catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        console.warn('退出登录路由跳转失败:', err)
      }
    })
  } else {
    const targetPath = command as string
    // 如果目标路径与当前路径相同，避免重复跳转
    if (targetPath === router.currentRoute.value.path) {
      return
    }
    // 添加错误处理，避免路由错误导致整页刷新
    router.push(targetPath).catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        console.warn('导航路由跳转失败:', err, '目标路径:', targetPath)
      }
    })
  }
}


</script>

<style scoped lang="less">
.navbar-collapse {
  display: flex;
  align-items: center;

  ul {
    display: flex;
    flex-direction: row;
    margin-left: auto;
    gap: 10px;

    @keyframes scale-pop {
      0% {
        transform: scale(0.1);
      }

      50% {
        transform: scale(1.3);
      }

      100% {
        transform: scale(1);
      }
    }

    li {
      padding: 6px 8px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s;
      border-radius: 4px;


      i {
        transition: transform 0.3s ease;
      }

      &:hover {
        background-color: var(--el-color-info-light-8);
        color: var(--el-color-primary);

        i {
          animation: scale-pop 0.3s ease;
        }
      }

      .el-dropdown-link {
        outline: 0;

        .user {
          display: flex;
          align-items: center;
          user-select: none;
          gap: 4px;

          img {
            width: 22px;
            height: 22px;
            border-radius: 50%;
          }

          .head {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            margin-right: 10px;
          }
        }
      }
    }
  }
}

// 搜索对话框样式
.search-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .search-results {
    margin-top: 16px;
    max-height: 400px;
    overflow-y: auto;

    .search-result-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;
      margin-bottom: 8px;

      &:hover {
        background-color: var(--el-color-info-light-9);
      }

      .result-icon {
        margin-right: 12px;
        font-size: 20px;
        color: var(--el-color-primary);
      }

      .result-content {
        flex: 1;

        .result-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .result-path {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  .search-empty {
    margin-top: 40px;
  }

  .search-tips {
    margin-top: 40px;
    text-align: center;
    color: var(--el-text-color-regular);
    font-size: 14px;

    p {
      margin: 8px 0;
    }
  }
}

// 消息通知样式
.notification-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.notification-menu {
  width: 380px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background-color: var(--el-bg-color);

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color-page);
    font-weight: 600;
    font-size: 15px;
    color: var(--el-text-color-primary);

    .el-button {
      font-size: 12px;
      padding: 4px 8px;
    }
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 14px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--el-border-color-lighter);
    position: relative;
    background-color: var(--el-bg-color);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--el-color-info-light-9);
    }

    &.is-unread {
      background-color: var(--el-bg-color);
      padding-left: 24px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: var(--el-color-primary);
        border-radius: 0 2px 2px 0;
      }

      .notification-content {
        .notification-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .unread-badge {
        position: absolute;
        right: 16px;
        top: 16px;
        width: 8px;
        height: 8px;
        background-color: var(--el-color-primary);
        border-radius: 50%;
      }
    }

    .notification-icon {
      margin-right: 14px;
      font-size: 20px;
      margin-top: 2px;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background-color: var(--el-color-info-light-9);
      transition: all 0.3s ease;
    }

    &:hover .notification-icon {
      background-color: var(--el-color-primary-light-8);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
      padding-right: 8px;

      .notification-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 6px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .notification-message {
        font-size: 13px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .notification-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 4px;

        &::before {
          content: '🕐';
          font-size: 10px;
        }
      }
    }

    .unread-dot {
      position: absolute;
      right: 16px;
      top: 16px;
      width: 8px;
      height: 8px;
      background-color: var(--el-color-primary);
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
    }
  }

  .notification-footer {
    padding: 12px 20px;
    text-align: center;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color-page);

    .el-button {
      font-weight: 500;
    }
  }
}
</style>

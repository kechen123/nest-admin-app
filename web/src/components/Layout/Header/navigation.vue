<template>
  <div class="navbar-collapse">
    <ul>
      <li>
        <el-icon size="20">
          <MIcon iconName="Search" />
        </el-icon>
      </li>
      <li>
        <el-badge :value="12" class="badge">
          <el-icon size="20">
            <MIcon iconName="Bell" />
          </el-icon>
        </el-badge>
      </li>
      <li>
        <el-icon size="20">
          <MIcon iconName="FullScreen" />
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
  width: 100%;

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
</style>
<style></style>

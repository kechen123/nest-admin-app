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
    path: '/user'
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

const handleCommand = (command: string | number | object) => {
  if (command === 'logout') {
    // 清除所有认证信息和菜单数据
    clearAuthStorage()
    routerStore.clearRoles()
    userStore.clearUserInfo()
    router.push('/login')
  } else {
    router.push(command as string)
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

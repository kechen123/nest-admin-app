<template>
  <LayoutAsideHeader />
  <el-menu :default-active="defaultActive" class="el-menu-vertical" :collapse="isCollapse" @select="handleMenuSelect">
    <template v-for="item in routerPath" :key="item.id">
      <template v-if="item.children && item.children.length > 0">
        <el-sub-menu :index="item.path" :key="item.id">
          <template #title>
            <el-icon v-if="item.icon">
              <MIcon :iconName="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <template v-for="child in item.children" :key="child.id">
            <template v-if="child.children && child.children.length > 0">
              <el-sub-menu :index="child.path" :key="child.id">
                <template #title>
                  <el-icon v-if="child.icon">
                    <MIcon :iconName="child.icon" />
                  </el-icon>
                  <span>{{ child.title }}</span>
                </template>
                <template v-for="sub in child.children" :key="sub.id">
                  <template v-if="sub.children && sub.children.length > 0">
                    <el-sub-menu :index="sub.path" :key="sub.id">
                      <template #title>
                        <el-icon v-if="sub.icon">
                          <MIcon :iconName="sub.icon" />
                        </el-icon>
                        <span>{{ sub.title }}</span>
                      </template>
                      <!-- 继续递归... 可按需扩展更深层级 -->
                    </el-sub-menu>
                  </template>
                  <el-menu-item v-else :index="sub.path" :key="sub.id">
                    <el-icon v-if="sub.icon">
                      <MIcon :iconName="sub.icon" />
                    </el-icon>
                    <span>{{ sub.title }}</span>
                  </el-menu-item>
                </template>
              </el-sub-menu>
            </template>
            <el-menu-item v-else :index="child.path" :key="child.id">
              <el-icon v-if="child.icon">
                <MIcon :iconName="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </template>
      <el-menu-item v-else :index="item.path" :key="item.id">
        <el-icon v-if="item.icon">
          <MIcon :iconName="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script lang="ts" setup>
import { useRouterStore } from '@/stores/router'
import { computed } from 'vue'

interface MenuItem {
  id: string | number
  title: string
  route_name: string
  path: string
  icon?: string
  children?: MenuItem[]
}

const router = useRouter()
const routerSotre = useRouterStore()
const routerPath = computed<MenuItem[]>(() => routerSotre.roles)
const isCollapse = ref(false)
const defaultActive = ref(router.currentRoute.value.path)

function findMenuItemByRouteName(menuList: MenuItem[], path: string): MenuItem | null {
  for (const item of menuList) {
    if (item.path === path) return item
    if (item.children && item.children.length > 0) {
      const found = findMenuItemByRouteName(item.children, path)
      if (found) return found
    }
  }
  return null
}

function handleMenuSelect(path: string) {
  const menuItem = findMenuItemByRouteName(routerPath.value, path)
  if (menuItem) {
    router.push(menuItem.path)
    window.history.replaceState(null, '', menuItem.path)
  }
}

watch(
  () => router.currentRoute.value.path,
  (val) => {
    defaultActive.value = val
  }
)
</script>

<style lang="less">
.el-menu-vertical {
  --el-menu-text-color: var(--el-text-color-primary-light-8);
  --el-menu-hover-bg-color: var(--el-color-info-light-8);
  --el-menu-active-color: var(--el-text-color-primary-light-8);
  --el-menu-active-bg-color: var(--el-color-primary-light-9);
  --el-menu-item-height: 40px;
  --el-menu-sub-item-height: 40px;
  --el-menu-base-level-padding: 12px;
  --el-menu-level-padding: 12px;
  padding: 0 14px;

}


.el-menu-vertical:not(.el-menu--collapse) {
  width: 100%;
  min-height: 400px;
  border: none;

  .el-menu-item {
    // padding-left: 6px !important;
  }
}

@keyframes scale-pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}


.el-menu-item,
.el-sub-menu__title {
  border-radius: 10px;
  margin-bottom: 10px;

  i,
  span {
    transition: transform 0.3s ease;
  }

  &:hover {

    i {
      animation: scale-pop 0.3s ease;
    }


  }
}



.el-menu-item.is-active {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}
</style>

<template>
  <el-breadcrumb separator="/" class="breadcrumb-container">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
      <span v-if="index === breadcrumbList.length - 1" class="breadcrumb-current">
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <MIcon :iconName="item.icon" />
        </el-icon>
        {{ item.title }}
      </span>
      <span v-else class="breadcrumb-link" @click="handleBreadcrumbClick(item)">
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <MIcon :iconName="item.icon" />
        </el-icon>
        {{ item.title }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { useRouterStore } from '@/stores/router'
import { computed } from 'vue'

interface BreadcrumbItem {
  title: string
  path: string
  icon?: string
}

interface MenuItem {
  id: string | number
  title: string
  path: string
  icon?: string
  children?: MenuItem[]
}

const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()

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

// 处理面包屑点击
const handleBreadcrumbClick = (item: BreadcrumbItem) => {
  // 如果路径与当前路径相同，不跳转
  const normalizedCurrentPath = normalizePath(route.path)
  const normalizedItemPath = normalizePath(item.path)
  
  if (normalizedItemPath === normalizedCurrentPath) {
    return
  }
  
  // 查找对应的菜单项
  const menuItem = findNodeInTree(routerStore.roles, item.path)
  
  // 如果菜单项存在且有子菜单，跳转到第一个子菜单
  if (menuItem) {
    const firstChild = findFirstChildMenuItem(menuItem)
    if (firstChild && firstChild.path && firstChild.path.trim() !== '') {
      // 跳转到第一个子菜单
      const targetPath = firstChild.path
      router.push(targetPath).catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          console.warn('面包屑跳转到子菜单失败:', err, '目标路径:', targetPath)
          // 如果跳转失败，尝试使用 route_name
          if ((firstChild as any).route_name) {
            router.push({ name: (firstChild as any).route_name }).catch(() => {
              console.warn('使用 route_name 跳转也失败')
            })
          }
        }
      })
      return
    }
  }
  
  // 如果没有子菜单或找不到子菜单，正常跳转到当前路径
  router.push(item.path).catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.warn('面包屑跳转失败:', err, '目标路径:', item.path)
      // 如果跳转失败，尝试使用 route_name（如果有）
      if (menuItem && (menuItem as any).route_name) {
        router.push({ name: (menuItem as any).route_name }).catch(() => {
          console.warn('使用 route_name 跳转也失败')
        })
      }
    }
  })
}

// 规范化路径（移除尾部斜杠，统一格式）
function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '')
}

// 在菜单树中查找节点（支持路径和 route_name 匹配）
function findNodeInTree(menuList: MenuItem[], path: string): MenuItem | null {
  const normalizedPath = normalizePath(path)
  
  for (const item of menuList) {
    // 精确匹配路径（规范化后）
    if (normalizePath(item.path) === normalizedPath) {
      return item
    }
    // 如果路径不匹配，尝试匹配 route_name（如果有的话）
    if ((item as any).route_name && (item as any).route_name === path) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const found = findNodeInTree(item.children, path)
      if (found) return found
    }
  }
  return null
}

// 查找节点的所有父节点路径
function findParentPath(menuList: MenuItem[], targetPath: string, parents: MenuItem[] = []): MenuItem[] | null {
  const normalizedTargetPath = normalizePath(targetPath)
  
  for (const item of menuList) {
    const currentPath = [...parents, item]
    
    // 精确匹配路径（规范化后）
    if (normalizePath(item.path) === normalizedTargetPath) {
      return currentPath
    }
    
    // 如果当前项有子菜单，递归查找
    if (item.children && item.children.length > 0) {
      const found = findParentPath(item.children, targetPath, currentPath)
      if (found) return found
    }
  }
  return null
}

// 生成面包屑列表
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const menuList = routerStore.roles
  const currentPath = route.path
  
  // 如果路径是首页，直接返回首页
  if (currentPath === '/' || currentPath === '/index') {
    return [{ title: '首页', path: '/', icon: 'HomeFilled' }]
  }
  
  // 查找当前节点
  const currentNode = findNodeInTree(menuList, currentPath)
  if (!currentNode) {
    // 如果找不到节点，尝试从路由 meta 中获取
    const routeMeta = route.meta
    if (routeMeta?.title) {
      return [{ title: routeMeta.title as string, path: currentPath }]
    }
    return [{ title: '未知页面', path: currentPath }]
  }
  
  // 查找父节点路径
  const parentPath = findParentPath(menuList, currentPath)
  if (parentPath && parentPath.length > 0) {
    return parentPath.map(item => ({
      title: item.title,
      path: item.path,
      icon: item.icon
    }))
  }
  
  // 如果没有父节点，只返回当前节点
  return [{
    title: currentNode.title,
    path: currentNode.path,
    icon: currentNode.icon
  }]
})
</script>

<style scoped lang="less">
.breadcrumb-container {
  display: flex;
  align-items: center;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      font-size: 14px;
    }
  }
  
  .breadcrumb-link {
    display: flex;
    align-items: center;
    color: var(--el-text-color-regular);
    text-decoration: none;
    transition: color 0.3s;
    cursor: pointer;
    user-select: none;
    
    &:hover {
      color: var(--el-color-primary);
    }
    
    .breadcrumb-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
  
  .breadcrumb-current {
    display: flex;
    align-items: center;
    color: var(--el-text-color-primary);
    font-weight: 500;
    
    .breadcrumb-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}
</style>


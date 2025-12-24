<template>
  <div class="tags">
    <el-scrollbar>
      <div class="container">
        <div class="item" v-for="item in tagsStore.tags" :key="item.name"
          :class="[item.name === tagsStore.active.name ? 'active' : '']" @click.stop="tagClick(item)">
          <el-icon v-if="item.icon" size="14" class="icon">
            <MIcon :iconName="item.icon" />
          </el-icon>
          <span class="name">
            {{ item.name }}
          </span>
          <el-icon size="16" class="close" @click.stop="delPage(item.path)">
            <MIcon iconName="Close" />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useTagsStore } from '@/stores/tags'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsStore()

watch(route, () => {
  setTags(route)
})

watch(
  () => tagsStore.active.path,
  (newVal) => {
    // 如果路径为空或与当前路径相同，避免重复跳转
    if (!newVal || newVal === router.currentRoute.value.path) {
      return
    }
    // 添加错误处理，避免路由错误导致整页刷新
    router.push(newVal).catch((err) => {
      // NavigationDuplicated 错误可以忽略（重复导航）
      if (err.name !== 'NavigationDuplicated') {
        console.warn('标签页路由跳转失败:', err, '目标路径:', newVal)
      }
    })
  }
)

const tagClick = (item: any) => {
  tagsStore.changeTag(item.path)
}

const delPage = (path: string) => {
  tagsStore.removeTag(path)
}

// 设置标签
const setTags = (route: any) => {
  const isExist = tagsStore.tags.some((item) => {
    return item.path === route.fullPath
  })
  if (isExist) {
    tagsStore.changeTag(route.fullPath)
  } else {
    tagsStore.addTag(route.fullPath)
  }
}
</script>

<style scoped lang="less">
.tags {
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  // height: 32px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--el-border-color);
  }

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    flex-wrap: nowrap; // 确保标签不换行

    .item {
      display: flex;
      align-items: center;
      height: 100%;
      border-right: solid 1px var(--el-border-color);
      padding: 0 4px 0 16px;
      cursor: pointer;
      flex-shrink: 0; // 标签不收缩
      white-space: nowrap; // 标签内容不换行
      max-width: 200px; // 设置标签最大宽度

      .icon {
        margin-right: 4px;
        flex-shrink: 0; // 图标不收缩
        color: var(--tag-text-color);
      }

      .name {
        font-size: 14px;
        color: var(--tag-text-color);
        white-space: nowrap; // 文字不换行
        overflow: hidden; // 超出隐藏
        text-overflow: ellipsis; // 超出显示省略号
        flex: 1; // 占据可用空间
        min-width: 0; // 允许文字收缩以显示省略号
      }

      &:hover {
        background-color: var(--el-bg-color-page);
        color: var(--el-color-primary);

        .icon {
          color: var(--el-color-primary);
        }

        .close {
          opacity: 1;

        }
      }

      .close {
        opacity: 0;
        color: var(--tag-btn-text-color);
        margin-left: 4px;
        border-radius: 4px;
        height: 20px;
        width: 20px;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
          background-color: var(--el-color-info-light-7);
        }
      }
    }

    .active {
      background-color: var(--el-bg-color-page);
      position: relative;
      z-index: 1;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: var(--el-color-primary);
      }

      .icon {
        color: var(--el-color-primary);
      }

      .name {
        color: var(--el-color-primary);
      }

      .close {
        color: var(--el-color-primary);
        opacity: 1;
      }
    }
  }
}
</style>

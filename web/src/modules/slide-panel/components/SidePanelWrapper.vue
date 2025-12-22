<template>
  <div class="side-panel-wrapper" :class="{ fullscreen }">
    <div class="header">
      <div class="title">{{ title }}</div>
      <div class="actions">
        <div class="btn" @click="toggleFullscreen">
          <el-icon size="20">
            <MIcon iconName="FullScreen" />
          </el-icon>
        </div>
        <div class="btn" @click="onClose">
          <el-icon size="20">
            <MIcon iconName="CircleClose" />
          </el-icon>
        </div>
      </div>
    </div>
    <div class="body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'

defineProps<{ title: string }>()

const close = inject<() => void>('slideClose')


const fullscreen = ref(false)

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
}
const onClose = () => close?.()
</script>

<style scoped lang="less">
.side-panel-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
  transform: scale(1);
  overflow: hidden;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color);

    .title {}

    .actions {
      display: flex;
      align-items: center;

      .btn {
        padding: 6px;
        height: 34px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s;
        border-radius: 4px;

        i {
          transition: transform 0.3s ease;
        }

        &:hover {
          background-color: var(--el-color-primary-light-7);

          i {
            animation: scale-pop 0.3s ease;
          }
        }
      }

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
    }

  }

  .body {
    flex: 1;
    overflow: auto;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color);
  }
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: #fff;
  overflow: auto;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

/* ✅ 进入动画：放大淡入 */
.fullscreen-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.fullscreen-enter-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fullscreen-enter-to {
  transform: scale(1);
  opacity: 1;
}

/* ✅ 离开动画：缩小淡出 */
.fullscreen-leave-from {
  transform: scale(1);
  opacity: 1;
}

.fullscreen-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fullscreen-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>

<template>
  <Transition name="page-loading-fade">
    <div v-if="visible" class="page-loading-container" :class="{ 'is-dark': isDark }">
      <div class="page-loading-content">
        <div class="loading-icon">
          <svg width="200" height="200" viewBox="0 0 40 60">
            <polygon class="triangle" fill="none" :stroke="isDark ? '#fff' : '#000'" stroke-width="1"
              points="16,1 32,32 1,32" />
            <text v-if="text" class="loading" x="0" y="45" :fill="isDark ? '#fff' : '#000'">{{ text }}</text>
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Loading...',
})

const visible = ref(false)
const isDark = ref(false)

// 检测暗色模式
const checkDarkMode = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

// 监听暗色模式变化
const observer = new MutationObserver(() => {
  checkDarkMode()
})

onMounted(() => {
  checkDarkMode()
  // 监听class变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onBeforeUnmount(() => {
  // 清理observer
  observer.disconnect()
})

// 显示loading
const show = () => {
  visible.value = true
}

// 隐藏loading
const hide = () => {
  visible.value = false
}

// 暴露方法
defineExpose({
  show,
  hide,
})
</script>

<style scoped lang="less">
.page-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &.is-dark {
    background: rgba(0, 0, 0, 0.8);
  }
}

.page-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.triangle {
  stroke-dasharray: 17;
  animation: dash 2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: 136;
  }
}

.loading {
  font-family: 'Orbitron', sans-serif;
  font-size: 7px;
  animation: blink .9s ease-in-out infinite alternate;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

// 过渡动画
.page-loading-fade-enter-active,
.page-loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-loading-fade-enter-from,
.page-loading-fade-leave-to {
  opacity: 0;
}
</style>

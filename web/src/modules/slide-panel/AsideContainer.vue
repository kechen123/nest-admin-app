<template>
  <div class="container">
    <div class="aside" :class="{ minimized: isMinimized }" :style="asideStyle" ref="asideRef">
      <div class="header" v-if="!isMinimized">
        <slot name="asideTitle">
          <div class="title">标题</div>
        </slot>
        <div class="actions">
          <div class="btn" @click="toggleAside">
            <el-icon size="20">
              <MIcon iconName="Minus" />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="body">
        <slot name="asideBody" />
      </div>
    </div>

    <div class="content" ref="contentRef">
      <transition name="float-zoom">
        <div v-if="isMinimized" class="floating-button" @click="toggleAside">
          <el-icon size="18">
            <MIcon iconName="ArrowLeft" />
          </el-icon>
        </div>
      </transition>

      <SlideContainer ref="containerRef">
        <slot />
      </SlideContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import SlideContainer from './SlideContainer.vue'

interface Props {
  asideWidth?: string | number
  minimized?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  asideWidth: '400px',
  minimized: false
})

const containerRef = ref()
const isMinimized = ref(props.minimized)
const asideRef = ref()

// 计算aside样式
const asideStyle = computed(() => {
  if (isMinimized.value) {
    return { width: '0px', border: 'none' }
  }
  return { width: typeof props.asideWidth === 'number' ? `${props.asideWidth}px` : props.asideWidth }
})

const toggleAside = async () => {
  isMinimized.value = !isMinimized.value
  await nextTick()
  setTimeout(() => {
    containerRef.value.updateContentLayout()
  }, 500)
}

const openRight = (options: any) => {
  containerRef.value.open(options)
}
const closeRight = () => {
  containerRef.value.close()
}

// 监听外部minimized变化
watch(() => props.minimized, (newVal) => {
  isMinimized.value = newVal
})

defineExpose({
  open: openRight,
  close: closeRight,
  toggleAside
})
</script>


<style lang="less" scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.aside {
  border-radius: 8px;
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
  background-color: var(--el-bg-color);
  border: solid 1px var(--el-border-color);

  &.minimized {
    width: 0;
    border: none;
  }

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
}

.content {
  flex: 1;
  width: 100%;
  height: 100%;
}

.floating-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 4px;
  /* 吸附到左侧外边缘 */
  width: 36px;
  height: 36px;
  background-color: var(--el-bg-color);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: background 0.3s;
}

.floating-button:hover {
  background: var(--el-color-primary-light-7);
}

.float-zoom-enter-active,
.float-zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.float-zoom-enter-from,
.float-zoom-leave-to {
  transform: scale(0.3);
  opacity: 0;
}
</style>

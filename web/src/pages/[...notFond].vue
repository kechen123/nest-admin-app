<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404 数字动画 -->
      <div class="error-code">
        <span class="code-item" v-for="(num, index) in errorCode" :key="index"
          :style="{ animationDelay: `${index * 0.1}s` }">
          {{ num }}
        </span>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon>
            <HomeFilled />
          </el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回上一页
        </el-button>
      </div>

      <!-- 装饰性元素 -->
      <div class="decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorCode = ['4', '0', '4']

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped lang="less">
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color-page);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.not-found-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: var(--el-text-color-primary);
}

.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  font-family: 'Arial', sans-serif;

  .code-item {
    display: inline-block;
    animation: bounceIn 0.8s ease-out forwards;
    opacity: 0;
    color: var(--el-text-color-primary);
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.error-info {
  margin-bottom: 40px;

  .error-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }

  .error-description {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0;
  }
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  :deep(.el-button) {
    padding: 12px 32px;
    font-size: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    &.el-button--primary {
      // 使用 Element Plus 默认的主色按钮样式
    }

    &:not(.el-button--primary) {
      // 使用 Element Plus 默认的次要按钮样式
    }
  }
}

.decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: var(--el-border-color-lighter);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;

  &.circle-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.circle-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
  }

  &.circle-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-100px);
  }

  50% {
    opacity: 1;
    transform: scale(1.05) translateY(0);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
    gap: 10px;
  }

  .error-info {
    .error-title {
      font-size: 24px;
    }

    .error-description {
      font-size: 14px;
    }
  }

  .error-actions {
    flex-direction: column;
    align-items: stretch;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .circle {
    &.circle-1 {
      width: 120px;
      height: 120px;
    }

    &.circle-2 {
      width: 80px;
      height: 80px;
    }

    &.circle-3 {
      width: 60px;
      height: 60px;
    }
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 60px;
  }

  .error-info {
    .error-title {
      font-size: 20px;
    }
  }
}
</style>

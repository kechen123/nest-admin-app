<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ welcomeText }}</h1>
        <p class="welcome-desc">{{ currentTime }}</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" :icon="Plus" @click="goToTestA">新建任务</el-button>
        <el-button :icon="Document">查看文档</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" v-for="(stat, index) in stats" :key="index" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon :size="24">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon :size="12">
                <ArrowUp v-if="stat.trend > 0" />
                <ArrowDown v-else />
              </el-icon>
              <span>{{ Math.abs(stat.trend) }}%</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：快捷操作和最近活动 -->
      <div class="left-section">
        <!-- 快捷操作 -->
        <el-card class="quick-actions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" v-for="(action, index) in quickActions" :key="index"
              @click="handleAction(action.path)">
              <div class="action-icon" :style="{ backgroundColor: action.color }">
                <el-icon :size="20">
                  <component :is="action.icon" />
                </el-icon>
              </div>
              <span class="action-label">{{ action.label }}</span>
            </div>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="recent-activities-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近活动</span>
              <el-button text type="primary" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="activities-list">
            <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
              <div class="activity-icon" :style="{ backgroundColor: activity.color }">
                <el-icon :size="16">
                  <component :is="activity.icon" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：系统信息和通知 -->
      <div class="right-section">
        <!-- 系统信息 -->
        <el-card class="system-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">系统信息</span>
            </div>
          </template>
          <div class="system-info-list">
            <div class="info-item" v-for="(info, index) in systemInfo" :key="index">
              <span class="info-label">{{ info.label }}</span>
              <span class="info-value" :class="info.status">{{ info.value }}</span>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todos-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">待办事项</span>
              <el-badge :value="todos.length" class="todo-badge" />
            </div>
          </template>
          <div class="todos-list">
            <div class="todo-item" v-for="(todo, index) in todos" :key="index">
              <el-checkbox v-model="todo.completed" />
              <span class="todo-text" :class="{ completed: todo.completed }">
                {{ todo.text }}
              </span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Document,
  User,
  ShoppingCart,
  Money,
  DataLine,
  ArrowUp,
  ArrowDown,
  Setting,
  UserFilled,
  Menu,
  Bell,
  DocumentAdd,
  Edit,
  Delete,
  Check,
  CircleCheck,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 欢迎文本和时间
const welcomeText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了，注意休息'
})

const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const stats = ref([
  {
    label: '总用户数',
    value: '12,345',
    trend: 12.5,
    icon: markRaw(User),
    color: 'rgba(64, 158, 255, 0.1)'
  },
  {
    label: '今日订单',
    value: '1,234',
    trend: -5.2,
    icon: markRaw(ShoppingCart),
    color: 'rgba(103, 194, 58, 0.1)'
  },
  {
    label: '总收入',
    value: '¥123,456',
    trend: 8.3,
    icon: markRaw(Money),
    color: 'rgba(230, 162, 60, 0.1)'
  },
  {
    label: '访问量',
    value: '56,789',
    trend: 15.6,
    icon: markRaw(DataLine),
    color: 'rgba(144, 147, 153, 0.1)'
  }
])

// 快捷操作
const quickActions = ref([
  { label: '用户管理', icon: markRaw(UserFilled), path: '/system/user', color: '#409EFF' },
  { label: '系统设置', icon: markRaw(Setting), path: '/settings', color: '#67C23A' },
  { label: '菜单管理', icon: markRaw(Menu), path: '/system/menu', color: '#E6A23C' },
  { label: '通知中心', icon: markRaw(Bell), path: '/notifications', color: '#F56C6C' },
  { label: '新建文档', icon: markRaw(DocumentAdd), path: '/documents/new', color: '#909399' },
  { label: '数据统计', icon: markRaw(DataLine), path: '/statistics', color: '#409EFF' }
])

// 最近活动
const recentActivities = ref([
  {
    text: '用户 张三 创建了新订单',
    time: '5分钟前',
    icon: markRaw(ShoppingCart),
    color: '#409EFF'
  },
  {
    text: '系统更新了菜单配置',
    time: '1小时前',
    icon: markRaw(Setting),
    color: '#67C23A'
  },
  {
    text: '用户 李四 修改了个人信息',
    time: '2小时前',
    icon: markRaw(User),
    color: '#E6A23C'
  },
  {
    text: '新增了 3 条待办事项',
    time: '3小时前',
    icon: markRaw(DocumentAdd),
    color: '#F56C6C'
  }
])

// 系统信息
const systemInfo = ref([
  { label: '系统版本', value: 'v1.0.0', status: 'normal' },
  { label: '运行状态', value: '正常', status: 'success' },
  { label: '服务器负载', value: '45%', status: 'normal' },
  { label: '数据库连接', value: '正常', status: 'success' },
  { label: '缓存状态', value: '正常', status: 'success' }
])

// 待办事项
const todos = ref([
  { text: '完成首页设计优化', completed: true },
  { text: '修复已知问题', completed: false },
  { text: '更新用户文档', completed: false },
  { text: '准备下周会议材料', completed: false }
])

// 处理快捷操作点击
const handleAction = (path: string) => {
  router.push(path)
}

const goToTestA = () => {
  router.push({
    path: '/test/testaa',
    query: {
      id: 1
    }
  })
}
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 24px;
  height: 100%;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

// 欢迎区域
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .welcome-content {
    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .welcome-desc {
      font-size: 15px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
  }

  .welcome-actions {
    display: flex;
    gap: 12px;

    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
      margin-top: 16px;

      .el-button {
        width: 100%;
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  .stat-card {
    transition: all 0.3s ease;
    border: 1px solid var(--el-border-color-lighter);
    overflow: hidden;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: var(--el-color-primary-light-7);
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-color-primary);
        flex-shrink: 0;
        transition: transform 0.3s ease;
      }

      &:hover .stat-icon {
        transform: scale(1.1);
      }

      .stat-info {
        flex: 1;
        min-width: 0;

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 10px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          background-color: var(--el-bg-color-page);

          &.up {
            color: var(--el-color-success);
          }

          &.down {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }
}

// 主要内容区域
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

// 左侧区域
.left-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 右侧区域
.right-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 卡片通用样式
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;

  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: -0.3px;
  }
}

// 所有卡片统一样式
:deep(.el-card) {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .el-card__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color-page);
    flex-shrink: 0;
  }

  .el-card__body {
    padding: 24px;
    flex: 1;
  }
}

// 快捷操作和系统信息卡片不设置高度限制，让内容自然展开
.quick-actions-card,
.system-info-card {
  :deep(.el-card) {
    height: auto;
  }

  :deep(.el-card__body) {
    overflow: visible;
  }
}

// 最近活动和待办事项可以滚动
.recent-activities-card,
.todos-card {
  :deep(.el-card) {
    height: 100%;
  }

  :deep(.el-card__body) {
    overflow-y: auto;
  }
}

// 快捷操作
.quick-actions-card {
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
      border: 1px solid var(--el-border-color-lighter);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        border-color: var(--el-color-primary-light-7);
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);

        &::before {
          opacity: 1;
        }

        .action-icon,
        .action-label {
          position: relative;
          z-index: 1;
        }
      }

      .action-icon {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        transition: transform 0.3s ease;
      }

      &:hover .action-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .action-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        transition: color 0.3s ease;
      }

      &:hover .action-label {
        color: var(--el-color-primary);
      }
    }
  }
}

// 最近活动
.recent-activities-card {
  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: 10px;
      transition: all 0.3s ease;
      border: 1px solid transparent;
      cursor: pointer;

      &:hover {
        background-color: var(--el-bg-color-page);
        border-color: var(--el-border-color-lighter);
        transform: translateX(4px);
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .activity-content {
        flex: 1;
        min-width: 0;

        .activity-text {
          font-size: 14px;
          color: var(--el-text-color-primary);
          margin-bottom: 6px;
          line-height: 1.5;
          font-weight: 500;
        }

        .activity-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

// 系统信息
.system-info-card {
  .system-info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--el-bg-color-page) 0%, var(--el-bg-color) 100%);
      border: 1px solid var(--el-border-color-lighter);
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--el-bg-color-page);
        border-color: var(--el-color-primary-light-7);
        transform: translateX(4px);
      }

      .info-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 6px;
        background-color: var(--el-bg-color);

        &.success {
          color: var(--el-color-success);
          background-color: var(--el-color-success-light-9);
        }

        &.warning {
          color: var(--el-color-warning);
          background-color: var(--el-color-warning-light-9);
        }

        &.danger {
          color: var(--el-color-danger);
          background-color: var(--el-color-danger-light-9);
        }

        &.normal {
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

// 待办事项
.todos-card {
  .card-header {
    .todo-badge {
      :deep(.el-badge__content) {
        background-color: var(--el-color-danger);
      }
    }
  }

  .todos-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      transition: all 0.3s ease;
      border: 1px solid transparent;
      cursor: pointer;

      &:hover {
        background-color: var(--el-bg-color-page);
        border-color: var(--el-border-color-lighter);
        transform: translateX(4px);
      }

      :deep(.el-checkbox) {
        .el-checkbox__input.is-checked .el-checkbox__inner {
          background-color: var(--el-color-success);
          border-color: var(--el-color-success);
        }
      }

      .todo-text {
        flex: 1;
        font-size: 14px;
        color: var(--el-text-color-primary);
        font-weight: 500;
        transition: all 0.3s ease;

        &.completed {
          text-decoration: line-through;
          color: var(--el-text-color-secondary);
          opacity: 0.6;
        }
      }
    }
  }
}
</style>

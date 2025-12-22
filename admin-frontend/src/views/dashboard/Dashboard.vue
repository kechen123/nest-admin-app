<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in cardData" :key="card.title">
        <DataCard :title="card.title" :value="card.value" :icon="card.icon" :icon-bg-color="card.iconBgColor"
          :subtitle="card.subtitle" :format-number="card.formatNumber" />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="dashboard-charts">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表数据加载中..." />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>用户分布</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表数据加载中..." />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和最近活动 -->
    <el-row :gutter="20" class="dashboard-bottom">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button v-for="action in quickActions" :key="action.label" :type="action.type" :icon="action.icon"
              @click="handleQuickAction(action)">
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in recentActivities" :key="index" :timestamp="activity.time"
              placement="top">
              <div class="activity-item">
                <el-icon class="activity-icon" :color="activity.color">
                  <component :is="activity.icon" />
                </el-icon>
                <span>{{ activity.content }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  User,
  Document,
  ShoppingBag,
  Money,
  Plus,
  Edit,
  Delete,
  View,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import DataCard from '@/components/DataCard/DataCard.vue';

const router = useRouter();

const chartTimeRange = ref('week');

const cardData = ref([
  {
    title: '总用户数',
    value: 1234,
    icon: User,
    iconBgColor: '#409eff',
    subtitle: '较上月增长 12%',
    formatNumber: true,
  },
  {
    title: '总订单数',
    value: 5678,
    icon: ShoppingBag,
    iconBgColor: '#67c23a',
    subtitle: '较上月增长 8%',
    formatNumber: true,
  },
  {
    title: '总收入',
    value: 98765,
    icon: Money,
    iconBgColor: '#e6a23c',
    subtitle: '较上月增长 15%',
    formatNumber: true,
  },
  {
    title: '文档数量',
    value: 4321,
    icon: Document,
    iconBgColor: '#f56c6c',
    subtitle: '较上月增长 5%',
    formatNumber: true,
  },
]);

const quickActions = ref([
  { label: '新增用户', icon: Plus, type: 'primary', path: '/user' },
  { label: '编辑', icon: Edit, type: 'success', action: 'edit' },
  { label: '查看', icon: View, type: 'info', action: 'view' },
  { label: '删除', icon: Delete, type: 'danger', action: 'delete' },
]);

const recentActivities = ref([
  {
    content: '用户 admin 登录系统',
    time: '2024-01-15 10:30',
    icon: User,
    color: '#409eff',
  },
  {
    content: '新增了 5 个用户',
    time: '2024-01-15 09:20',
    icon: Plus,
    color: '#67c23a',
  },
  {
    content: '修改了用户权限设置',
    time: '2024-01-15 08:15',
    icon: Edit,
    color: '#e6a23c',
  },
  {
    content: '删除了 2 条过期数据',
    time: '2024-01-14 16:45',
    icon: Delete,
    color: '#f56c6c',
  },
]);

const handleQuickAction = (action: any) => {
  if (action.path) {
    router.push(action.path);
  } else {
    ElMessage.info(`执行操作: ${action.label}`);
  }
};
</script>

<style scoped lang="scss">
.dashboard-container {
  .dashboard-cards {
    margin-bottom: $spacing-lg;
  }

  .dashboard-charts {
    margin-bottom: $spacing-lg;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .dashboard-bottom {
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-md;

      .el-button {
        flex: 1;
        min-width: 120px;
      }
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .activity-icon {
        font-size: 18px;
      }
    }
  }
}
</style>

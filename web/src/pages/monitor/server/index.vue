<template>
  <div class="server-monitor">
    <el-card class="box-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>服务器信息</span>
          <el-button type="primary" :icon="Refresh" @click="refresh">刷新</el-button>
        </div>
      </template>

      <el-row :gutter="20" v-if="serverInfo">
        <!-- CPU信息 -->
        <el-col :span="12">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <span>CPU信息</span>
            </template>
            <div class="info-item">
              <span class="label">CPU核心数：</span>
              <span class="value">{{ serverInfo.cpu.num }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPU型号：</span>
              <span class="value">{{ serverInfo.cpu.model }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPU使用率：</span>
              <el-progress :percentage="Math.round(serverInfo.cpu.usage)" :color="getProgressColor(serverInfo.cpu.usage)" />
            </div>
          </el-card>
        </el-col>

        <!-- 内存信息 -->
        <el-col :span="12">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <span>内存信息</span>
            </template>
            <div class="info-item">
              <span class="label">总内存：</span>
              <span class="value">{{ formatBytes(serverInfo.mem.total) }}</span>
            </div>
            <div class="info-item">
              <span class="label">已用内存：</span>
              <span class="value">{{ formatBytes(serverInfo.mem.used) }}</span>
            </div>
            <div class="info-item">
              <span class="label">可用内存：</span>
              <span class="value">{{ formatBytes(serverInfo.mem.free) }}</span>
            </div>
            <div class="info-item">
              <span class="label">内存使用率：</span>
              <el-progress :percentage="Math.round(serverInfo.mem.usage)" :color="getProgressColor(serverInfo.mem.usage)" />
            </div>
          </el-card>
        </el-col>

        <!-- 系统信息 -->
        <el-col :span="12" style="margin-top: 20px;">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <span>系统信息</span>
            </template>
            <div class="info-item">
              <span class="label">服务器名称：</span>
              <span class="value">{{ serverInfo.sys.computerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">服务器IP：</span>
              <span class="value">{{ serverInfo.sys.computerIp }}</span>
            </div>
            <div class="info-item">
              <span class="label">操作系统：</span>
              <span class="value">{{ serverInfo.sys.osName }}</span>
            </div>
            <div class="info-item">
              <span class="label">系统架构：</span>
              <span class="value">{{ serverInfo.sys.osArch }}</span>
            </div>
          </el-card>
        </el-col>

        <!-- JVM信息 -->
        <el-col :span="12" style="margin-top: 20px;">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <span>运行时信息 ({{ serverInfo.jvm.name }})</span>
            </template>
            <div class="info-item">
              <span class="label">版本：</span>
              <span class="value">{{ serverInfo.jvm.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">总内存：</span>
              <span class="value">{{ formatBytes(serverInfo.jvm.total) }}</span>
            </div>
            <div class="info-item">
              <span class="label">已用内存：</span>
              <span class="value">{{ formatBytes(serverInfo.jvm.used) }}</span>
            </div>
            <div class="info-item">
              <span class="label">可用内存：</span>
              <span class="value">{{ formatBytes(serverInfo.jvm.free) }}</span>
            </div>
            <div class="info-item">
              <span class="label">内存使用率：</span>
              <el-progress :percentage="Math.round(serverInfo.jvm.usage)" :color="getProgressColor(serverInfo.jvm.usage)" />
            </div>
          </el-card>
        </el-col>

        <!-- 磁盘信息 -->
        <el-col :span="24" style="margin-top: 20px;">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <span>磁盘信息</span>
            </template>
            <div class="info-item">
              <span class="label">总容量：</span>
              <span class="value">{{ formatBytes(serverInfo.disk.total) }}</span>
            </div>
            <div class="info-item">
              <span class="label">已用容量：</span>
              <span class="value">{{ formatBytes(serverInfo.disk.used) }}</span>
            </div>
            <div class="info-item">
              <span class="label">可用容量：</span>
              <span class="value">{{ formatBytes(serverInfo.disk.free) }}</span>
            </div>
            <div class="info-item">
              <span class="label">磁盘使用率：</span>
              <el-progress :percentage="Math.round(serverInfo.disk.usage)" :color="getProgressColor(serverInfo.disk.usage)" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { monitorApi, type ServerInfo } from '@/api/monitor'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const serverInfo = ref<ServerInfo | null>(null)

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 获取进度条颜色
const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 加载服务器信息
const loadServerInfo = async () => {
  loading.value = true
  try {
    serverInfo.value = await monitorApi.getServerInfo()
  } catch (error) {
    ElMessage.error('获取服务器信息失败')
  } finally {
    loading.value = false
  }
}

// 刷新
const refresh = () => {
  loadServerInfo()
}

onMounted(() => {
  loadServerInfo()
})
</script>

<style scoped lang="less">
.server-monitor {
  padding: 20px;

  .box-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .info-card {
    margin-bottom: 20px;

    .info-item {
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      .label {
        width: 120px;
        font-weight: 500;
        color: #606266;
      }

      .value {
        flex: 1;
        color: #303133;
      }

      :deep(.el-progress) {
        flex: 1;
      }
    }
  }
}
</style>

<route>
{
  meta: {
    title: '服务监控',
    requiresAuth: true,
    permissions: ['monitor:server:list']
  }
}
</route>


<template>
  <div class="test-page">
    <h2>Search 组件测试</h2>

    <KcSearch :config="searchConfig" v-model="searchData" @search="handleSearch" @reset="handleReset" />

    <div class="result">
      <h3>搜索数据：</h3>
      <pre>{{ JSON.stringify(searchData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KcSearch from './Search/index.vue'
import type { SearchConfig } from './types'

const searchData = ref({})

const searchConfig: SearchConfig = {
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      placeholder: '请输入用户名'
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱'
    },
    {
      key: 'role',
      label: '角色',
      type: 'select',
      placeholder: '请选择角色',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' }
      ]
    }
  ],
  defaultCount: 2,
  showSearch: true,
  showReset: true
}

const handleSearch = (data: Record<string, any>) => {
  console.log('搜索:', data)
}

const handleReset = () => {
  console.log('重置')
}
</script>

<style lang="less" scoped>
.test-page {
  padding: 20px;

  .result {
    margin-top: 20px;

    pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      font-size: 14px;
    }
  }
}
</style>

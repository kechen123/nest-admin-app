<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/default.vue'
import CustomLayout from '@/layouts/custom.vue'

const route = useRoute()

// 布局映射
const layouts = {
  default: DefaultLayout,
  custom: CustomLayout,
}

// 根据路由 meta.layout 获取布局组件，默认为 default
const layoutComponent = computed(() => {
  const layoutName = (route.meta?.layout as string) || 'default'
  return layouts[layoutName as keyof typeof layouts] || DefaultLayout
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <component :is="layoutComponent" />
  </el-config-provider>
</template>

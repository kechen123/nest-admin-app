<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

const route = useRoute();

const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title);
  return matched.map((item) => ({
    title: item.meta.title as string,
    path: item.path,
  }));
});
</script>

<style scoped lang="scss">
.breadcrumb {
  margin-bottom: $spacing-md;
}
</style>

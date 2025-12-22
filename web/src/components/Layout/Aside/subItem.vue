<template>
  <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.route_name">
    <template #title>
      <el-icon v-if="item.icon">
        <MIcon :iconName="item.icon" />
      </el-icon>
      <span>{{ item.title }}</span>
    </template>
    <sub-item :key="index" :item="item1" v-for="(item1, index) in item.children" />
  </el-sub-menu>
  <el-menu-item v-else :index="item.route_name">
    <template #title>
      <el-icon v-if="item.icon">
        <MIcon :iconName="item.icon" />
      </el-icon>
      <span>{{ item.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
interface Props {
  item: {
    title: string
    path: string
    route_name: string
    icon?: string
    disabled?: boolean
    children?: Array<any>
  }
  parentPath?: string
  level?: Number
}

const { item } = defineProps<Props>()
</script>

<style scoped></style>

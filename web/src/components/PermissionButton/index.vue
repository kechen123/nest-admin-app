<template>
  <el-button v-if="hasPermissionValue" v-bind="$attrs" @click="handleClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasPermission, hasAnyPermission } from '@/utils/permission'

interface Props {
  permission?: string
  anyPermission?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  permission: '',
  anyPermission: () => [],
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const hasPermissionValue = computed(() => {
  // 如果都没有设置，默认显示
  if (!props.permission && props.anyPermission.length === 0) {
    return true
  }

  // 检查单个权限
  if (props.permission) {
    return hasPermission(props.permission)
  }

  // 检查任意权限
  if (props.anyPermission.length > 0) {
    return hasAnyPermission(props.anyPermission)
  }

  return false
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>


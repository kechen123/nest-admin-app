<template>
  <el-button v-if="hasPermission" v-bind="$attrs" @click="handleClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '@/stores/permission';

interface Props {
  permission?: string;
  role?: string;
  anyPermission?: string[];
  anyRole?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  permission: '',
  role: '',
  anyPermission: () => [],
  anyRole: () => [],
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const permissionStore = usePermissionStore();

const hasPermission = computed(() => {
  // 如果都没有设置，默认显示
  if (
    !props.permission &&
    !props.role &&
    props.anyPermission.length === 0 &&
    props.anyRole.length === 0
  ) {
    return true;
  }

  // 检查单个权限
  if (props.permission) {
    if (!permissionStore.hasPermission(props.permission)) {
      return false;
    }
  }

  // 检查单个角色
  if (props.role) {
    if (!permissionStore.hasRole(props.role)) {
      return false;
    }
  }

  // 检查任意权限
  if (props.anyPermission.length > 0) {
    if (!permissionStore.hasAnyPermission(props.anyPermission)) {
      return false;
    }
  }

  // 检查任意角色
  if (props.anyRole.length > 0) {
    if (!permissionStore.hasAnyRole(props.anyRole)) {
      return false;
    }
  }

  return true;
});

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<template>
  <div class="user-management-container">
    <div class="left-panel" :class="{ 'is-hidden': isDeptListFloating }">
      <DeptList v-model="selectedDeptId" @change="handleDeptChange" @float-change="handleFloatChange" />
    </div>
    <div class="right-panel" :class="{ 'is-full-width': isDeptListFloating }">
      <UserTable ref="userTableRef" :dept-id="selectedDeptId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeptList from './deptList.vue'
import UserTable from './table.vue'

const selectedDeptId = ref<number | null>(null)
const userTableRef = ref<InstanceType<typeof UserTable>>()
const isDeptListFloating = ref(false)

// 处理部门选择变化
// 注意：不需要手动刷新表格，table.vue 中的 watch 会自动监听 deptId 变化并刷新
const handleDeptChange = (deptId: number | null) => {
  selectedDeptId.value = deptId
}

// 处理悬浮状态变化
const handleFloatChange = (isFloating: boolean) => {
  isDeptListFloating.value = isFloating
}
</script>

<style scoped lang="less">
.user-management-container {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .left-panel {
    width: 280px;
    min-width: 280px;
    height: 100%;
    flex-shrink: 0;
    transition: width 0.3s ease, margin-right 0.3s ease;

    &.is-hidden {
      width: 0;
      min-width: 0;
      margin-right: 0;
      overflow: hidden;
    }
  }

  .right-panel {
    flex: 1;
    height: 100%;
    overflow: hidden;
    margin-left: 12px;
    transition: margin-left 0.3s ease;

    &.is-full-width {
      margin-left: 0;
    }
  }
}
</style>

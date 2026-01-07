<template>
  <div ref="containerRef" class="dept-tree-container" :class="{ 'is-floating': isFloating }">
    <div ref="headerRef" class="dept-tree-header">
      <div class="dept-tree-header-title">
        部门列表
      </div>
      <el-button :icon="isFloating ? Close : Notification" text class="float-btn" @click.stop="toggleFloat" />
    </div>
    <div class="search-box">
      <el-input v-model="filterText" placeholder="搜索部门" clearable size="default">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div class="tree-box">
      <el-tree ref="treeRef" :data="deptTreeData" :props="treeProps" :filter-node-method="filterNode"
        :default-expand-all="true" :highlight-current="true" node-key="id" @node-click="handleNodeClick">
        <template #default="{ node, data }">
          <span class="tree-node">

            <span class="node-label">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Folder, OfficeBuilding, Notification, Close } from '@element-plus/icons-vue'
import { departmentApi, type Department } from '@/api/department'
import { ElTree } from 'element-plus'
import { useFloatable } from '@/hooks/useFloatable'

interface Props {
  modelValue?: number | null
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', deptId: number | null): void
  (e: 'float-change', isFloating: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<Emits>()

const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
const deptTreeData = ref<Department[]>([])
const containerRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 使用悬浮hook
const { isFloating, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  floatOffset: { x: 20, y: 10 },
  floatScale: 1.02,
  scaleDuration: 300,
  zIndex: 2000,
  dragBounds: {
    top: 0,
    left: 0
  },
  onFloatChange: (floating) => {
    // 通知父组件悬浮状态改变
    emit('float-change', floating)
  }
})

// 过滤节点
const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

// 监听搜索框变化
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 加载部门树数据
const loadDepartmentTree = async () => {
  try {
    const res = await departmentApi.getDepartmentTree()
    deptTreeData.value = (res as any) || []
  } catch (error: any) {
    console.error('加载部门树失败:', error)
  }
}

// 处理节点点击
const handleNodeClick = (data: Department) => {
  emit('update:modelValue', data.id)
  emit('change', data.id)
}

// 设置当前选中的节点
const setCurrentNode = (deptId: number | null) => {
  if (deptId && treeRef.value) {
    treeRef.value.setCurrentKey(deptId)
  } else if (treeRef.value) {
    treeRef.value.setCurrentKey(null)
  }
}

// 监听外部传入的选中值变化
watch(() => props.modelValue, (val) => {
  setCurrentNode(val || null)
}, { immediate: true })

// 组件挂载时加载数据
onMounted(() => {
  loadDepartmentTree()
})

// 暴露方法供父组件调用
defineExpose({
  refresh: loadDepartmentTree,
  setCurrentNode
})
</script>

<style scoped lang="less">
.dept-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border: solid 1px var(--el-border-color);
  border-radius: 8px;

  .dept-tree-header {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    transition: background-color 0.2s;


    .dept-tree-header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      flex: 1;
      cursor: default;
    }

    .float-btn {
      flex-shrink: 0;
      margin-left: 8px;
      cursor: pointer;
      font-size: 20px;
      padding: 2px 6px;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  &.is-floating {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s ease;

    .dept-tree-header {
      cursor: move;

      &:active {
        cursor: grabbing;
      }

      .dept-tree-header-title {
        cursor: move;
      }
    }
  }

  .search-box {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .tree-box {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    :deep(.el-tree) {
      background-color: transparent;

      .el-tree-node {
        .el-tree-node__content {
          height: 36px;
          padding: 0 8px;
          border-radius: 4px;
          margin-bottom: 2px;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--el-fill-color-light);
          }

          &.is-current {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);

            .tree-node {
              .node-label {
                font-weight: 500;
              }
            }
          }
        }

        .el-tree-node__expand-icon {
          color: var(--el-text-color-regular);
        }
      }
    }

    .tree-node {
      display: flex;
      align-items: center;
      width: 100%;
      font-size: 14px;

      .folder-icon,
      .file-icon {
        margin-right: 6px;
        font-size: 16px;
        color: var(--el-color-primary);
      }

      .file-icon {
        color: var(--el-text-color-regular);
      }

      .node-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>

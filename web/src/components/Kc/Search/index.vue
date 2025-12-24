<template>
  <div class="kc-search">
    <el-form :model="searchData" class="search-form">
      <div class="search-default" :style="{ maxHeight: containerMaxHeight, overflow: containerOverflow }">
        <transition-group name="fade" tag="div" class="search-fields">
          <FormFieldItem v-for="field in visibleFields" :key="field.key" :field="field"
            :field-width="config.fieldWidth" v-model="searchData" @change="handleFieldChange" />
          <!-- 展开按钮，紧跟搜索项末尾 -->
          <CommonButton v-if="hasMoreFields && !panelState" @click="toggleExpand" class="expand-btn"
            :class="{ 'is-expanded': isExpanded }" :icon="ArrowDown" :label="isExpanded ? '收起' : '展开'" />
          <CommonButton class="search-btn" v-if="config.showSearch !== false" type="primary"
            :prevent-double-click="true" :debounce="300" @click="handleSearch" label="搜索" />
          <CommonButton v-if="config.showReset !== false" @click="handleReset" label="重置" />
        </transition-group>

      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import FormFieldItem from '../components/FormFieldItem.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import type { SearchConfig } from '../types'

interface Props {
  config: SearchConfig
  modelValue?: Record<string, any>
}

const panelState = inject<Ref>('panelState')

const props = withDefaults(defineProps<Props>(), {
  config: () => ({ fields: [] }),
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: [data: Record<string, any>]
  reset: []
  change: [key: string, value: any]
}>()

const searchData = computed({
  get() {
    return props.modelValue || {}
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const isExpanded = ref(false)
const defaultCount = computed(() => props.config.defaultCount || 2)
const hasMoreFields = computed(() => props.config.fields.length > defaultCount.value)
const visibleFields = computed(() =>
  isExpanded.value ? props.config.fields : props.config.fields.slice(0, defaultCount.value)
)

// max-height 和 overflow 控制动画
const containerMaxHeight = ref('0px')
const containerOverflow = ref('hidden')

watchEffect(() => {
  if (panelState && panelState.value) {
    isExpanded.value = false
    updateContainerHeight()
  }
})



const updateContainerHeight = () => {
  nextTick(() => {
    const container = document.querySelector('.search-default') as HTMLElement
    if (!container) return
    if (isExpanded.value) {
      containerMaxHeight.value = container.scrollHeight + 'px'
      containerOverflow.value = 'visible'
    } else {
      // 估算一行高度，包含两项+展开按钮+搜索重置按钮的高度（约56px），你可根据实际调节
      const singleLineHeight = 56
      containerMaxHeight.value = singleLineHeight + 'px'
      containerOverflow.value = 'hidden'
    }
  })
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  updateContainerHeight()
}

onMounted(() => {
  updateContainerHeight()
})

watch(
  () => [isExpanded.value, props.config.fields.length],
  () => {
    updateContainerHeight()
  }
)

const handleFieldChange = (key: string, value: any) => {
  emit('change', key, value)
}
const handleSearch = () => {
  emit('search', searchData.value)
}
const handleReset = () => {
  emit('update:modelValue', {})
  emit('reset')
}
</script>

<style lang="less" scoped>
.kc-search {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  margin-bottom: 16px;

  .search-form {
    .search-default {
      max-height: 56px;
      /* 初始高度 */
      overflow: hidden;
      transition: max-height 0.3s ease;

      .search-fields {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 16px;

        .el-button+.el-button {
          margin-left: unset;
        }

        .search-btn {
          margin-left: auto !important;
        }
      }

      /* 展开按钮紧跟搜索项 */
      .expand-btn {
        flex: none;
        align-self: flex-end;
        white-space: nowrap;
        margin-bottom: 0;

        .expand-icon {
          margin-right: 4px;
          transition: transform 0.3s;

          &.is-expanded {
            transform: rotate(180deg);
          }
        }
        
        // 展开按钮图标旋转动画
        .expand-btn {
          :deep(.el-icon) {
            transition: transform 0.3s;
          }
          
          &.is-expanded :deep(.el-icon) {
            transform: rotate(180deg);
          }
        }
      }



      /* 搜索和重置按钮，跟展开按钮同行，靠右对齐 */
      .search-actions {
        display: flex;
        gap: 8px;
        flex: 1 1 auto;
        /* 占满剩余空间 */
        justify-content: flex-end;
        align-items: flex-end;
        min-width: 200px;
        /* 保证按钮不换行，视情况调整 */
      }
    }
  }

  /* 多余搜索项淡入淡出动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }
}
</style>

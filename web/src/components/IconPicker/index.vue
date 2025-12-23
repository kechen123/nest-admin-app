<template>
  <div class="icon-picker">
    <el-popover
      v-model:visible="showPopover"
      placement="bottom-start"
      :width="520"
      trigger="click"
      popper-class="icon-picker-popover"
    >
      <template #reference>
        <el-input
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          readonly
          @clear="handleClear"
          clearable
        >
          <template #prefix>
            <el-icon v-if="inputValue" class="icon-preview">
              <component :is="getIconComponent(inputValue)" />
            </el-icon>
          </template>
          <template #suffix>
            <el-icon class="icon-selector" :class="{ 'is-open': showPopover }">
              <ArrowDown />
            </el-icon>
          </template>
        </el-input>
      </template>

      <div class="icon-picker-content">
        <el-input
          v-model="searchText"
          placeholder="搜索图标..."
          clearable
          class="search-input"
          size="small"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="icon-list">
          <div
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-item"
            :class="{ active: inputValue === icon }"
            @click="selectIcon(icon)"
          >
            <el-icon :size="20">
              <component :is="getIconComponent(icon)" />
            </el-icon>
            <span class="icon-name">{{ icon }}</span>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'

// 图标组件映射
const iconComponents = ElementPlusIconsVue as Record<string, any>

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || null
}

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请选择图标',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const showPopover = ref(false)
const searchText = ref('')

// 获取所有图标名称
const allIcons = Object.keys(ElementPlusIconsVue).sort()

// 过滤图标
const filteredIcons = computed(() => {
  if (!searchText.value) {
    return allIcons
  }
  return allIcons.filter(icon =>
    icon.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 输入框显示值
const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

// 选择图标
const selectIcon = (icon: string) => {
  inputValue.value = icon
  showPopover.value = false
  searchText.value = '' // 选择后清空搜索
}

// 清除
const handleClear = () => {
  inputValue.value = ''
  searchText.value = ''
}
</script>

<style scoped lang="less">
.icon-picker {
  width: 100%;

  .icon-preview {
    color: var(--el-color-primary);
  }

  .icon-selector {
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    transition: transform 0.3s;

    &.is-open {
      transform: rotate(180deg);
    }
  }
}

.icon-picker-content {
  .search-input {
    margin-bottom: 12px;
  }

  .icon-list {
    max-height: 300px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    padding: 4px;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 6px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: var(--el-bg-color);

      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.active {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      .icon-name {
        margin-top: 6px;
        font-size: 11px;
        color: var(--el-text-color-regular);
        text-align: center;
        word-break: break-all;
        line-height: 1.2;
      }

      &.active .icon-name {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

// 滚动条样式
.icon-list::-webkit-scrollbar {
  width: 6px;
}

.icon-list::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
  border-radius: 3px;
}

.icon-list::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;

  &:hover {
    background: var(--el-text-color-placeholder);
  }
}
</style>

<style lang="less">
// 全局样式，用于 popover
.icon-picker-popover {
  padding: 12px;
}
</style>


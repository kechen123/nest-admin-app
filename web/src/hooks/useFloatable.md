# useFloatable Hook 使用文档

一个可复用的悬浮功能组合式函数，提供元素的悬浮、拖动功能。

## 功能特性

- ✅ 元素悬浮（fixed 定位）
- ✅ 拖动移动位置
- ✅ 悬浮时的视觉反馈（位置偏移、缩放效果）
- ✅ 边界限制
- ✅ 事件回调
- ✅ TypeScript 类型支持

## 基本用法

```vue
<template>
  <div ref="containerRef" class="floating-container" :class="{ 'is-floating': isFloating }">
    <div ref="headerRef" class="header">
      <span>标题</span>
      <button @click="toggleFloat">
        {{ isFloating ? '关闭' : '悬浮' }}
      </button>
    </div>
    <div class="content">
      <!-- 内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFloatable } from '@/hooks/useFloatable'

const containerRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)

const { isFloating, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  onFloatChange: (floating) => {
    console.log('悬浮状态:', floating)
  }
})
</script>
```

## API 参数

### UseFloatableOptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetRef` | `Ref<HTMLElement \| null>` | - | **必需** 目标元素的引用 |
| `handleRef` | `Ref<HTMLElement \| null>` | `undefined` | 拖动句柄元素的引用（通常是header），不指定则整个元素可拖动 |
| `floatOffset` | `{ x: number, y: number }` | `{ x: 20, y: 10 }` | 悬浮时的位置偏移（用于视觉反馈） |
| `floatScale` | `number` | `1.02` | 悬浮时的缩放效果（1表示不缩放） |
| `scaleDuration` | `number` | `300` | 缩放动画持续时间（毫秒） |
| `zIndex` | `number` | `2000` | 悬浮时的z-index |
| `dragBounds` | `Bounds` | `undefined` | 拖动边界限制 |
| `onFloatChange` | `(isFloating: boolean) => void` | `undefined` | 悬浮状态改变时的回调 |
| `onDragStart` | `(event: MouseEvent) => void` | `undefined` | 拖动开始时的回调 |
| `onDragMove` | `(event: MouseEvent, position: { x: number, y: number }) => void` | `undefined` | 拖动过程中的回调 |
| `onDragEnd` | `(event: MouseEvent) => void` | `undefined` | 拖动结束时的回调 |

### UseFloatableReturn

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `isFloating` | `Ref<boolean>` | 是否处于悬浮状态 |
| `isDragging` | `Ref<boolean>` | 是否正在拖动 |
| `position` | `Ref<{ x: number, y: number }>` | 当前位置 |
| `toggleFloat` | `() => void` | 切换悬浮状态 |
| `setFloating` | `(floating: boolean) => void` | 设置悬浮状态 |
| `setPosition` | `(x: number, y: number) => void` | 设置位置 |
| `resetPosition` | `() => void` | 重置位置到初始状态 |

## 高级用法

### 自定义悬浮效果

```typescript
const { isFloating, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  floatOffset: { x: 30, y: 15 }, // 自定义偏移量
  floatScale: 1.05, // 更大的缩放效果
  scaleDuration: 500, // 更长的动画时间
  zIndex: 3000, // 更高的层级
})
```

### 设置拖动边界

```typescript
const { isFloating, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  dragBounds: {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight
  }
})
```

### 监听拖动事件

```typescript
const { isFloating, isDragging, position, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  onDragStart: (e) => {
    console.log('开始拖动', e)
  },
  onDragMove: (e, pos) => {
    console.log('拖动中', pos)
  },
  onDragEnd: (e) => {
    console.log('拖动结束', e)
  }
})
```

### 程序化控制

```typescript
const { isFloating, setFloating, setPosition, resetPosition } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef
})

// 设置为悬浮状态
setFloating(true)

// 设置位置
setPosition(100, 200)

// 重置位置
resetPosition()
```

## 完整示例

```vue
<template>
  <div class="page-container">
    <div v-show="!isFloating" class="left-panel">
      <div ref="containerRef" class="floating-box">
        <div ref="headerRef" class="header">
          <span>可悬浮面板</span>
          <el-button @click.stop="toggleFloat" size="small">
            {{ isFloating ? '关闭' : '悬浮' }}
          </el-button>
        </div>
        <div class="content">
          <p>这是可悬浮的内容</p>
          <p>点击右上角按钮可以悬浮</p>
          <p>拖动标题栏可以移动位置</p>
        </div>
      </div>
    </div>
    <div class="right-panel" :class="{ 'is-full-width': isFloating }">
      <p>主要内容区域</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFloatable } from '@/hooks/useFloatable'

const containerRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const isFloating = ref(false)

const { isFloating: floating, toggleFloat } = useFloatable({
  targetRef: containerRef,
  handleRef: headerRef,
  floatOffset: { x: 20, y: 10 },
  floatScale: 1.02,
  onFloatChange: (floating) => {
    isFloating.value = floating
  }
})
</script>

<style scoped lang="less">
.page-container {
  display: flex;
  height: 100vh;

  .left-panel {
    width: 300px;
    padding: 20px;
  }

  .right-panel {
    flex: 1;
    padding: 20px;
    margin-left: 12px;
    transition: margin-left 0.3s ease;

    &.is-full-width {
      margin-left: 0;
    }
  }

  .floating-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;

    .header {
      padding: 12px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }

    .content {
      padding: 16px;
    }
  }
}
</style>
```

## 注意事项

1. **元素引用**：确保 `targetRef` 和 `handleRef` 在组件挂载后才能使用
2. **按钮点击**：如果按钮在 `handleRef` 内，使用 `@click.stop` 阻止拖动触发
3. **边界限制**：设置 `dragBounds` 时，确保边界值合理，避免元素移出视口
4. **性能考虑**：拖动时会频繁更新位置，避免在 `onDragMove` 中执行重操作

## 依赖

- `useDraggable` hook（内部使用）


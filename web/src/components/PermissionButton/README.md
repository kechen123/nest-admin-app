# PermissionButton 组件使用说明

## 功能说明

`PermissionButton` 是一个基于权限控制的按钮组件，只有当用户拥有指定权限时才会显示按钮。

## 使用方法

### 1. 基础用法

```vue
<template>
  <PermissionButton 
    type="primary" 
    permission="system:user:add"
    @click="handleAdd"
  >
    新增用户
  </PermissionButton>
</template>

<script setup lang="ts">
import PermissionButton from '@/components/PermissionButton/index.vue'
</script>
```

### 2. 检查多个权限（任意一个）

```vue
<template>
  <PermissionButton 
    type="success" 
    :any-permission="['system:user:edit', 'system:user:add']"
    @click="handleSave"
  >
    保存
  </PermissionButton>
</template>
```

### 3. 使用 v-if 指令（推荐）

如果不想使用组件，也可以直接使用 `hasPermission` 函数：

```vue
<template>
  <el-button 
    v-if="hasPermission('system:user:edit')"
    type="primary"
    @click="handleEdit"
  >
    编辑
  </el-button>
</template>

<script setup lang="ts">
import { hasPermission } from '@/utils/permission'
</script>
```

### 4. 检查多个权限

```vue
<template>
  <!-- 检查任意一个权限 -->
  <el-button 
    v-if="hasAnyPermission(['system:user:edit', 'system:user:add'])"
    type="primary"
    @click="handleAction"
  >
    操作
  </el-button>

  <!-- 检查所有权限 -->
  <el-button 
    v-if="hasAllPermissions(['system:user:edit', 'system:user:delete'])"
    type="danger"
    @click="handleDelete"
  >
    删除
  </el-button>
</template>

<script setup lang="ts">
import { hasAnyPermission, hasAllPermissions } from '@/utils/permission'
</script>
```

## 权限代码规范

建议使用统一的命名规范：`模块:资源:操作`

- `system:user:add` - 用户新增
- `system:user:edit` - 用户编辑
- `system:user:remove` - 用户删除
- `system:user:query` - 用户查询
- `system:user:export` - 用户导出
- `system:role:add` - 角色新增
- `system:menu:add` - 菜单新增

## 权限检查逻辑

`hasPermission` 函数会按以下顺序检查权限：

1. 如果用户是管理员（`isAdmin === 1`），直接返回 `true`
2. 从菜单树中查找权限代码（包括按钮类型的菜单）
3. 从用户登录时返回的 `permissions` 数组中查找

## 注意事项

1. 权限代码需要在菜单管理中配置（菜单类型选择 `F-按钮`）
2. 或者在角色管理中通过权限分配功能分配权限
3. 确保后端登录接口返回用户的 `permissions` 数组


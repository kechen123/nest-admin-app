<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <!-- 自定义头像上传slot示例 -->
        <template #avatar="{ field, model }">
          <el-upload v-model:file-list="model[field.key]" list-type="picture-card">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </template>
      </KcForm>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="onSubmit(formData)" v-if="type === 'edit'">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { getMenu, addMenu, updateMenu } from '@/api/sys_menu'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})
const close = inject<(val?: any) => void>('slideClose')

const formData = ref({})
const type = ref('edit')

const formRef = ref()

const formConfig = reactive({
  fields: [
    { key: 'menu_type', label: '菜单类型', type: 'select' as const, options: [ { value: 'M', label: '目录' }, { value: 'C', label: '菜单' } ], placeholder: '请选择菜单类型', width: 240, rules: [{ required: true, message: '必填' }], disabled: computed(() => type.value === 'view') },
    { key: 'menu_name', label: '菜单名称', type: 'input' as const, placeholder: '请输入菜单名称', width: 240, rules: [{ required: true, message: '必填' }], disabled: computed(() => type.value === 'view') },
    { key: 'icon', label: '图标', type: 'input' as const, placeholder: '请输入图标', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'route_name', label: '路由名称', type: 'input' as const, placeholder: '请输入路由名称', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'path', label: '路由路径', type: 'input' as const, placeholder: '请输入路由路径', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'status', label: '状态', type: 'select' as const, options: [ { value: '0', label: '禁用' }, { value: '1', label: '启用' } ], placeholder: '请选择状态', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'visible', label: '是否隐藏', type: 'select' as const, options: [ { value: '0', label: '显示' }, { value: '1', label: '隐藏' } ], placeholder: '请选择', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'parent_id', label: '父级菜单ID', type: 'input' as const, placeholder: '请输入父级菜单ID', width: 240, disabled: computed(() => type.value === 'view') },
    { key: 'order_num', label: '排序', type: 'input' as const, placeholder: '请输入排序', width: 240, disabled: computed(() => type.value === 'view') },
  ],
  rules: {
    menu_type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }],
    menu_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  },
  labelWidth: '80px',
  fieldWidth: 250,
})

const onSubmit = async (data: any) => {
  console.log('提交表单', data)
  try {
    if (data.id) {
      await updateMenu(data.id, data)
    } else {
      await addMenu(data)
    }
    ElMessage.success('提交表单成功')
    await close?.(true)
  } catch (error) {
    console.error('提交表单失败', error)
  }
}
const onReset = () => {
  formData.value = { username: '', avatar: [], email: '', gender: '', status: 1, position_id: '', phone: '', age: '', department_id: '', remark: '', role: '', is_verified: 0, login_count: '' }
}


const init = async (data: any) => {
  const { rowId, type: _type } = data
  type.value = _type
  if (rowId) {
    const res = await getMenu(rowId)
    const menuData = res.data
    Object.assign(formData.value, menuData[0])
  }
}

defineExpose({ init })
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content {
  flex: 1;
  overflow: auto;
}

.footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: flex-start;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

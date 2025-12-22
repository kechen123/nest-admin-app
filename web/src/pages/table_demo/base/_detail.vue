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
        <el-button @click="onReset">重置</el-button>
        <el-button type="primary" @click="onSubmit(formData)">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { getUser } from '@/api/test'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const formData = ref({

})

const formRef = ref()

const departmentList = ref<any[]>([])
const positionList = ref<any[]>([])

const formConfig = reactive({
  fields: [
    { key: 'username', label: '用户名', type: 'input' as const, placeholder: '请输入用户名', width: 300, rules: [{ required: true, message: '必填' }] },
    { key: 'avatar_url', label: '头像', type: 'input' as const, },
    { key: 'email', label: '邮箱', type: 'input' as const, placeholder: '请输入邮箱' },
    { key: 'gender', label: '性别', type: 'select' as const, options: [{ value: 0, label: '未知' }, { value: 1, label: '男' }, { value: 2, label: '女' }], placeholder: '请选择性别' },
    { key: 'status', label: '激活', type: 'select' as const, options: [{ value: 1, label: '已激活' }, { value: 0, label: '未激活' }], placeholder: '请选择激活状态' },
    { key: 'position_id', label: '职位', type: 'select' as const, options: computed(() => positionList.value), placeholder: '请选择职位' },
    { key: 'phone', label: '手机号', type: 'input' as const, placeholder: '请输入手机号' },
    { key: 'age', label: '年龄', type: 'input' as const, placeholder: '请输入年龄' },
    { key: 'department_id', label: '部门', type: 'select' as const, options: computed(() => departmentList.value), placeholder: '请选择部门' },
    { key: 'remark', label: '备注', type: 'input' as const, placeholder: '请输入备注' },
    { key: 'role', label: '角色', type: 'input' as const, placeholder: '请输入角色' },
    { key: 'is_verified', label: '是否已验证邮箱', type: 'select' as const, options: [{ value: 0, label: '否' }, { value: 1, label: '是' }], placeholder: '请选择', labelWidth: '120px', width: 500, },
  ],
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
  },
  labelWidth: '80px',
  fieldWidth: 250,
})

const onSubmit = (data: any) => {
  console.log('提交表单', data)
}
const onReset = () => {
  formData.value = { username: '', avatar: [], email: '', gender: '', status: 1, position_id: '', phone: '', age: '', department_id: '', remark: '', role: '', is_verified: 0, login_count: '' }
}


const init = async (data: any) => {
  // 从 init 函数参数中获取所有数据
  const { rowId, departmentList: deptList, positionList: posList } = data

  departmentList.value = deptList || []
  positionList.value = posList || []

  if (rowId) {
    const res = await getUser(rowId)
    const userData = res.data
    Object.assign(formData.value, userData[0])
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

<template>
  <div>
    <KcForm :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
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
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

const formData = ref({
  username: '',
  avatar: [],
  email: '',
  gender: '',
  status: 1,
  position_id: '',
  phone: '',
  age: '',
  department_id: '',
  remark: '',
  role: '',
  is_verified: 0,
  login_count: '',
})

const departmentList = ref<any[]>([])
const positionList = ref<any[]>([])

const formConfig = {
  fields: [
    { key: 'username', label: '用户名', type: 'input' as const, placeholder: '请输入用户名', width: 300, rules: [{ required: true, message: '必填' }], compare: true },
    { key: 'avatar', label: '头像', type: 'input' as const, compare: true },
    { key: 'email', label: '邮箱', type: 'input' as const, placeholder: '请输入邮箱', compare: true },
    { key: 'gender', label: '性别', type: 'select' as const, options: [{ value: 0, label: '未知' }, { value: 1, label: '男' }, { value: 2, label: '女' }], placeholder: '请选择性别', compare: true },
    { key: 'status', label: '激活', type: 'select' as const, options: [{ value: 1, label: '已激活' }, { value: 0, label: '未激活' }], placeholder: '请选择激活状态', compare: true },
    { key: 'position_id', label: '职位', type: 'select' as const, options: computed(() => positionList.value), placeholder: '请选择职位', compare: true },
    { key: 'phone', label: '手机号', type: 'input' as const, placeholder: '请输入手机号', compare: true },
    { key: 'age', label: '年龄', type: 'input' as const, placeholder: '请输入年龄', compare: true },
    { key: 'department_id', label: '部门', type: 'select' as const, options: computed(() => departmentList.value), placeholder: '请选择部门', compare: true },
    { key: 'remark', label: '备注', type: 'input' as const, placeholder: '请输入备注', compare: true },
    { key: 'role', label: '角色', type: 'input' as const, placeholder: '请输入角色', compare: true },
    { key: 'is_verified', label: '是否已验证邮箱', type: 'select' as const, options: [{ value: 0, label: '否' }, { value: 1, label: '是' }], placeholder: '请选择', labelWidth: '120px', width: 500, compare: true },
  ],
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
  },
  labelWidth: '80px',
  fieldWidth: 250,
}

function onSubmit(data: any) {
  console.log('提交表单', data)
}
function onReset() {
  formData.value = { username: '', avatar: [], email: '', gender: '', status: 1, position_id: '', phone: '', age: '', department_id: '', remark: '', role: '', is_verified: 0, login_count: '' }
}


function init({ _userId, _departmentList, _positionList }: any) {
  console.log('初始化数据，userId:', _userId)
  console.log('初始化数据，departmentList:', _departmentList)
  console.log('初始化数据，positionList:', _positionList)
  departmentList.value = _departmentList
  positionList.value = _positionList
}

defineExpose({
  init,
  // 暴露给 SlideContainer 用于自动检测未保存修改
  formData,
  formConfig
})
</script>

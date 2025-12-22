<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <!-- 自定义头像上传slot -->
        <template #avatar>
          <ImageUpload v-model="formData.avatar" :limit="1" :disabled="type === 'view'" />
        </template>
      </KcForm>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="onSubmit(formData)" v-if="type !== 'view'">
          {{ formData.id ? '保存' : '创建' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi, type User, type CreateUserDto, type UpdateUserDto } from '@/api/user'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<User & CreateUserDto>>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  avatar: '',
  role: 'user',
  status: true,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

const formConfig = reactive({
  fields: [
    {
      key: 'username',
      label: '用户名',
      type: 'input' as const,
      placeholder: '请输入用户名',
      width: 240,
      rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      disabled: computed(() => type.value === 'view' || !!formData.value.id),
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input' as const,
      placeholder: '请输入邮箱',
      width: 240,
      rules: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'password',
      label: '密码',
      type: 'input' as const,
      placeholder: computed(() => formData.value.id ? '留空则不修改密码' : '请输入密码'),
      width: 240,
      inputType: 'password',
      disabled: computed(() => type.value === 'view'),
      show: computed(() => type.value !== 'view'), // 编辑和创建模式都显示密码字段
    },
    {
      key: 'nickname',
      label: '昵称',
      type: 'input' as const,
      placeholder: '请输入昵称',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'avatar',
      label: '头像',
      type: 'custom' as const,
      slot: 'avatar',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'role',
      label: '角色',
      type: 'select' as const,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' }
      ],
      placeholder: '请选择角色',
      width: 240,
      rules: [{ required: true, message: '请选择角色', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '启用', value: true },
        { label: '禁用', value: false }
      ],
      placeholder: '请选择状态',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
  ],
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: formData.value.id
      ? [] // 编辑模式下密码可选
      : [{ required: true, message: '请输入密码', trigger: 'blur' }], // 创建模式下密码必填
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  },
  labelWidth: '100px',
  fieldWidth: 250,
})


const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    if (data.id) {
      // 更新用户
      const updateData: UpdateUserDto = {
        email: data.email,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role,
        status: data.status,
      }
      // 如果密码不为空且不是空字符串，则包含密码字段
      if (data.password && typeof data.password === 'string' && data.password.trim().length > 0) {
        updateData.password = data.password.trim()
      }
      await userApi.updateUser(data.id, updateData)
      ElMessage.success('更新成功')
    } else {
      // 创建用户
      const createData: CreateUserDto = {
        username: data.username,
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        role: data.role,
      }
      await userApi.createUser(createData)
      ElMessage.success('创建成功')
    }

    await close?.(true)
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const onReset = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    nickname: '',
    avatar: '',
    role: 'user',
    status: true,
  }
}

const init = async (data: any) => {
  const { rowId, type: _type } = data
  type.value = _type || 'edit'

  if (rowId) {
    // 获取用户详情（axios 拦截器已经返回了 data）
    const user = (await userApi.getUserById(rowId)) as unknown as User
    formData.value = {
      ...user,
      password: '', // 不显示密码
    }

  } else {
    // 新增模式
    type.value = 'create'
    formData.value = {
      username: '',
      email: '',
      password: '',
      nickname: '',
      avatar: '',
      role: 'user',
      status: true,
    }
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

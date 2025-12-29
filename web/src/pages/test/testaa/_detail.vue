<template>
  <div class="detail-container">
    <div class="content">
      <KcForm ref="formRef" :config="formConfig" v-model="formData" @submit="onSubmit" @reset="onReset">
        <!-- 自定义头像上传slot -->
        <template #avatar>
          <ImageUpload v-model="formData.avatar" :limit="1" :disabled="type === 'view'" />
        </template>

        <!-- 自定义备注文本域slot -->
        <template #remark>
          <el-input v-model="formData.remark" type="textarea" :placeholder="'请输入备注信息...'" :rows="4"
            :disabled="type === 'view'" :maxlength="500" show-word-limit resize="none" />
        </template>
      </KcForm>
    </div>

    <!-- 固定的 Footer -->
    <div class="footer">
      <div class="footer-actions">
        <el-button @click="close">关闭</el-button>
        <CommonButton v-if="type !== 'view'" type="primary" :label="formData.id ? '保存' : '创建'"
          :prevent-double-click="true" @click="() => onSubmit(formData)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi, type User, type CreateUserDto, type UpdateUserDto } from '@/api/user'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'
import CommonButton from '@/components/CommonButton/index.vue'
import KcForm from '@/components/Kc/Form/index.vue'
import { getDictOptions } from '@/utils/dict'
import type { DictOption } from '@/api/dict'

// 防止 props 暴露到 DOM 元素上
defineOptions({
  inheritAttrs: false
})

const close = inject<(val?: any) => void>('slideClose')

const formData = ref<Partial<User & CreateUserDto & { loginDate?: string; isAdminText?: string }>>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  avatar: '',
  phone: '',
  gender: 0,
  remark: '',
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 字典选项
const genderOptions = ref<DictOption[]>([])
const statusOptions = ref<DictOption[]>([])


// 加载字典数据
const loadDicts = async () => {
  try {
    genderOptions.value = await getDictOptions('sys_user_sex')
    statusOptions.value = await getDictOptions('sys_normal_disable')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 组件挂载时加载字典数据
onMounted(() => {
  loadDicts()
})

const formConfig = computed(() => ({
  fields: ([
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
      show: computed(() => type.value !== 'view'),
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
      key: 'phone',
      label: '手机号',
      type: 'input' as const,
      placeholder: '请输入手机号',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'gender',
      label: '性别',
      type: 'select' as const,
      options: genderOptions.value.map((opt: DictOption) => ({
        label: opt.label,
        value: Number(opt.value)
      })),
      placeholder: '请选择性别',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: statusOptions.value.map((opt: DictOption) => ({
        label: opt.label,
        value: Number(opt.value)
      })),
      placeholder: '请选择状态',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
    {
      key: 'remark',
      label: '备注',
      type: 'custom' as const,
      slot: 'remark',
      width: 240,
      disabled: computed(() => type.value === 'view'),
    },
  ] as any[]).filter(field => field.show !== false),
  labelWidth: '80px',
  showSubmitButton: false,
  showResetButton: false,
}))

// 提交表单
const onSubmit = async (data: any) => {
  try {
    await formRef.value?.validate()

    if (data.id) {
      // 更新用户
      const updateData: UpdateUserDto = {
        email: data.email,
        nickname: data.nickname,
        avatar: data.avatar,
        phone: data.phone,
        gender: data.gender,
        status: data.status,
        remark: data.remark,
      }

      // 只有在提供了密码时才包含密码
      if (data.password && data.password.trim()) {
        (updateData as any).password = data.password
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
        avatar: data.avatar,
        phone: data.phone,
        gender: data.gender,
        status: data.status,
        remark: data.remark,
      }

      await userApi.createUser(createData)
      ElMessage.success('创建成功')
    }

    close(true) // 关闭面板并刷新列表
  } catch (error: any) {
    if (error !== 'validation_failed') {
      ElMessage.error(data.id ? '更新失败' : '创建失败')
    }
  }
}

// 重置表单
const onReset = () => {
  formRef.value?.resetFields()
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
      roles: user.roles?.map((item: any) => {
        // 如果 item 是对象，取 code；如果是字符串，直接返回
        return typeof item === 'object' && item.code ? item.code : item
      }) || [],
      // 格式化只读字段
      loginDate: user.loginDate ? new Date(user.loginDate).toLocaleString('zh-CN') : '-',
      isAdminText: user.isAdmin === 1 ? '是' : user.isAdmin === 0 ? '否' : '-',
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
      phone: '',
      gender: 0,
      deptId: undefined,
      postId: undefined,
      remark: '',
      role: 'user',
      status: 1,
    }
  }
}


defineExpose({ init })
</script>

<style scoped>
.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  border-top: 1px solid #e4e7ed;
  padding: 10px 20px;
  background: #fff;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

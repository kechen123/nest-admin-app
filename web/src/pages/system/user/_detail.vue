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
        <CommonButton v-if="type !== 'view'" type="primary" :label="formData.id ? '保存' : '创建'"
          :prevent-double-click="true" @click="() => onSubmit(formData)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userApi, type User, type CreateUserDto, type UpdateUserDto } from '@/api/user'
import { departmentApi, type Department } from '@/api/department'
import { postApi, type Post } from '@/api/post'
import { roleApi, type Role } from '@/api/role'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload/index.vue'
import CommonButton from '@/components/CommonButton/index.vue'
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
  deptId: undefined,
  postId: undefined,
  remark: '',
  role: 'user',
  status: 1,
})

const type = ref<'edit' | 'view' | 'create'>('edit')
const formRef = ref()

// 字典选项
const genderOptions = ref<DictOption[]>([])
const statusOptions = ref<DictOption[]>([])

// 部门、岗位和角色选项
const deptOptions = ref<Array<{ label: string; value: number }>>([])
const postOptions = ref<Array<{ label: string; value: number }>>([])
const roleOptions = ref<Array<{ label: string; value: string }>>([])
// 完整的角色列表（包含ID），用于代码到ID的转换
const roleList = ref<Role[]>([])

// 加载字典数据
const loadDicts = async () => {
  try {
    genderOptions.value = await getDictOptions('sys_user_sex')
    statusOptions.value = await getDictOptions('sys_normal_disable')
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载部门、岗位和角色数据
const loadDeptAndPost = async () => {
  try {
    // 加载部门列表
    const deptRes = await departmentApi.getAllDepartments()
    console.log('deptRes', deptRes)
    if (deptRes && Array.isArray(deptRes)) {
      deptOptions.value = deptRes.map((item: Department) => ({
        label: item.name,
        value: item.id,
      }))
    }

    // 加载岗位列表
    const postRes = await postApi.getAllPosts()
    if (postRes && Array.isArray(postRes)) {
      postOptions.value = postRes.map((item: Post) => ({
        label: item.name,
        value: item.id,
      }))
    }

    // 加载角色列表
    const roleRes = await roleApi.getAllRoles()
    if (roleRes && Array.isArray(roleRes)) {
      roleList.value = roleRes
      roleOptions.value = roleRes.map((item: Role) => ({
        label: item.name,
        value: item.code,
      }))
    }
  } catch (error) {
    console.error('加载部门、岗位和角色数据失败:', error)
  }
}

// 组件挂载时加载字典和部门岗位数据
onMounted(() => {
  loadDicts()
  loadDeptAndPost()
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
      compare: true, // 新增用户时需要比较，编辑时由于 disabled 不比较
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
      compare: true,
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
      compare: false, // 密码字段不参与比较
    },
    {
      key: 'nickname',
      label: '昵称',
      type: 'input' as const,
      placeholder: '请输入昵称',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'avatar',
      label: '头像',
      type: 'custom' as const,
      slot: 'avatar',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'roles',
      label: '角色',
      type: 'select' as const,
      options: computed(() => roleOptions.value),
      placeholder: '请选择角色',
      multiple: true,
      width: 240,
      rules: [{ required: true, message: '请选择角色', trigger: 'change' }],
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'phone',
      label: '手机号',
      type: 'input' as const,
      placeholder: '请输入手机号',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
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
      compare: true,
    },
    {
      key: 'deptId',
      label: '部门',
      type: 'select' as const,
      options: computed(() => deptOptions.value),
      placeholder: '请选择部门',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'postId',
      label: '岗位',
      type: 'select' as const,
      options: computed(() => postOptions.value),
      placeholder: '请选择岗位',
      width: 240,
      disabled: computed(() => type.value === 'view'),
      compare: true,
    },
    {
      key: 'remark',
      label: '备注',
      type: 'textarea' as const,
      placeholder: '请输入备注',
      width: '100%',
      rows: 4,
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
    // 只读字段（仅在查看模式下显示）
    {
      key: 'loginIp',
      label: '登录IP',
      type: 'input' as const,
      placeholder: '-',
      width: 240,
      disabled: true,
      show: computed(() => type.value === 'view' && !!formData.value.loginIp),
    },
    {
      key: 'loginDate',
      label: '登录时间',
      type: 'input' as const,
      placeholder: '-',
      width: 240,
      disabled: true,
      show: computed(() => type.value === 'view' && !!formData.value.loginDate),
    },
    {
      key: 'isAdminText',
      label: '是否管理员',
      type: 'input' as const,
      placeholder: '-',
      width: 240,
      disabled: true,
      show: computed(() => type.value === 'view' && formData.value.isAdmin !== undefined),
    },
  ] as any[]).filter((field: any) => {
    // 过滤掉不显示的字段
    if (field.show !== undefined) {
      const showValue = typeof field.show === 'function' ? field.show() : (field.show?.value ?? field.show)
      return showValue
    }
    return true
  }),
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
}))


const onSubmit = async (data: any) => {
  try {
    if (type.value === 'view') {
      close?.()
      return
    }

    // 将角色代码数组转换为角色ID数组
    let roleIds: number[] | undefined = undefined
    if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
      roleIds = data.roles
        .map((code: string) => {
          const role = roleList.value.find((r) => r.code === code)
          return role?.id
        })
        .filter((id: any) => id !== undefined && id !== null) as number[]
    }

    if (data.id) {
      // 更新用户
      const updateData: UpdateUserDto = {
        email: data.email,
        nickname: data.nickname,
        avatar: data.avatar,
        phone: data.phone,
        gender: data.gender,
        deptId: data.deptId,
        postId: data.postId,
        remark: data.remark,
        status: data.status,
      }

      // 添加角色ID数组
      if (roleIds && roleIds.length > 0) {
        updateData.roleIds = roleIds
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
        avatar: data.avatar,
        phone: data.phone,
        gender: data.gender,
        deptId: data.deptId,
        postId: data.postId,
        remark: data.remark,
        status: data.status,
      }

      // 添加角色ID数组
      if (roleIds && roleIds.length > 0) {
        createData.roleIds = roleIds
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
    phone: '',
    gender: 0,
    deptId: undefined,
    postId: undefined,
    remark: '',
    role: 'user',
    status: 1,
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

defineExpose({
  init,
  // 暴露给 SlideContainer 用于自动检测未保存修改
  formData,
  formConfig
})
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

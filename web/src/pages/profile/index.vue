<template>
  <div class="profile-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">个人中心</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- 基本信息 -->
        <div class="profile-section">
          <h3 class="section-title">基本信息</h3>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="profileForm.username" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="profileForm.gender">
                    <el-radio :label="0">未知</el-radio>
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="头像">
                  <div class="avatar-upload">
                    <el-avatar :size="80" :src="profileForm.avatar || defaultAvatar">
                      <el-icon :size="40"><User /></el-icon>
                    </el-avatar>
                    <el-upload
                      :action="uploadAction"
                      :headers="uploadHeaders"
                      :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload"
                      :show-file-list="false"
                      accept="image/*"
                    >
                      <el-button type="primary" size="small">更换头像</el-button>
                    </el-upload>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile" :loading="updating">
                保存修改
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 修改密码 -->
        <el-divider />
        <div class="profile-section">
          <h3 class="section-title">修改密码</h3>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入旧密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
                修改密码
              </el-button>
              <el-button @click="handleResetPassword">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 其他信息 -->
        <el-divider />
        <div class="profile-section">
          <h3 class="section-title">其他信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ profileForm.id }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="role in profileForm.roles" :key="role" style="margin-right: 8px">
                {{ role }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后登录IP">{{ profileForm.loginIp || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">
              {{ profileForm.loginDate ? formatDate(profileForm.loginDate) : '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(profileForm.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(profileForm.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi, type UserProfile, type UpdateProfileDto, type ChangePasswordDto } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { tokenStorage } from '@/utils/storage'
import { uploadApi } from '@/api/upload'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import defaultAvatar from '@/assets/user.jpg'

const router = useRouter()

const userStore = useUserStore()

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const updating = ref(false)
const changingPassword = ref(false)

// 个人信息表单
const profileForm = ref<Partial<UserProfile>>({
  id: 0,
  username: '',
  email: '',
  nickname: '',
  phone: '',
  gender: 0,
  avatar: '',
  roles: [],
  loginIp: '',
  loginDate: '',
  createdAt: '',
  updatedAt: '',
})

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证规则
const profileRules = reactive<FormRules>({
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
})

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

// 上传配置
const uploadAction = computed(() => {
  // 使用相对路径，走 vite 代理
  return import.meta.env.DEV ? '/api/upload/image' : '/api/upload/image'
})

const uploadHeaders = computed(() => {
  const token = tokenStorage.get()
  return {
    Authorization: `Bearer ${token}`,
  }
})

// 加载用户信息
const loadProfile = async () => {
  try {
    const data = await authApi.getProfile() as UserProfile
    profileForm.value = {
      ...data,
      roles: data.roles || [],
    }
    // 更新 store 中的用户信息
    userStore.setUserInfo(data)
  } catch (error: any) {
    ElMessage.error(error?.message || '获取用户信息失败')
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      updating.value = true
      try {
        const updateData: UpdateProfileDto = {
          email: profileForm.value.email,
          nickname: profileForm.value.nickname,
          phone: profileForm.value.phone,
          gender: profileForm.value.gender,
          avatar: profileForm.value.avatar,
        }
        const data = await authApi.updateProfile(updateData) as UserProfile
        profileForm.value = { ...profileForm.value, ...data }
        // 更新 store
        userStore.updateUserInfo(data)
        ElMessage.success('个人信息更新成功')
      } catch (error: any) {
        ElMessage.error(error?.message || '更新失败')
      } finally {
        updating.value = false
      }
    }
  })
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true
      try {
        const data: ChangePasswordDto = {
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        }
        await authApi.changePassword(data)
        ElMessage.success('密码修改成功，请重新登录')
        handleResetPassword()
        // 延迟跳转到登录页
        setTimeout(() => {
          userStore.clearUserInfo()
          tokenStorage.remove()
          router.push('/login')
        }, 1500)
      } catch (error: any) {
        ElMessage.error(error?.message || '密码修改失败')
      } finally {
        changingPassword.value = false
      }
    }
  })
}

// 重置个人信息表单
const handleReset = () => {
  loadProfile()
}

// 重置密码表单
const handleResetPassword = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  passwordFormRef.value?.clearValidate()
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response: any) => {
  // Element Plus Upload 组件使用 action 时，返回的是后端原始响应格式
  // 格式: { code: 200, data: { url, path, ... }, message: 'success' }
  if (response && response.code === 200 && response.data) {
    const uploadData = response.data
    profileForm.value.avatar = uploadData.url || uploadData.path
    ElMessage.success('头像上传成功')
    // 自动保存头像到个人信息
    handleUpdateProfile()
  } else {
    ElMessage.error(response?.message || '头像上传失败')
  }
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '未知'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="less">
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.profile-content {
  .profile-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
}

.profile-form,
.password-form {
  max-width: 800px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;

  .el-avatar {
    border: 2px solid var(--el-border-color);
  }
}

:deep(.el-descriptions) {
  .el-descriptions__label {
    font-weight: 500;
  }
}
</style>

<route lang="json">
{
  "meta": {
    "requiresAuth": true
  }
}
</route>


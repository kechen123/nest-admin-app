<template>
  <div class="login-container">
    <div class="content">
      <Login class="concept" />
      <div class="login">
        <div class="logo">欢迎登录</div>
        <div class="login-form">
          <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
            <el-tab-pane label="账号密码登录" name="first">
              <el-form class="form" ref="ruleFormRef" label-position="left" :model="ruleForm" status-icon
                :rules="rules">
                <el-form-item prop="username">
                  <el-input v-model="ruleForm.username" type="text" autocomplete="off" :prefix-icon="Search" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input v-model="ruleForm.password" type="password" autocomplete="off" :prefix-icon="Calendar"
                    show-password @keyup.enter="submitForm(ruleFormRef)" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="loginSubmit" @click="submitForm(ruleFormRef)"
                    :loading="loading">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="手机号登录" name="second">
              <el-form class="form" ref="ruleFormRef" label-position="left" :model="ruleForm" status-icon
                :rules="rules">
                <el-form-item prop="username">
                  <el-input v-model="ruleForm.username" type="text" autocomplete="off" :prefix-icon="Search"
                    placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input v-model="ruleForm.password" type="password" autocomplete="off" :prefix-icon="Calendar"
                    show-password @keyup.enter="submitForm(ruleFormRef)" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="loginSubmit" @click="submitForm(ruleFormRef)"
                    :loading="loading">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TabsPaneContext, FormInstance, FormRules } from 'element-plus'
import { Calendar, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authApi, type LoginResponse } from '@/api/auth'
import { handleApiError } from '@/utils/http/axios'
import Login from '@/assets/svg/login.svg'
import { useRouterStore } from '@/stores/router'
import { useUserStore } from '@/stores/user'
import { tokenStorage, userStorage, clearAuthStorage } from '@/utils/storage'

const router = useRouter()
const routerStore = useRouterStore()
const userStore = useUserStore()
const ruleFormRef = ref<FormInstance>()
const activeName = ref('first')
const loading = ref(false)

const ruleForm = reactive({
  username: '',
  password: ''
})

const rules = reactive<FormRules<typeof ruleForm>>({
  username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
})

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid: boolean) => {
    if (!valid) {
      console.log('表单验证失败')
      return
    }

    // 使用立即执行函数处理异步
    ; (async () => {
      loading.value = true
      try {
        const res = (await authApi.login(ruleForm)) as unknown as LoginResponse
        // res 已经是 response.data，包含 access_token 和 user
        if (res && res.access_token) {
          // 清除旧的认证信息和菜单数据
          clearAuthStorage()
          routerStore.clearRoles()

          // 保存新的 token 和用户信息
          tokenStorage.set(res.access_token)
          if (res.user) {
            // 保存完整的用户信息
            const userInfo = {
              id: res.user.id,
              username: res.user.username,
              email: res.user.email,
              role: res.user.role,
              roles: res.user.roles || [],
              permissions: res.user.permissions || [],
              nickname: res.user.nickname,
              avatar: res.user.avatar,
              phone: res.user.phone,
              gender: res.user.gender,
            }
            userStorage.set(userInfo)
            // 设置用户信息到 store
            userStore.setUserInfo(userInfo)
          }

          // 初始化菜单
          try {
            await routerStore.initMenu()
          } catch (menuError) {
            console.warn('菜单初始化失败，但不影响登录:', menuError)
          }

          ElMessage.success('登录成功')
          location.href = '/'
        } else {
          ElMessage.error('登录失败：响应数据格式错误')
        }
      } catch (error: any) {
        // 页面自己处理错误，优先使用返回的 message
        // handleApiError 会标记错误为已处理，避免 axios 拦截器重复显示错误提示
        const errorMessage = error?._message || error?.message || '登录失败，请检查用户名和密码'
        handleApiError(error, errorMessage)
      } finally {
        loading.value = false
      }
    })()
  })
}
</script>
<style lang="less" scoped>
.login-container {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: #333;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ebf5 100%);
  display: flex;
  justify-content: center;
  align-items: center;

  .content {
    display: flex;
    gap: 60px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    padding: 50px 60px;

    .concept {
      width: 420px;
      flex-shrink: 0;
    }

    .login {
      width: 360px; // 更紧凑
      background-color: #fff;

      .logo {
        font-size: 26px;
        font-weight: 800;
        color: #2b2b2b;
        letter-spacing: 0.5px;
        margin-bottom: 20px;
      }

      .login-form {
        .tabs {
          --el-font-size-base: 14px;

          :deep(.el-tabs__nav-scroll) {
            justify-content: flex-start; // Tab 居左
          }

          :deep(.el-tabs__active-bar) {
            height: 3px;
            border-radius: 2px;
            background-color: #409eff;
          }
        }

        .form {
          width: 100%;
          margin-top: 20px;

          :deep(.el-input__wrapper) {
            height: 40px;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          :deep(.el-input__wrapper.is-focus) {
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
          }

          .loginSubmit {
            margin-top: 30px;
            width: 100%;
            height: 40px;
            border-radius: 8px;
            font-size: 14px;
            background: linear-gradient(90deg, #409eff, #66b1ff);
            border: none;
            transition: all 0.3s ease;
          }

          .loginSubmit:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 900px) {
  .login-container {
    .content {
      flex-direction: column;
      padding: 40px;

      .concept {
        display: none;
      }

      .login {
        width: 100%;
      }
    }
  }
}
</style>

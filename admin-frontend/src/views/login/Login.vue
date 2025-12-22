<template>
  <div class="login-container">
    <div class="login-box animate-zoom-in">
      <div class="login-header">
        <h2 class="login-title">后台管理系统</h2>
        <p class="login-subtitle">欢迎回来，请登录您的账号</p>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock"
            show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" class="login-button" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为 3-50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await userStore.login({
          username: loginForm.username,
          password: loginForm.password,
        });

        // 登录成功，跳转到之前访问的页面或首页
        const redirect = (route.query.redirect as string) || '/';
        router.push(redirect);
      } catch (error: any) {
        // 提取友好的错误消息
        let errorMessage = '登录失败，请检查用户名和密码';

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          // 过滤掉技术性的错误消息
          const message = error.message;
          if (message.includes('401') || message.includes('Unauthorized')) {
            errorMessage = '用户名或密码错误';
          } else if (message.includes('Network') || message.includes('网络')) {
            errorMessage = '网络连接失败，请检查网络设置';
          } else if (!message.includes('status code') && !message.includes('Request failed')) {
            errorMessage = message;
          }
        }

        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(50px, 50px);
  }
}

.login-box {
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-large;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 72px rgba(0, 0, 0, 0.25);
  }
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.login-title {
  margin-bottom: $spacing-sm;
  color: $text-primary;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: $text-secondary;
  font-size: $font-size-base;
}

.login-form {
  .login-button {
    width: 100%;
    height: 44px;
    font-size: $font-size-base;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.el-input__wrapper) {
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px $primary-color inset;
    }
  }
}
</style>

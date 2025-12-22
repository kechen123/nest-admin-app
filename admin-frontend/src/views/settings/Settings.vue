<template>
  <div class="settings-container">
    <el-card class="animate-fade-in">
      <template #header>
        <span>系统设置</span>
      </template>

      <el-tabs v-model="activeTab" tab-position="left">
        <!-- 主题设置 -->
        <el-tab-pane label="主题设置" name="theme">
          <div class="settings-section">
            <h3>主题模式</h3>
            <el-radio-group v-model="appStore.theme" @change="handleThemeChange">
              <el-radio-button label="light">
                <el-icon>
                  <Sunny />
                </el-icon>
                明亮模式
              </el-radio-button>
              <el-radio-button label="dark">
                <el-icon>
                  <Moon />
                </el-icon>
                暗黑模式
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="settings-section">
            <h3>布局模式</h3>
            <el-radio-group v-model="appStore.layoutMode" @change="handleLayoutChange">
              <el-radio-button label="side">侧边栏布局</el-radio-button>
              <el-radio-button label="top">顶部布局</el-radio-button>
              <el-radio-button label="mix">混合布局</el-radio-button>
            </el-radio-group>
          </div>

          <div class="settings-section">
            <h3>侧边栏设置</h3>
            <el-switch v-model="appStore.sidebarCollapsed" active-text="折叠" inactive-text="展开"
              @change="handleSidebarChange" />
          </div>
        </el-tab-pane>

        <!-- 个人设置 -->
        <el-tab-pane label="个人设置" name="profile">
          <div class="settings-section">
            <h3>个人信息</h3>
            <el-form :model="profileForm" label-width="120px" style="max-width: 600px">
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" />
              </el-form-item>
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile">保存</el-button>
                <el-button @click="handleResetProfile">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="settings-section">
            <h3>修改密码</h3>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px"
              style="max-width: 600px">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 系统信息 -->
        <el-tab-pane label="系统信息" name="system">
          <div class="settings-section">
            <h3>系统版本</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="系统名称">后台管理系统</el-descriptions-item>
              <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
              <el-descriptions-item label="构建时间">2024-01-15</el-descriptions-item>
              <el-descriptions-item label="Vue版本">3.3.4</el-descriptions-item>
              <el-descriptions-item label="Element Plus版本">2.4.4</el-descriptions-item>
              <el-descriptions-item label="TypeScript版本">5.2.2</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { Sunny, Moon } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';

const appStore = useAppStore();
const userStore = useUserStore();

const activeTab = ref('theme');
const passwordFormRef = ref<FormInstance>();

const profileForm = reactive({
  username: userStore.userInfo?.username || '',
  email: userStore.userInfo?.email || '',
  nickname: '',
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const handleThemeChange = (theme: 'light' | 'dark') => {
  appStore.setTheme(theme);
  ElMessage.success(`已切换到${theme === 'light' ? '明亮' : '暗黑'}模式`);
};

const handleLayoutChange = (mode: 'side' | 'top' | 'mix') => {
  appStore.setLayoutMode(mode);
  ElMessage.success('布局模式已更新');
};

const handleSidebarChange = (collapsed: boolean) => {
  appStore.setSidebarCollapsed(collapsed);
};

const handleSaveProfile = () => {
  ElMessage.success('个人信息保存成功');
};

const handleResetProfile = () => {
  profileForm.email = userStore.userInfo?.email || '';
  profileForm.nickname = '';
};

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功');
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      passwordFormRef.value?.resetFields();
    }
  });
};
</script>

<style scoped lang="scss">
.settings-container {
  .settings-section {
    margin-bottom: $spacing-xl;

    h3 {
      margin-bottom: $spacing-md;
      font-size: $font-size-large;
      color: var(--text-primary);
    }
  }

  :deep(.el-tabs) {
    .el-tabs__content {
      padding-left: $spacing-lg;
    }
  }
}
</style>

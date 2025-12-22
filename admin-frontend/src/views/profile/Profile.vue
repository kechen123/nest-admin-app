<template>
  <div class="profile-container">
    <el-card class="animate-fade-in">
      <template #header>
        <span>个人中心</span>
      </template>

      <div class="profile-content">
        <div class="profile-avatar">
          <el-avatar :size="120" :icon="UserFilled" />
          <h2>{{ userStore.userInfo?.username }}</h2>
          <p>{{ userStore.userInfo?.email }}</p>
        </div>

        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="基本信息" name="info">
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
                <el-button type="primary" @click="handleSave">保存</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="安全设置" name="security">
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
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { UserFilled } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const activeTab = ref('info');
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

const handleSave = () => {
  ElMessage.success('保存成功');
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
.profile-container {
  .profile-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xl;
  }

  .profile-avatar {
    text-align: center;

    h2 {
      margin: $spacing-md 0 $spacing-xs;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
    }
  }

  .profile-tabs {
    width: 100%;
    max-width: 800px;
  }
}
</style>

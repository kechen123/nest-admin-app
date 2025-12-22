<template>
  <div class="user-list-container">
    <el-card class="animate-fade-in">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <PermissionButton v-if="selectedRows.length > 0" type="danger" :permission="'user:delete'"
              @click="handleBatchDelete">
              批量删除 ({{ selectedRows.length }})
            </PermissionButton>
            <PermissionButton type="primary" :permission="'user:create'" @click="handleCreate">
              <el-icon>
                <Plus />
              </el-icon>
              新增用户
            </PermissionButton>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable style="width: 150px">
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <SkeletonTable :loading="loading" :rows="5" :columns="8">
        <el-table :data="userList" v-loading="loading" stripe @selection-change="handleSelectionChange"
          class="user-table">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="id" label="ID" width="80" sortable align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" sortable show-overflow-tooltip />
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.nickname || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="role" label="角色" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
                {{ row.role === 'admin' ? '管理员' : '用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status ? 'success' : 'danger'" size="small">
                {{ row.status ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" link @click="handlePreview(row)">
                  <el-icon>
                    <View />
                  </el-icon>
                  查看
                </el-button>
                <PermissionButton type="primary" link :permission="'user:update'" @click="handleEdit(row)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </PermissionButton>
                <PermissionButton type="danger" link :permission="'user:delete'" @click="handleDelete(row)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </PermissionButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </SkeletonTable>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 数据预览对话框 -->
    <DataPreview v-model="previewVisible" title="用户详情" :data="previewData" :fields="previewFields" />

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :before-close="handleDialogClose">
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px" @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password clearable />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-switch v-model="userForm.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  Delete,
} from '@element-plus/icons-vue';
import { userApi, User, QueryUserParams, CreateUserDto, UpdateUserDto } from '@/api/user';
import { useTable } from '@/hooks/useTable';
import PermissionButton from '@/components/PermissionButton/PermissionButton.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import DataPreview from '@/components/DataPreview/DataPreview.vue';
import { formatDateTime } from '@/utils/format';
import { isValidEmail } from '@/utils/validate';

const searchForm = reactive<QueryUserParams>({
  username: '',
  email: '',
  role: '',
});

const selectedRows = ref<User[]>([]);
const previewVisible = ref(false);
const previewData = ref<User>({} as User);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const userFormRef = ref<FormInstance>();

const userForm = reactive<CreateUserDto & UpdateUserDto & { status?: boolean }>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  role: 'user',
  status: true,
});

const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'));

const userFormRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为 3-50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && !isValidEmail(value)) {
          callback(new Error('请输入正确的邮箱格式'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  password: isEdit.value
    ? [
      { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
    ]
    : [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
    ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
}));

const previewFields = [
  { prop: 'id', label: 'ID' },
  { prop: 'username', label: '用户名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'nickname', label: '昵称' },
  {
    prop: 'role',
    label: '角色',
    type: 'tag',
    formatter: (value: string) => (value === 'admin' ? '管理员' : '用户'),
  },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    formatter: (value: boolean) => (value ? '启用' : '禁用'),
  },
  { prop: 'createdAt', label: '创建时间', type: 'date' },
];

const { loading, tableData: userList, pagination, getTableData, handlePageChange, handleSizeChange, refresh } = useTable<User>({
  fetchData: async (params) => {
    const response = await userApi.getUserList(params as QueryUserParams);
    return {
      list: response.list,
      total: response.total,
    };
  },
  immediate: false,
});

// 获取用户列表
const fetchUserList = async () => {
  await getTableData(searchForm);
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchUserList();
};

// 重置
const handleReset = () => {
  searchForm.username = '';
  searchForm.email = '';
  searchForm.role = '';
  handleSearch();
};

// 选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection;
};

// 预览数据
const handlePreview = (row: User) => {
  previewData.value = { ...row };
  previewVisible.value = true;
};

// 重置表单
const resetForm = () => {
  userForm.username = '';
  userForm.email = '';
  userForm.password = '';
  userForm.nickname = '';
  userForm.role = 'user';
  userForm.status = true;
  currentEditId.value = null;
  userFormRef.value?.resetFields();
};

// 新增用户
const handleCreate = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = async (row: User) => {
  isEdit.value = true;
  currentEditId.value = row.id;
  resetForm();

  try {
    const userDetail = await userApi.getUserById(row.id);
    userForm.username = userDetail.username;
    userForm.email = userDetail.email;
    userForm.nickname = userDetail.nickname || '';
    userForm.role = userDetail.role;
    userForm.status = userDetail.status;
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户详情失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value && currentEditId.value) {
          // 编辑用户
          const updateData: UpdateUserDto = {
            email: userForm.email,
            nickname: userForm.nickname,
            role: userForm.role,
            status: userForm.status,
          };
          await userApi.updateUser(currentEditId.value, updateData);
          ElMessage.success('编辑成功');
        } else {
          // 新增用户
          const createData: CreateUserDto = {
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            nickname: userForm.nickname,
            role: userForm.role,
          };
          await userApi.createUser(createData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        fetchUserList();
      } catch (error: any) {
        ElMessage.error(error.message || (isEdit.value ? '编辑失败' : '新增失败'));
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    await userApi.deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的用户');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    // 批量删除
    const deletePromises = selectedRows.value.map((user) =>
      userApi.deleteUser(user.id),
    );
    await Promise.all(deletePromises);

    ElMessage.success('批量删除成功');
    selectedRows.value = [];
    fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.user-list-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .search-form {
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: var(--bg-color-page);
    border-radius: $border-radius-large;

    :deep(.el-form-item) {
      margin-bottom: $spacing-md;
    }
  }

  .user-table {
    :deep(.el-table__header) {
      th {
        background-color: var(--bg-color-page);
        color: var(--text-primary);
        font-weight: 600;
      }
    }

    :deep(.el-table__body) {
      tr {
        transition: all 0.3s;

        &:hover {
          background-color: var(--bg-color-page);
          transform: scale(1.01);
        }
      }

      td {
        padding: $spacing-md 0;
      }
    }

    .action-buttons {
      display: flex;
      gap: $spacing-xs;
      justify-content: center;
      flex-wrap: wrap;

      .el-button {
        margin: 0;
        padding: $spacing-xs $spacing-sm;
      }
    }
  }

  .pagination-container {
    margin-top: $spacing-lg;
    display: flex;
    justify-content: flex-end;
    padding: $spacing-md 0;
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  border-radius: $border-radius-large;

  .el-dialog__header {
    padding: $spacing-lg;
    border-bottom: 1px solid var(--border-lighter);
  }

  .el-dialog__body {
    padding: $spacing-lg;
  }

  .el-dialog__footer {
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid var(--border-lighter);
  }
}
</style>

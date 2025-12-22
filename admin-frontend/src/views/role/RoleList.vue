<template>
  <div class="role-list-container">
    <el-card class="animate-fade-in">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <PermissionButton type="primary" :permission="'role:create'" @click="handleCreate">
            <el-icon>
              <Plus />
            </el-icon>
            新增角色
          </PermissionButton>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色代码">
          <el-input v-model="searchForm.code" placeholder="请输入角色代码" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
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

      <!-- 角色表格 -->
      <SkeletonTable :loading="loading" :rows="5" :columns="5">
        <el-table :data="roleList" v-loading="loading" stripe @selection-change="handleSelectionChange"
          class="role-table">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="id" label="ID" width="80" sortable align="center" />
          <el-table-column prop="name" label="角色名称" min-width="150" sortable show-overflow-tooltip />
          <el-table-column prop="code" label="角色代码" min-width="150" show-overflow-tooltip />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.description || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="权限数量" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.permissions && row.permissions.length > 0" type="success" size="small">
                {{ Array.isArray(row.permissions) ? row.permissions.length : (typeof row.permissions[0] === 'object' ?
                  row.permissions.length : 0) }}
              </el-tag>
              <span v-else style="color: var(--el-text-color-placeholder)">0</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <PermissionButton type="primary" link :permission="'role:assign'" @click="handleAssignPermissions(row)">
                  <el-icon>
                    <Key />
                  </el-icon>
                  分配权限
                </PermissionButton>
                <PermissionButton type="primary" link :permission="'role:edit'" @click="handleEdit(row)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </PermissionButton>
                <PermissionButton type="danger" link :permission="'role:delete'" @click="handleDelete(row)">
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :before-close="handleDialogClose">
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码，如: admin" clearable />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" clearable />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-tree ref="roleFormPermissionTreeRef" :data="permissionTreeData"
            :props="{ label: 'name', children: 'children' }" show-checkbox node-key="id" :default-expand-all="false"
            :default-checked-keys="roleForm.permissions || []"
            style="max-height: 300px; overflow-y: auto; border: 1px solid var(--el-border-color-light); padding: 10px; border-radius: 4px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配权限" width="700px" :before-close="handleAssignDialogClose">
      <el-tree ref="permissionTreeRef" :data="permissionTreeData" :props="{ label: 'name', children: 'children' }"
        show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="checkedPermissionIds" />
      <template #footer>
        <el-button @click="handleAssignDialogClose">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="handleAssignSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus, Search, Refresh, Edit, Delete, Key } from '@element-plus/icons-vue';
import { roleApi, Role, CreateRoleDto, UpdateRoleDto, QueryRoleParams } from '@/api/role';
import { permissionApi, Permission } from '@/api/permission';
import { useTable } from '@/hooks/useTable';
import PermissionButton from '@/components/PermissionButton/PermissionButton.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import { formatDateTime } from '@/utils/format';

const searchForm = reactive<QueryRoleParams>({
  name: '',
  code: '',
});

const selectedRows = ref<Role[]>([]);
const dialogVisible = ref(false);
const assignDialogVisible = ref(false);
const submitLoading = ref(false);
const assignLoading = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const currentAssignRoleId = ref<number | null>(null);
const roleFormRef = ref<FormInstance>();
const permissionTreeRef = ref<any>();
const roleFormPermissionTreeRef = ref<any>();
const permissionTreeData = ref<Permission[]>([]);
const checkedPermissionIds = ref<number[]>([]);

const roleForm = reactive<CreateRoleDto & { permissions?: number[] }>({
  name: '',
  code: '',
  description: '',
  permissions: [],
});

const dialogTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'));

const roleFormRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色代码', trigger: 'blur' }],
};

const { loading, tableData: roleList, pagination, getTableData, handlePageChange, handleSizeChange } = useTable<Role>({
  fetchData: async (params) => {
    const response = await roleApi.getRoleList(params as QueryRoleParams);
    return {
      list: response.list,
      total: response.total,
    };
  },
  immediate: false,
});

// 获取角色列表
const fetchRoleList = async () => {
  await getTableData(searchForm);
};

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const tree = await permissionApi.getPermissionTree();
    permissionTreeData.value = tree;
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限树失败');
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchRoleList();
};

// 重置
const handleReset = () => {
  searchForm.name = '';
  searchForm.code = '';
  handleSearch();
};

// 选择变化
const handleSelectionChange = (selection: Role[]) => {
  selectedRows.value = selection;
};

// 重置表单
const resetForm = () => {
  roleForm.name = '';
  roleForm.code = '';
  roleForm.description = '';
  currentEditId.value = null;
  roleFormRef.value?.resetFields();
};

// 新增角色
const handleCreate = async () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;

  // 等待DOM更新后清空权限树选择
  await nextTick();
  if (roleFormPermissionTreeRef.value) {
    roleFormPermissionTreeRef.value.setCheckedKeys([]);
  }
};

// 编辑角色
const handleEdit = async (row: Role) => {
  isEdit.value = true;
  currentEditId.value = row.id;
  resetForm();

  try {
    const detail = await roleApi.getRoleById(row.id);
    roleForm.name = detail.name;
    roleForm.code = detail.code;
    roleForm.description = detail.description || '';

    // 处理权限ID
    if (detail.permissions && detail.permissions.length > 0) {
      if (typeof detail.permissions[0] === 'object') {
        roleForm.permissions = (detail.permissions as Permission[]).map(p => p.id);
      } else {
        roleForm.permissions = detail.permissions as number[];
      }
    } else {
      roleForm.permissions = [];
    }

    dialogVisible.value = true;

    // 等待DOM更新后设置权限树选中状态
    await nextTick();
    if (roleFormPermissionTreeRef.value && roleForm.permissions) {
      roleFormPermissionTreeRef.value.setCheckedKeys(roleForm.permissions);
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色详情失败');
  }
};

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await roleApi.deleteRole(row.id);
    ElMessage.success('删除成功');
    fetchRoleList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 分配权限
const handleAssignPermissions = async (row: Role) => {
  currentAssignRoleId.value = row.id;
  checkedPermissionIds.value = [];

  try {
    const detail = await roleApi.getRoleById(row.id);
    if (detail.permissions && detail.permissions.length > 0) {
      // 处理权限可能是对象数组或ID数组的情况
      if (typeof detail.permissions[0] === 'object') {
        checkedPermissionIds.value = (detail.permissions as Permission[]).map(p => p.id);
      } else {
        checkedPermissionIds.value = detail.permissions as number[];
      }
    }
    assignDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色权限失败');
  }
};

// 提交分配权限
const handleAssignSubmit = async () => {
  if (!permissionTreeRef.value || !currentAssignRoleId.value) return;

  assignLoading.value = true;
  try {
    const checkedKeys = permissionTreeRef.value.getCheckedKeys();
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys();
    const allKeys = [...checkedKeys, ...halfCheckedKeys];

    await roleApi.assignPermissions(currentAssignRoleId.value, allKeys);
    ElMessage.success('分配权限成功');
    handleAssignDialogClose();
    fetchRoleList();
  } catch (error: any) {
    ElMessage.error(error.message || '分配权限失败');
  } finally {
    assignLoading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return;

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 获取选中的权限ID
        let permissionIds: number[] = [];
        if (roleFormPermissionTreeRef.value) {
          const checkedKeys = roleFormPermissionTreeRef.value.getCheckedKeys();
          const halfCheckedKeys = roleFormPermissionTreeRef.value.getHalfCheckedKeys();
          // 只使用完全选中的权限，不包括半选中的父节点
          permissionIds = checkedKeys;
        }

        if (isEdit.value && currentEditId.value) {
          const updateData: UpdateRoleDto = {
            name: roleForm.name,
            code: roleForm.code,
            description: roleForm.description,
            permissions: permissionIds,
          };
          await roleApi.updateRole(currentEditId.value, updateData);
          ElMessage.success('编辑成功');
        } else {
          const createData: CreateRoleDto = {
            name: roleForm.name,
            code: roleForm.code,
            description: roleForm.description,
            permissions: permissionIds,
          };
          await roleApi.createRole(createData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        fetchRoleList();
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

// 关闭分配权限对话框
const handleAssignDialogClose = () => {
  assignDialogVisible.value = false;
  currentAssignRoleId.value = null;
  checkedPermissionIds.value = [];
};

onMounted(() => {
  fetchRoleList();
  fetchPermissionTree();
});
</script>

<style scoped lang="scss">
.role-list-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: var(--bg-color-page);
    border-radius: $border-radius-large;
  }

  .role-table {
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
        }
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
</style>

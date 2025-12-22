<template>
  <div class="permission-list-container">
    <el-card class="animate-fade-in">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <PermissionButton type="primary" :permission="'permission:create'" @click="handleCreate">
            <el-icon>
              <Plus />
            </el-icon>
            新增权限
          </PermissionButton>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="权限名称">
          <el-input v-model="searchForm.name" placeholder="请输入权限名称" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="权限代码">
          <el-input v-model="searchForm.code" placeholder="请输入权限代码" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="API" value="api" />
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

      <!-- 权限树形表格 -->
      <SkeletonTable :loading="loading" :rows="5" :columns="6">
        <el-table :data="permissionList" v-loading="loading" stripe row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" class="permission-table"
          default-expand-all>
          <el-table-column prop="name" label="权限名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="code" label="权限代码" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路径" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.path || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" sortable />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <PermissionButton type="primary" link :permission="'permission:edit'" @click="handleEdit(row)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </PermissionButton>
                <PermissionButton type="danger" link :permission="'permission:delete'" @click="handleDelete(row)">
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
    </el-card>

    <!-- 新增/编辑权限对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :before-close="handleDialogClose">
      <el-form ref="permissionFormRef" :model="permissionForm" :rules="permissionFormRules" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" clearable />
        </el-form-item>
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限代码，如: user:create" clearable />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="父级权限" prop="parentId">
          <el-cascader v-model="permissionForm.parentId" :options="permissionTreeOptions"
            :props="{ label: 'name', value: 'id', children: 'children', checkStrictly: true, emitPath: false }"
            placeholder="请选择父级权限（可选）" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入路由路径（菜单类型必填）" clearable />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="permissionForm.icon" placeholder="请输入图标名称" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue';
import { permissionApi, Permission, CreatePermissionDto, UpdatePermissionDto } from '@/api/permission';
import PermissionButton from '@/components/PermissionButton/PermissionButton.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';

const loading = ref(false);
const permissionList = ref<Permission[]>([]);
const permissionTreeOptions = ref<Permission[]>([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const permissionFormRef = ref<FormInstance>();

const searchForm = reactive({
  name: '',
  code: '',
  type: '',
});

const permissionForm = reactive<CreatePermissionDto & { parentId?: number; sort?: number }>({
  name: '',
  code: '',
  type: 'menu',
  parentId: undefined,
  path: '',
  icon: '',
  sort: 0,
});

const dialogTitle = computed(() => (isEdit.value ? '编辑权限' : '新增权限'));

const permissionFormRules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限代码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

// 获取类型标签
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    api: 'API',
  };
  return typeMap[type] || type;
};

// 获取类型标签颜色
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    menu: 'primary',
    button: 'success',
    api: 'info',
  };
  return typeMap[type] || 'info';
};

// 递归转换权限树为级联选择器格式
const transformPermissionTree = (tree: Permission[]): any[] => {
  return tree.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    children: item.children && item.children.length > 0 ? transformPermissionTree(item.children) : undefined,
  }));
};

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const tree = await permissionApi.getPermissionTree();
    permissionTreeOptions.value = transformPermissionTree(tree);
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限树失败');
  }
};

// 原始权限树数据
const originalPermissionList = ref<Permission[]>([]);

// 过滤权限树
const filterPermissionTree = (tree: Permission[], searchForm: any): Permission[] => {
  if (!searchForm.name && !searchForm.code && !searchForm.type) {
    return tree;
  }

  const filterNode = (node: Permission): Permission | null => {
    // 检查当前节点是否匹配
    const nameMatch = !searchForm.name || node.name.toLowerCase().includes(searchForm.name.toLowerCase());
    const codeMatch = !searchForm.code || node.code.toLowerCase().includes(searchForm.code.toLowerCase());
    const typeMatch = !searchForm.type || node.type === searchForm.type;

    const nodeMatches = nameMatch && codeMatch && typeMatch;

    // 递归过滤子节点
    let filteredChildren: Permission[] = [];
    if (node.children && node.children.length > 0) {
      filteredChildren = node.children
        .map(child => filterNode(child))
        .filter((child): child is Permission => child !== null);
    }

    // 如果当前节点匹配或有匹配的子节点，则保留
    if (nodeMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      };
    }

    return null;
  };

  return tree.map(node => filterNode(node)).filter((node): node is Permission => node !== null);
};

// 获取权限列表
const fetchPermissionList = async () => {
  loading.value = true;
  try {
    const tree = await permissionApi.getPermissionTree();
    originalPermissionList.value = tree;
    permissionList.value = filterPermissionTree(tree, searchForm);
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  if (originalPermissionList.value.length > 0) {
    permissionList.value = filterPermissionTree(originalPermissionList.value, searchForm);
  } else {
    fetchPermissionList();
  }
};

// 重置
const handleReset = () => {
  searchForm.name = '';
  searchForm.code = '';
  searchForm.type = '';
  if (originalPermissionList.value.length > 0) {
    permissionList.value = originalPermissionList.value;
  } else {
    handleSearch();
  }
};

// 重置表单
const resetForm = () => {
  permissionForm.name = '';
  permissionForm.code = '';
  permissionForm.type = 'menu';
  permissionForm.parentId = undefined;
  permissionForm.path = '';
  permissionForm.icon = '';
  permissionForm.sort = 0;
  currentEditId.value = null;
  permissionFormRef.value?.resetFields();
};

// 新增权限
const handleCreate = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑权限
const handleEdit = async (row: Permission) => {
  isEdit.value = true;
  currentEditId.value = row.id;
  resetForm();

  try {
    const detail = await permissionApi.getPermissionById(row.id);
    permissionForm.name = detail.name;
    permissionForm.code = detail.code;
    permissionForm.type = detail.type;
    permissionForm.parentId = detail.parentId;
    permissionForm.path = detail.path || '';
    permissionForm.icon = detail.icon || '';
    permissionForm.sort = detail.sort;
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限详情失败');
  }
};

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await permissionApi.deletePermission(row.id);
    ElMessage.success('删除成功');
    fetchPermissionList();
    fetchPermissionTree();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return;

  await permissionFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value && currentEditId.value) {
          const updateData: UpdatePermissionDto = {
            name: permissionForm.name,
            code: permissionForm.code,
            type: permissionForm.type,
            parentId: permissionForm.parentId,
            path: permissionForm.path,
            icon: permissionForm.icon,
            sort: permissionForm.sort,
          };
          await permissionApi.updatePermission(currentEditId.value, updateData);
          ElMessage.success('编辑成功');
        } else {
          const createData: CreatePermissionDto = {
            name: permissionForm.name,
            code: permissionForm.code,
            type: permissionForm.type,
            parentId: permissionForm.parentId,
            path: permissionForm.path,
            icon: permissionForm.icon,
            sort: permissionForm.sort,
          };
          await permissionApi.createPermission(createData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        fetchPermissionList();
        fetchPermissionTree();
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

onMounted(() => {
  fetchPermissionList();
  fetchPermissionTree();
});
</script>

<style scoped lang="scss">
.permission-list-container {
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
  }

  .permission-table {
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
}
</style>

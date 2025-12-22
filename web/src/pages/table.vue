<template>
  <div class="container">
    <TableSearch :typeList="typeList" :statusList="statusList" @getPageData="getPageData" />
    <el-card class="tableCard">
      <div class="tool">
        <el-button icon="Plus" type="primary" @click="createBtnClick">新增</el-button>
        <el-popconfirm title="确定删除吗?" @confirm="delList()">
          <template #reference>
            <el-button icon="DeleteFilled" type="danger" :disabled="selectionData.length == 0">批量删除</el-button>
          </template>
        </el-popconfirm>
      </div>
      <el-table :data="tableData" :key="pagination.total" stripe table-layout="auto"
        @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" align="center" fixed />
        <el-table-column fixed prop="name" label="名称" width="100" />
        <el-table-column fixed prop="age" label="年龄" width="100" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />
        <el-table-column prop="create_user" label="创建人" width="100" />
        <el-table-column prop="update_time" label="更新时间" width="200" />
        <el-table-column prop="create_time" label="创建时间" width="200" />
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="scope">
            <div class="operate">
              <el-icon @click="editBtnClick(scope.row)" style="color: #409eff;">
                <MIcon iconName="EditPen" />
              </el-icon>
              <el-popconfirm title="确定删除吗?" @confirm="del(scope.row.id)">
                <template #reference>
                  <el-icon style="color:#e61414">
                    <MIcon iconName="Delete" />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, sizes, prev, pager, next, jumper" :page-sizes="pageSizes"
          :total="pagination.total" :default-page-size="pagination.size" @current-change="currentChange"
          @size-change="handleSizeChange" />
      </div>
    </el-card>

    <el-dialog v-model="dialogTableVisible" :title="formId == '' ? '新增' : '编辑'">
      <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="120px" style="max-width: 400px;">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="formData.age" controls-position="right" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="btnLoading" @click="saveBtnClick(ruleFormRef)">保存</el-button>
          <el-button @click="dialogTableVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { useTable, usePagination, Pagination, TableDataType, Option, Form } from '@/hooks/useTable'
const typeList = ref<Option[]>([])
const statusList = ref<Option[]>([])
const tableData = ref<TableDataType[]>([])
const selectionData = ref<TableDataType[]>([])
const pagination = reactive<Pagination>({
  page: 1,
  size: 10,
  total: 0
})
const formId = ref('')
const formData = ref<Form>({
  name: '',
  type: '',
  email: '',
  status: '',
  address: '',
  age: 0,
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<Form>>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }]
})
const dialogTableVisible = ref(false) // 弹窗显示隐藏
const btnLoading = ref(false) // 按钮loading

onMounted(() => {
  getPageData()
  getTypeList()
  getStatusList()
})

const {
  getPageData,
  getTypeList,
  getStatusList,
  addTableData,
  editTableData,
  deleteTableData,
  deleteTableByIds
} = useTable(tableData, typeList, statusList, pagination)
const { pageSizes, currentChange, handleSizeChange } = usePagination(getPageData, pagination)

const handleSelectionChange = (val: TableDataType[]) => {
  selectionData.value = val
}

const createBtnClick = () => {
  dialogTableVisible.value = true
  formId.value = ''
}

const editBtnClick = (row: TableDataType) => {
  const data: Form = {
    name: row.name,
    type: row.type_id,
    email: row.email,
    status: row.status_id,
    address: row.address,
    age: row.age,
  }
  formData.value = data
  dialogTableVisible.value = true
  formId.value = row.id
}

const saveBtnClick = async (formEl: any) => {
  console.log(formData)
  if (!formEl) return
  btnLoading.value = true
  await formEl.validate((valid: any) => {
    if (valid) {
      if (formId.value == '') {
        addTableData(formData.value).then((res) => {
          if (res) {
            ElMessage.success('新增成功')
            getPageData()
            btnLoading.value = false
            dialogTableVisible.value = false
          }
        })
      } else {
        editTableData(formId.value, formData.value).then((res) => {
          if (res) {
            ElMessage.success('编辑成功')
            getPageData()
            btnLoading.value = false
            dialogTableVisible.value = false
          }
        })
      }

    }
  })
}

const del = async (id: string) => {
  const res = await deleteTableData(id)
  if (res) {
    ElMessage.success('删除成功')
    getPageData()
  } else {
    ElMessage.error('删除失败')
  }
}

const delList = async () => {
  const ids = selectionData.value.map((item) => item.id)
  const res = await deleteTableByIds(ids.join(','))
  if (res) {
    ElMessage.success('删除成功')
    getPageData()
  } else {
    ElMessage.error('删除失败')
  }
}

</script>

<style scoped lang="less">
.container {
  .tableCard {
    margin-top: 20px;

    .tool {
      display: flex;
      margin-bottom: 10px;
    }

    .operate {
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
    }
  }

}
</style>
